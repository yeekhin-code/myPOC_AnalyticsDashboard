---
name: authenticating-foundry-apps
description: Authentication patterns for HCL Foundry services from Swagger API documentation - handling Identity services and fallback authentication with claims tokens
---

# Authenticating Foundry Apps from Swagger API Documentation

Generate authentication code for HCL Foundry services using Swagger/OpenAPI JSON documentation.

## Default Authentication Policy

**⛔ CRITICAL: ALL FOUNDRY APPS REQUIRE AUTHENTICATION ⛔**

**Authentication is MANDATORY for all Foundry applications.** Every Foundry service call requires authentication headers, therefore every app must have a login flow to obtain a claims token.

### Authentication Selection Logic:

**Determine which authentication to use based on user intent and available identity services:**

#### 1. User Explicitly Requests Specific Identity Service
**IF user specifies which identity service to use** (by name or type):
- Parse the requested Identity Service Swagger to determine authentication type
- Generate appropriate authentication client and login UI:
  - **OAuth providers** (Google, Facebook, Salesforce, etc.) → Redirect button (NO username/password form)
  - **SAML providers** → Redirect button (NO username/password form)
  - **Username/password providers** (LDAP, Active Directory, Custom Userstore) → Username/password form
- Follow the detailed patterns in this skill for the specific identity type
- **Examples**: "Use DavekLDAPIdentity", "Use OAuth provider", "Use SAML for authentication"

#### 2. User Doesn't Specify AND Exactly 1 Identity Service Exists
**IF user doesn't specify which identity service AND only one custom identity service is in Swagger:**
- Use that identity service automatically (unambiguous choice)
- Parse it to determine authentication type and generate appropriate client/UI
- This assumes the user wants to use the only available custom identity service

#### 3. User Doesn't Specify AND Multiple or Zero Identity Services
**IF user doesn't specify AND (multiple identity services exist OR no identity services exist):**
- **Use Foundry Accounts fallback authentication** (DEFAULT CASE - MOST COMMON)
- Generate FoundryAccountsClient (Option B in this skill)
- Generate username/password login form
- Use `/authService/accounts/login` endpoint (always available in Foundry)
- This is the **standard default authentication** mechanism
- **Rationale**:
  - Multiple identity services = ambiguous which one to use → default to safe option
  - No identity services = app wasn't configured with custom auth → use built-in Foundry Accounts
  - Foundry Accounts has no external dependencies (LDAP servers, OAuth providers, etc.)

### Key Principles:
- **Authentication is NEVER optional** - all Foundry apps require authentication
- **Finding zero Identity Service files is NORMAL** - it means use Foundry Accounts (built-in)
- **Finding multiple Identity Services without user guidance** → default to Foundry Accounts (safe fallback)
- **Finding exactly one Identity Service without user guidance** → use it (unambiguous)

**DO NOT skip authentication generation** regardless of what you find (or don't find) in the Swagger export.

---

## 🛑 PHASE 0: CHECK EXISTING AUTH AND ENFORCE GENERATION 🛑

**⚠️ THIS MUST BE YOUR FIRST ACTION WHEN THIS SKILL IS INVOKED ⚠️**

Before reading any further in this skill, you MUST perform this check:

### Step 0.1: Check if Authentication Already Exists

Check for existing authentication infrastructure in the project:

```bash
# Check for authentication-related files
find src -name "*Auth*" -o -name "*auth*" -o -name "*Login*" -o -name "*login*"

# Check for key authentication patterns
grep -r "AuthContext\|AuthProvider\|useAuth\|claims_token" src/ 2>/dev/null

# Check for VITE_FOUNDRY_AUTH_HOST in .env
grep "VITE_FOUNDRY_AUTH_HOST" .env 2>/dev/null
```

**Indicators that authentication EXISTS:**
- ✅ `src/contexts/AuthContext.tsx` or similar auth context file exists
- ✅ `src/pages/LoginPage.tsx` or similar login component exists
- ✅ `src/services/foundry/identity/` directory exists with identity client
- ✅ `.env` contains `VITE_FOUNDRY_AUTH_HOST`
- ✅ Code contains `AuthProvider`, `useAuth()`, or `claims_token` references

**If ANY of the above exist, authentication is already implemented.**

### Step 0.2: Decide Whether to Generate Authentication

**Decision Tree:**

1. **Authentication EXISTS + User explicitly asks to replace it**
   - Examples: "Replace the authentication with LDAP", "Switch to OAuth authentication"
   - **Action**: Generate new authentication (overwrite existing)
   - **Continue**: Proceed to Step 1 of this skill

2. **Authentication EXISTS + User did NOT ask to replace**
   - Examples: "Add employee management", "Integrate EmployeeObjectSchema service"
   - **Action**: Skip authentication generation (use existing auth)
   - **Return**: Inform user that existing authentication will be used
   - **Stop**: Do NOT proceed further in this skill

3. **Authentication DOES NOT EXIST**
   - This is the standard case for new Foundry integrations
   - **Action**: MANDATORY - Generate authentication NOW
   - **Continue**: Proceed to Step 1 of this skill
   - **You MUST complete ALL steps and generate ALL authentication code**

### Step 0.3: Enforcement for Case 3 (No Existing Auth)

**🛑 IF authentication does NOT exist, you CANNOT return without generating it 🛑**

When authentication doesn't exist, you MUST generate:
- ✅ Authentication client (Identity client OR FoundryAccountsClient)
- ✅ Login page component with form/redirect UI
- ✅ Auth context provider (AuthContext + AuthProvider)
- ✅ Protected route component
- ✅ `.env` with `VITE_FOUNDRY_AUTH_HOST`
- ✅ `foundry.config.ts` with `authHost`

**This skill is NOT reference documentation to "consult later".**

**If you invoke this skill and authentication doesn't exist, you are COMMITTING to generate it RIGHT NOW.**

**Returning without generating authentication when it doesn't exist = FAILURE.**

---

## Critical Authentication Rules

### Headers (Exact Names)
```typescript
'X-Voltmx-Authorization': claimsToken    // Claims token from login
'X-Voltmx-App-Key': appKey               // App key from Foundry
'X-Voltmx-App-Secret': appSecret         // App secret from Foundry
```

### Claims Token Response
All authentication endpoints return claims token:
```typescript
{
  "claims_token": {
    "value": "eyJhbGc...",     // This is the claims token
    "exp": 1234567890
  },
  // ... other fields
}
```

**CRITICAL:** Store `claims_token.value` and use it in `X-Voltmx-Authorization` header for all authenticated service calls.

### Authentication Type Adherence

⛔ **CRITICAL RULE - NEVER VIOLATE** ⛔

**ALWAYS implement the EXACT authentication type the user requested.**

**NEVER substitute a different authentication type,** even if you think it's:
- "Simpler"
- "More practical"
- "Easier to implement"
- "Better for this use case"

**Examples of UNACCEPTABLE substitution:**
- User asks for OAuth → You implement username/password because it's "simpler"
- User asks for SAML → You implement custom userstore because it's "more practical"
- User asks for LDAP → You implement OAuth because it's "more modern"

**If user requests OAuth, you MUST implement OAuth. Period.**

**Foundry supports 15+ identity service types:**
- Microsoft Active Directory
- Open LDAP
- Salesforce
- SAML
- OAuth 2.0 (Google, LinkedIn, Instagram, Amazon, Yahoo, Facebook, BOX, etc.)
- SAP Gateway
- Okta
- Microsoft
- Custom User Repository
- Siteminder
- Infinity Spotlight
- OAuth Provider (generic)
- And more...

**All types are equally valid.** Implement what the user requested.

## Step 1: Identify and Select Identity Service from Swagger

⛔ **MANDATORY FIRST STEP** ⛔

### Step 1.1: Scan for Available Identity Services

Scan Swagger JSON files to identify all Identity services:

```bash
# Find all Identity service Swagger files
for file in *.json; do
  basePath=$(jq -r '.basePath // empty' "$file")
  if [[ "$basePath" == /authService/* ]]; then
    echo "Found Identity Service: $file"
    jq -r '.info.title' "$file"
  fi
done
```

**Identity Service Identification:**
- `basePath` starts with `/authService/` (e.g., `/authService/100000002`)
- Contains authentication paths: `/login`, `/oauth2/login`, `/oauth2/token`
- Definitions include `loginRequestParams`, `loginResponseParams`, `claims_token`

**⚠️ SPECIAL CASE: Cloud Deployments**
- In cloud deployments, `basePath` may be EMPTY (`""`)
- `host` contains identity-specific subdomain (e.g., `100000012.auth.sit-hclvoltmx.net`)
- Still an identity service if it has authentication paths

```bash
# Enhanced detection for cloud deployments
for file in *.json; do
  basePath=$(jq -r '.basePath // ""' "$file")
  host=$(jq -r '.host // ""' "$file")

  # Check for standard on-premise pattern
  if [[ "$basePath" == /authService/* ]]; then
    echo "Found Identity Service (on-premise): $file"
    jq -r '.info.title' "$file"
  # Check for cloud pattern (empty basePath + auth-related host OR has auth paths)
  elif [[ "$basePath" == "" ]] && jq -e '.paths | has("/login") or has("/oauth2/login")' "$file" > /dev/null; then
    echo "Found Identity Service (cloud): $file"
    jq -r '.info.title' "$file"
  fi
done
```

### Step 1.2: Determine Authentication Type for Each Service

**⚠️ CRITICAL: Identity service names are user-chosen and don't indicate type**

Do NOT rely on service names to determine authentication type - these are arbitrary user-chosen names that can be ANYTHING.

**Determine type by inspecting Swagger structure:**

```bash
# Check authentication type by examining paths
for file in *identity*.json; do
  echo "Analyzing: $file"

  # Check for OAuth paths
  if jq -e '.paths | has("/oauth2/login") or has("/oauth2/token")' "$file" > /dev/null; then
    echo "  Type: OAuth2 Provider (redirect-based)"
  # Check for SAML paths
  elif jq -e '.paths | has("/saml/login")' "$file" > /dev/null; then
    echo "  Type: SAML Provider (redirect-based)"
  # Check for standard login
  elif jq -e '.paths | has("/login")' "$file" > /dev/null; then
    echo "  Type: Username/Password Provider"
  fi
done
```

**Authentication Type Detection Rules:**

| Swagger Paths | Authentication Type | UI Pattern |
|--------------|-------------------|-----------|
| `/oauth2/login`, `/oauth2/token` | **OAuth2** | Redirect button (NO username/password) |
| `/saml/login` | **SAML** | Redirect button (NO username/password) |
| `/login` only | **Username/Password** | Form with userid/password fields |

### Step 1.3: Select Which Identity Service to Use

**⚠️ CRITICAL: Use ONLY ONE identity service - match user's request to authentication type**

**Selection Logic:**

1. **User explicitly requests a specific identity service**: Match by TYPE or NAME
   - **By authentication method**: Match by TYPE, not name
     - "Use OAuth provider" → Find service with `/oauth2/` paths
     - "Use SAML provider" → Find service with `/saml/` paths
     - "Use username/password" → Find service with `/login` path only
     - "Use LDAP" → Find service with `/login` + `domain` field in loginRequestParams
   - **By provider name**: Match by Swagger `info.title`
     - "Use MyAuthService" → Find service where `info.title` == "MyAuthService"

2. **User doesn't specify AND exactly 1 identity service exists**: Use that identity service
   - If only one custom identity service is in the Swagger export, use it automatically
   - This is the unambiguous case - there's only one option

3. **User doesn't specify AND multiple identity services exist**: Use Foundry Accounts fallback
   - Multiple identity services = ambiguous which one to use
   - Default to Foundry Accounts (always available, no external dependencies)

4. **User doesn't specify AND NO identity services exist**: Use Foundry Accounts fallback
   - This is the most common case for simple apps
   - Default to Foundry Accounts (standard authentication mechanism)

**Example Decision Process:**

```bash
# Prompt: "Use the OAuth provider for authentication"
# Available files: MyOAuthService.json, MyUserStore.json

# Step 1: Determine types by inspecting Swagger structure
jq '.paths | keys[]' MyOAuthService.json
# Output: ["/oauth2/login", "/oauth2/token"] → OAuth2 Provider

jq '.paths | keys[]' MyUserStore.json
# Output: ["/login"] → Username/Password Provider

# Step 2: User requested "OAuth provider"
# Step 3: Match by TYPE (not name) → MyOAuthService.json
# Step 4: DECISION: Use ONLY MyOAuthService.json
# Step 5: Generate OAuth redirect UI (button, NO form fields)
```

**⛔ CRITICAL RULES:**
- **Use ONLY ONE identity service** per app
- **Do NOT create provider selection dropdowns**
- **Do NOT let users choose between multiple identity services at runtime**
- If multiple services match, use the first one found

**Parse Identity Service Details:**
```bash
# Extract identity service details
SERVICE_NAME=$(jq -r '.info.title' IdentityService.json)
BASE_PATH=$(jq -r '.basePath // ""' IdentityService.json)  # May be empty for cloud
HOST=$(jq -r '.host' IdentityService.json)

# List available operations (login, logout, token, etc.)
jq -r '.paths | keys[]' IdentityService.json

# Get login request parameters
jq '.definitions.loginRequestParams.properties | keys' IdentityService.json

# Get login response structure
jq '.definitions.loginResponseParams.properties' IdentityService.json
```

**IF Identity Service Swagger EXISTS:**
- Parse operation from `paths` (e.g., `/login`, `/oauth2/login`)
- Parse request schema from `definitions.loginRequestParams`
- Parse response schema from `definitions.loginResponseParams`
- Parse `basePath` from Swagger (may be empty for cloud deployments)
- Use JSON format (Swagger specifies `consumes: ["application/json"]`)
- Content-Type: `application/json`

**IF NO Identity Service Swagger:**
- **MANDATORY:** Use FoundryAccountsClient for default authentication
- This is the **standard authentication mechanism** when no custom identity provider is configured
- Use `/authService/accounts/login` endpoint (always available)
- Use form-urlencoded format (NOT JSON)
- Content-Type: `application/x-www-form-urlencoded`
- **You MUST generate this** - authentication is never optional

## Step 1.4: Understand Foundry Deployment Patterns and URL Structure

⛔ **CRITICAL: Foundry has different URL patterns for cloud vs on-premise deployments** ⛔

### Cloud Deployment Pattern:

**Identity Services:**
- Swagger `host`: Identity-specific subdomain (e.g., `100000012.auth.sit-hclvoltmx.net`)
- Swagger `basePath`: Empty string `""` or not present
- Full auth URL: `https://100000012.auth.sit-hclvoltmx.net/login`

**Integration/Object/Orchestration Services:**
- Swagger `host`: Runtime subdomain with `/services` (e.g., `m100000012001.sit-hclvoltmx.net/services`)
- Swagger `basePath`: Service name (e.g., `/SwaggerTest` or `/data/v1/ODATAfltr`)
- Full service URL: `https://m100000012001.sit-hclvoltmx.net/services/SwaggerTest/operation`

**Key Point:** In cloud, each service type has its own subdomain. There is NO single "base URL" for all services.

### On-Premise Deployment Pattern:

**Identity Services:**
- Swagger `host`: Shared Foundry domain (e.g., `my-company-foundry.net`)
- Swagger `basePath`: Identity service path (e.g., `/authService/100000002`)
- Full auth URL: `https://my-company-foundry.net/authService/100000002/login`

**Integration/Object/Orchestration Services:**
- Swagger `host`: Shared Foundry domain with `/services` (e.g., `my-company-foundry.net/services`)
- Swagger `basePath`: Service name (e.g., `/SwaggerTest`)
- Full service URL: `https://my-company-foundry.net/services/SwaggerTest/operation`

**Key Point:** In on-premise, all services share the same base domain.

### Environment Variable Strategy:

**⛔ CRITICAL: Use environment variables for hosts to enable environment portability** ⛔

The generated app must work across different Foundry environments (dev, staging, prod) by only changing environment variables, NOT regenerating code.

**Extract host values from Swagger:**
```bash
# For identity services
jq -r '.host' IdentityService.json
# Cloud example: "100000012.auth.sit-hclvoltmx.net"
# On-premise example: "my-company-foundry.net"

# For integration/object services
jq -r '.host' IntegrationService.json
# Cloud example: "m100000012001.sit-hclvoltmx.net/services"
# On-premise example: "my-company-foundry.net/services"

# For basePath
jq -r '.basePath // ""' Service.json
# Identity cloud: "" (empty)
# Identity on-premise: "/authService/100000002"
# Integration: "/SwaggerTest"
```

**Environment Variables:**
- `VITE_FOUNDRY_AUTH_HOST`: Host for identity/authentication services
- `VITE_FOUNDRY_SERVICE_HOST`: Host for integration/object/orchestration services
- These values come from Swagger `host` field and change per environment

## Step 1.5: Identify Identity Service Type

⛔ **CRITICAL: Detect Identity Service Type to Determine Required Fields** ⛔

**Parse the Identity Service name from Swagger:**

⚠️ **CRITICAL: Use the EXACT value from Swagger `info.title` (CASE-SENSITIVE)**

```bash
# Get EXACT service name from Swagger info.title
SERVICE_NAME=$(jq -r '.info.title' IdentityService.json)

# Example outputs (these are user-chosen names and can be ANYTHING):
# "MyAuthService_v2" → Use "MyAuthService_v2" as provider value
# "Company_LDAP_2024" → Use "Company_LDAP_2024" as provider value
# "accounts" → Do NOT use provider field
```

**⛔ DO NOT:**
- ❌ Infer the name from the filename
- ❌ Convert to camelCase or PascalCase
- ❌ Remove pluralization, numbers, or special characters
- ❌ Modify the case in any way

**✅ DO:**
- ✅ Use the `info.title` value EXACTLY as-is
- ✅ Preserve case sensitivity
- ✅ Preserve pluralization
- ✅ This value becomes the `provider` field in login requests

**Identity Service Types and Required Login Fields:**

**⚠️ CRITICAL: Foundry supports many identity service types including:**
- Microsoft Active Directory
- Open LDAP
- Salesforce
- SAML
- OAuth 2.0 (Google, LinkedIn, Instagram, Amazon, Yahoo, Facebook, BOX, etc.)
- SAP Gateway
- Okta
- Microsoft
- Custom User Repository
- Siteminder
- Infinity Spotlight
- OAuth Provider (generic)

**⛔ NEVER assume there are only 2-3 types** - inspect Swagger structure to determine authentication flow.

**Detection by Swagger Structure (NOT by service name):**

1. **OAuth2 Providers** (Google, Facebook, LinkedIn, Amazon, Yahoo, Instagram, BOX, etc.)
   - **Detect by paths**: Contains `/oauth2/login` and `/oauth2/token`
   - **Authentication flow**: Redirect-based (NO username/password form)
   - **UI**: Button that redirects to OAuth provider
   - **REQUIRED fields**:
     - ⛔ **`provider`**: Identity service name from Swagger `info.title` (REQUIRED in ALL OAuth2 requests)
     - `code`: Authorization code (from OAuth callback)
     - `redirect_uri`: Callback URL
     - `grant_type`: Usually "authorization_code"

2. **SAML Providers**
   - **Detect by paths**: Contains `/saml/login`
   - **Authentication flow**: Redirect-based (NO username/password form)
   - **UI**: Button that redirects to SAML IdP
   - **REQUIRED fields**: Varies by provider

3. **Username/Password Providers** (LDAP, Active Directory, Custom User Repository, etc.)
   - **Detect by paths**: Contains `/login` endpoint ONLY (no `/oauth2/` or `/saml/`)
   - **Authentication flow**: Form-based with credentials
   - **UI**: Form with username/password fields
   - **REQUIRED fields**: Parse from `definitions.loginRequestParams` in Swagger
     - Common fields: `userid` or `username`, `password`
     - LDAP/AD may include: `domain`
     - Custom userstores may include: `provider` (identity service name)

4. **Foundry Accounts (Fallback)**
   - **Detect**: No Identity Service Swagger found OR service name is "accounts"
   - **basePath**: `/authService/accounts`
   - **Authentication flow**: Form-based with form-urlencoded
   - **REQUIRED fields**:
     - ✅ `userid`: string (REQUIRED)
     - ✅ `password`: string (REQUIRED)
   - **NO provider field needed** (uses form-urlencoded, not JSON)

**⚠️ CRITICAL FOR CUSTOM USERSTORES:**

The `provider` field is **NOT OPTIONAL** for custom userstores. It MUST be included in the login request body.

**How to determine the provider value:**
- ✅ Use the identity service name from Swagger `info.title` EXACTLY as-is
- ✅ Extract from `info.title` field in the identity service Swagger JSON
- ✅ This is a user-chosen name and can be ANYTHING (e.g., "MyAuthService", "Company_LDAP_2024", "prod-auth")

**Example (where Swagger info.title = "MyCustomAuth"):**
```typescript
await login({
  userid: "john.doe",
  password: "password123",
  provider: "MyCustomAuth"  // ⛔ REQUIRED - Use EXACT value from Swagger info.title
});
```

**⚠️ Common Error:**
```typescript
// Example: Swagger info.title = "MyAuthService123"

// ❌ WRONG - Modified the name
provider: "MyAuthService"  // Will cause 400 error: "Invalid Provider Name"

// ❌ WRONG - Changed case
provider: "myauthservice123"  // Will cause 400 error: "Invalid Provider Name"

// ✅ CORRECT - Exact value from Swagger info.title
provider: "MyAuthService123"  // Matches Swagger exactly
```

## Step 2: Generate Authentication Client

### Option A: Custom Identity Service Client (from Swagger)

**IF Identity Service Swagger exists:**

```typescript
// src/services/foundry/identity/{IdentityServiceName}Client.ts
import { foundryConfig } from '../../../config/foundry.config';

/**
 * {IdentityServiceName} Identity Client
 *
 * Generated from Swagger: {filename}
 * Authentication type: {OAuth2 / Username-Password / SAML / etc.}
 *
 * Foundry URL Pattern (from Swagger export):
 * - Swagger host: {host value from jq -r '.host' identity-service.json}
 * - Swagger basePath: {basePath value from jq -r '.basePath // ""' identity-service.json}
 *
 * Environment Configuration:
 * - Uses VITE_FOUNDRY_AUTH_HOST environment variable for deployment flexibility
 * - Allows same code to work across dev/staging/prod by changing .env only
 */

// Parse from Swagger definitions.loginRequestParams
export interface LoginRequest {
  // Example fields - parse actual fields from Swagger
  userid?: string;
  username?: string;
  password: string;

  // ⛔ CRITICAL: provider field handling based on identity service type
  // For Custom Userstores: provider is REQUIRED (not optional)
  // For Foundry Accounts: provider should NOT be included
  // For OAuth/LDAP: check Swagger definition
  provider?: string;  // Mark as required (remove ?) if this is a custom userstore

  domain?: string;  // Required for LDAP/AD
  // ... other fields from loginRequestParams
}

// Parse from Swagger definitions.loginResponseParams
export interface LoginResponse {
  claims_token: {
    value: string;
    exp: number;
  };
  refresh_token?: string;
  profile?: {
    userid?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
  };
  opstatus?: number;
  httpStatusCode?: number;
}

export class {IdentityServiceName}Client {
  private baseURL: string;
  private servicePath: string;
  private providerName: string;

  constructor() {
    // ⛔ CRITICAL: Use VITE_FOUNDRY_AUTH_HOST from environment variables
    // This enables switching environments by updating .env only (no code regeneration)
    //
    // Swagger host value (for .env.example): {host from jq -r '.host'}
    // Example cloud: "100000012.auth.sit-hclvoltmx.net"
    // Example on-premise: "my-company-foundry.net"
    this.baseURL = `https://${foundryConfig.authHost}`;

    // ⛔ CRITICAL: Parse basePath from Swagger - DO NOT HARDCODE
    // Run: jq -r '.basePath // ""' /path/to/identity-service.json
    //
    // Cloud: basePath is "" (empty)
    // On-premise: basePath is "/authService/{id}" (e.g., "/authService/100000002")
    this.servicePath = '{basePath}'; // ⚠️ REPLACE with exact jq output

    // ⛔ CRITICAL: Get provider name from Swagger info.title (EXACT value, CASE-SENSITIVE)
    // Run: jq -r '.info.title' /path/to/identity-service.json
    this.providerName = '{IdentityServiceName}'; // ⚠️ REPLACE with exact Swagger info.title
  }

  /**
   * Authenticate user with credentials
   *
   * Cloud example URL: https://100000012.auth.sit-hclvoltmx.net/login
   * On-premise example URL: https://my-company-foundry.net/authService/100000002/login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Parse endpoint from Swagger paths (e.g., '/login', '/oauth2/login')
    const endpoint = '/login'; // ⚠️ REPLACE based on Swagger paths

    // Construct full URL: https://{authHost}{servicePath}{endpoint}
    const response = await fetch(`${this.baseURL}${this.servicePath}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Voltmx-App-Key': foundryConfig.appKey,
        'X-Voltmx-App-Secret': foundryConfig.appSecret,
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login failed (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * Logout (optional - clears server-side session if implemented)
   */
  async logout(claimsToken: string): Promise<void> {
    // Note: Logout endpoint may not be implemented in all identity services
    // Client should always clear local storage regardless
    try {
      await fetch(`${this.baseURL}${this.servicePath}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Voltmx-App-Key': foundryConfig.appKey,
          'X-Voltmx-App-Secret': foundryConfig.appSecret,
          'X-Voltmx-Authorization': claimsToken,
        },
      });
    } catch (error) {
      console.warn('Logout endpoint not available or failed:', error);
    }
  }

  // Add other operations found in Swagger paths
  // - token (if /oauth2/token exists)
  // - etc.
}
```

### Option A.1: OAuth2 Provider Client (Special Case)

**IF Identity Service has OAuth2 paths (`/oauth2/login` and `/oauth2/token`):**

⛔ **CRITICAL: OAuth2 providers ALWAYS require the `provider` parameter** ⛔

The `provider` field is **REQUIRED** for OAuth2 requests:
- In `/oauth2/login` GET request: as query parameter
- In `/oauth2/token` POST request: in JSON body

**Extract provider name from Swagger:**
```bash
jq -r '.info.title' /path/to/oauth-identity-service.json
# Example output: "GoogleOauthprovider"
```

**OAuth2 Client Implementation:**

```typescript
// src/services/foundry/identity/{IdentityServiceName}Client.ts
import { foundryConfig } from '../../../config/foundry.config';

/**
 * {IdentityServiceName} OAuth2 Identity Client
 *
 * Generated from Swagger: {filename}
 * Authentication type: OAuth2 Redirect Flow
 *
 * ⛔ CRITICAL: Get provider name from Swagger info.title
 * Run: jq -r '.info.title' /path/to/identity-service.json
 */

// ⛔ CRITICAL: Get EXACT provider name from Swagger info.title
// Run: jq -r '.info.title' /path/to/identity-service.json
const PROVIDER_NAME = '{ProviderName}'; // ⚠️ REPLACE with exact value from Swagger

// OAuth2 Token Request (for /oauth2/token endpoint)
export interface OAuthTokenRequest {
  code: string;
  provider: string;  // ⛔ REQUIRED - identity service name from Swagger
  redirect_uri?: string;
  grant_type?: string;
  scope?: string;
}

// OAuth2 Login Response
export interface OAuthLoginResponse {
  claims_token: {
    value: string;
    exp: number;
  };
  refresh_token?: string;
  profile?: {
    userid?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
  };
  opstatus?: number;
  httpStatusCode?: number;
}

export class {IdentityServiceName}Client {
  private baseURL: string;
  private servicePath: string;
  private providerName: string;

  constructor() {
    // ⛔ CRITICAL: Use VITE_FOUNDRY_AUTH_HOST from environment variables
    // Swagger host value (for .env.example): {host from jq -r '.host'}
    this.baseURL = `https://${foundryConfig.authHost}`;

    // ⛔ CRITICAL: Parse basePath from Swagger - DO NOT HARDCODE
    // Run: jq -r '.basePath // ""' /path/to/identity-service.json
    // Cloud: "" (empty), On-premise: "/authService/100000012"
    this.servicePath = '{basePath}'; // ⚠️ REPLACE with Swagger basePath

    // ⛔ CRITICAL: Use EXACT value from Swagger info.title
    this.providerName = PROVIDER_NAME;
  }

  /**
   * Initiates OAuth2 login by redirecting to the OAuth provider
   * This constructs the authorization URL and redirects the user
   *
   * Endpoint: {baseURL}{servicePath}/oauth2/login
   */
  initiateLogin(redirectUri: string): void {
    // Construct OAuth2 authorization URL
    const authUrl = `${this.baseURL}${this.servicePath}/oauth2/login`;
    const params = new URLSearchParams({
      provider: this.providerName,  // ⛔ REQUIRED - from Swagger info.title
      success_url: redirectUri,
      appkey: foundryConfig.appKey,
    });

    // Redirect to OAuth provider
    window.location.href = `${authUrl}?${params.toString()}`;
  }

  /**
   * Exchanges OAuth2 authorization code for claims token
   * Called after OAuth provider redirects back with authorization code
   *
   * Endpoint: {baseURL}{servicePath}/oauth2/token
   */
  async exchangeCodeForToken(params: OAuthTokenRequest): Promise<OAuthLoginResponse> {
    const response = await fetch(`${this.baseURL}${this.servicePath}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Voltmx-App-Key': foundryConfig.appKey,
        'X-Voltmx-App-Secret': foundryConfig.appSecret,
      },
      body: JSON.stringify({
        code: params.code,
        provider: this.providerName,  // ⛔ REQUIRED - from Swagger info.title
        grant_type: params.grant_type || 'authorization_code',
        redirect_uri: params.redirect_uri,
        scope: params.scope,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OAuth token exchange failed (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async logout(): Promise<void> {
    // Optional: implement logout if needed
    // OAuth providers typically don't have a server-side logout
    // Just clear local storage in the context
  }
}
```

**⚠️ Common OAuth2 Errors:**

```typescript
// ❌ WRONG - Missing provider parameter
const params = new URLSearchParams({
  success_url: redirectUri,
  appkey: foundryConfig.appKey,
  // Missing: provider
});
// This will cause: "Invalid provider name. provider name can't be null or empty"

// ✅ CORRECT - Including provider parameter
const params = new URLSearchParams({
  provider: this.providerName,  // From Swagger info.title
  success_url: redirectUri,
  appkey: foundryConfig.appKey,
});
```

### Option B: Foundry Accounts Authentication Client

**Use template:** `templates/auth/clients/FoundryAccountsClient.ts`

**When to use:** When NO custom Identity Service Swagger exists

⛔ **MANDATORY - ALWAYS CREATE THIS WHEN NO CUSTOM IDENTITY SERVICE** ⛔

**⚠️ IMPORTANT: Check if file already exists (incremental integration)**

**Action:**
```typescript
const clientPath = path.join(projectRoot, 'src/services/foundry/identity/FoundryAccountsClient.ts');

if (fs.existsSync(clientPath)) {
  // File already exists - app already has Foundry Accounts authentication
  // DO NOT overwrite - user may have customizations
  console.log('FoundryAccountsClient.ts already exists - skipping generation');
  console.log('Existing Foundry Accounts client will be used');
} else {
  // File doesn't exist - create from template
  const templatePath = path.join(skillDir, 'templates/auth/clients/FoundryAccountsClient.ts');
  fs.mkdirSync(path.dirname(clientPath), { recursive: true });
  fs.copyFileSync(templatePath, clientPath);
  console.log('Created FoundryAccountsClient.ts from template');
}
```

This is the **default authentication mechanism** for Foundry applications. When no custom Identity Service is configured in Foundry, you MUST use this fallback.

**Key features:**
- Uses form-urlencoded format (NOT JSON)
- Endpoint: `/authService/accounts/login`
- Works with `VITE_FOUNDRY_AUTH_HOST` environment variable
- Provides `login()` and `logout()` methods

**Why not overwrite:**
- User may have customized the client (added methods, error handling, etc.)
- Template structure is stable - safe to reuse existing file
- If user is adding a new service to an existing Foundry app, auth is already set up

## Step 2b: Generate Foundry Configuration Files

⛔ **MANDATORY - GENERATE THESE FILES FOR ENVIRONMENT PORTABILITY** ⛔

### Generate `src/config/foundry.config.ts`:

**Use template:** `templates/config/foundry.config.ts`

**⚠️ IMPORTANT: Check if file already exists (incremental integration)**

**Action:**
```typescript
import * as fs from 'fs';
import * as path from 'path';

const configPath = path.join(projectRoot, 'src/config/foundry.config.ts');

if (fs.existsSync(configPath)) {
  // File already exists - app already has Foundry integration
  // DO NOT overwrite - user may have customizations
  console.log('foundry.config.ts already exists - skipping generation');
  console.log('Existing Foundry configuration will be used');
} else {
  // File doesn't exist - first time integrating with Foundry
  // Copy template to create the file
  const templatePath = path.join(skillDir, 'templates/config/foundry.config.ts');
  fs.copyFileSync(templatePath, configPath);
  console.log('Created foundry.config.ts from template');
}
```

**This file provides:**
- Environment variable configuration for auth and service hosts
- TypeScript interface for type safety
- Validation function to check required environment variables at startup

**Why not overwrite:**
- User may have added custom configuration
- File structure doesn't change - safe to reuse existing file
- Environment-specific values come from `.env`, not this file

### Generate or Update `.env`:

**Use template:** `templates/config/env.template`

**⚠️ IMPORTANT: This step ALWAYS executes - supports incremental integration**

Unlike other files, `.env` is **designed to be updated** when adding new Foundry integrations. The current approach already handles this correctly.

**⛔ CRITICAL: Extract values from Swagger and populate template placeholders** ⛔

**Step 1: Extract host values from Swagger:**

⛔ **CRITICAL: Extract from the CORRECT Swagger files** ⛔

**Find the identity service Swagger file:**
```bash
# Identity services have authentication paths or basePath starting with /authService/
# OR have empty basePath with .auth. in the host
for file in *.json; do
  basePath=$(jq -r '.basePath // ""' "$file")
  host=$(jq -r '.host' "$file")

  # Check if it's an identity service
  if [[ "$basePath" == /authService/* ]] || \
     [[ "$basePath" == "" && "$host" == *.auth.* ]] || \
     jq -e '.paths | has("/login") or has("/oauth2/login")' "$file" > /dev/null 2>&1; then
    echo "Identity service found: $file"
    IDENTITY_FILE="$file"
    break
  fi
done
```

**Find an integration/object service Swagger file:**
```bash
# Integration/object services have regular service paths
# NOT identity services (no /authService/, no auth paths)
for file in *.json; do
  basePath=$(jq -r '.basePath // ""' "$file")
  host=$(jq -r '.host' "$file")

  # Skip if it's an identity service
  if [[ "$basePath" == /authService/* ]] || \
     [[ "$basePath" == "" && "$host" == *.auth.* ]] || \
     jq -e '.paths | has("/login") or has("/oauth2/login")' "$file" > /dev/null 2>&1; then
    continue  # Skip identity services
  fi

  # This is an integration/object service
  echo "Integration/Object service found: $file"
  SERVICE_FILE="$file"
  break
done
```

**Extract host values (EXACT values, no modifications):**
```bash
# ⛔ CRITICAL: Use jq -r '.host' - do NOT modify the extracted value
# The host field includes /services if needed - use it EXACTLY as-is

# Extract from identity service Swagger
IDENTITY_HOST=$(jq -r '.host' "$IDENTITY_FILE")
echo "Identity host: $IDENTITY_HOST"

# Extract from integration/object service Swagger
SERVICE_HOST=$(jq -r '.host' "$SERVICE_FILE")
echo "Service host: $SERVICE_HOST"

# Detect deployment type (cloud vs on-premise)
IDENTITY_BASEPATH=$(jq -r '.basePath // ""' "$IDENTITY_FILE")
if [[ -z "$IDENTITY_BASEPATH" ]]; then
  DEPLOYMENT_TYPE="cloud"
else
  DEPLOYMENT_TYPE="on-premise"
fi
```

**⚠️ CRITICAL VALIDATION:**
```bash
# Validate extracted values before using them
if [[ -z "$IDENTITY_HOST" || "$IDENTITY_HOST" == "null" ]]; then
  echo "ERROR: Could not extract identity host from $IDENTITY_FILE"
  exit 1
fi

if [[ -z "$SERVICE_HOST" || "$SERVICE_HOST" == "null" ]]; then
  echo "ERROR: Could not extract service host from $SERVICE_FILE"
  exit 1
fi

# Cloud validation: Verify hosts are different
if [[ "$DEPLOYMENT_TYPE" == "cloud" ]]; then
  if [[ "$IDENTITY_HOST" == "$SERVICE_HOST" ]]; then
    echo "WARNING: In cloud deployments, identity and service hosts should be different"
    echo "Identity: $IDENTITY_HOST"
    echo "Service: $SERVICE_HOST"
  fi

  # Cloud identity hosts should contain .auth.
  if [[ ! "$IDENTITY_HOST" =~ \.auth\. ]]; then
    echo "WARNING: Cloud identity host should contain '.auth.' - got: $IDENTITY_HOST"
  fi
fi
```

**Step 2: Check if `.env` already exists:**

```typescript
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(projectRoot, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  // .env exists - update it with detected values as comments
  updateExistingEnv(envPath, identityHost, serviceHost, deploymentType);
} else {
  // .env doesn't exist - create it with full template
  createNewEnv(envPath, identityHost, serviceHost, deploymentType);
}
```

**Step 3a: If `.env` exists - Add helpful comments without overwriting:**

**This handles incremental integration scenarios:**
- User added ServiceA, now adding ServiceB → `.env` already has ServiceA config, preserve it
- User created basic app, now integrating Foundry → `.env` may have other config, preserve it
- User switching Swagger exports (dev → prod) → Show new detected values without overwriting

Add a comment block at the top showing the detected values from the current Swagger export:

```typescript
function updateExistingEnv(envPath: string, identityHost: string, serviceHost: string, deploymentType: string) {
  const existingContent = fs.readFileSync(envPath, 'utf-8');

  // Only add comment if it doesn't already exist
  if (!existingContent.includes('# Detected from Swagger export')) {
    const detectedComment = `# =============================================================================
# Detected from Swagger export (${new Date().toISOString().split('T')[0]})
# =============================================================================
# Deployment type: ${deploymentType.toUpperCase()}
# VITE_FOUNDRY_AUTH_HOST: ${identityHost}
# VITE_FOUNDRY_SERVICE_HOST: ${serviceHost}
#
# If you want to use these values, update the active variables below.
# If this is a new integration, these values may match what's already configured.
# =============================================================================

`;

    fs.writeFileSync(envPath, detectedComment + existingContent);
    console.log('Updated .env with detected Swagger values as comments');
    console.log('Review the detected values and update if switching environments');
  } else {
    console.log('.env already has detected values - skipping update');
    console.log('If you are switching environments, manually update VITE_FOUNDRY_AUTH_HOST and VITE_FOUNDRY_SERVICE_HOST');
  }
}
```

**Step 3b: If `.env` doesn't exist - Create it from template:**

```typescript
function createNewEnv(envPath: string, identityHost: string, serviceHost: string, deploymentType: string) {
  const isCloud = deploymentType === 'cloud';

  // Read template file
  const templatePath = path.join(skillDir, 'templates/config/env.template');
  let envContent = fs.readFileSync(templatePath, 'utf-8');

  // Replace placeholders
  envContent = envContent
    .replace('{{CLOUD_SECTION_COMMENT}}', isCloud
      ? '# Active - This matches the Foundry Swagger export used to generate this app'
      : '# Commented out - Uncomment and update for cloud deployments')
    .replace(/{{CLOUD_COMMENT_PREFIX}}/g, isCloud ? '' : '# ')
    .replace('{{CLOUD_AUTH_HOST}}', isCloud ? identityHost : 'YOUR_ENV_ID.auth.CLOUD.net')
    .replace('{{CLOUD_SERVICE_HOST}}', isCloud ? serviceHost : 'mYOUR_ENV_ID.CLOUD.net/services')
    .replace('{{ONPREM_SECTION_COMMENT}}', !isCloud
      ? '# Active - This matches the Foundry Swagger export used to generate this app'
      : '# Commented out - Uncomment and update for on-premise deployments')
    .replace(/{{ONPREM_COMMENT_PREFIX}}/g, !isCloud ? '' : '# ')
    .replace('{{ONPREM_AUTH_HOST}}', !isCloud ? identityHost : 'my-company-foundry.net')
    .replace('{{ONPREM_SERVICE_HOST}}', !isCloud ? serviceHost : 'my-company-foundry.net/services');

  fs.writeFileSync(envPath, envContent);
  console.log('Created .env with Swagger-detected values');
}
```

**Benefits of this approach:**

✅ **No manual copy step** - `.env` is created automatically
✅ **Preserves existing config** - If `.env` exists, just add helpful comments
✅ **Safe for git** - Developers naturally add `.env` to `.gitignore` (standard practice)
✅ **Smart defaults** - Active section matches the Swagger export deployment type
✅ **Easy to switch** - Clear instructions for changing environments

## Step 3: Create Authentication Context and Hook

⛔ **MANDATORY - USE CONTEXT PROVIDER PATTERN** ⛔

**CRITICAL:** Authentication state MUST be shared using React Context. Using a plain hook will cause infinite redirect loops.

**🚨 BEFORE WRITING CODE: Parse the EXACT identity service name from Swagger 🚨**

```bash
# Run this command to get the EXACT identity service name:
jq -r '.info.title' /path/to/identity-swagger-file.json

# Example output: "MyAuthService_v2" (user-chosen name, can be ANYTHING)
# Use THIS EXACT VALUE in the code below (do NOT modify it)
```

**Then use that EXACT value in the `IDENTITY_PROVIDER` constant below:**

### Option A: Username/Password Context (for Username/Password Providers)

**Use this template when Identity Service has ONLY `/login` path (no `/oauth2/` or `/saml/`).**

This includes:
- Custom Userstores (database-backed)
- LDAP / Active Directory
- Foundry Accounts (fallback)

```typescript
// src/contexts/FoundryAuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FoundryAccountsClient } from '../services/foundry/identity/FoundryAccountsClient';
// OR import your custom Identity client from Swagger:
// import { {IdentityServiceName}Client } from '../services/foundry/identity/{IdentityServiceName}Client';
import type { LoginRequest } from '../services/foundry/identity/{IdentityServiceName}Client';

// ⛔ CRITICAL: Parse identity service name from Swagger (EXACT value, CASE-SENSITIVE)
//
// STEP 1: Get the EXACT service name from Swagger using jq:
//   SERVICE_NAME=$(jq -r '.info.title' /path/to/identity-service.json)
//
// STEP 2: Use that EXACT value below (do NOT modify it)
//   Example: If jq returns "MyAuthService_v2", use "MyAuthService_v2" exactly
//   Example: If jq returns "Company_LDAP", use "Company_LDAP" exactly
//
// For Custom Identity Services: Set to exact Swagger info.title (user-chosen name)
// For Foundry Accounts: Set to null (if no identity service Swagger exists)
const IDENTITY_PROVIDER = 'MyAuthService_v2'; // ⚠️ REPLACE with exact value from: jq -r '.info.title' identity-service.json
const IS_CUSTOM_USERSTORE = IDENTITY_PROVIDER !== 'accounts' && IDENTITY_PROVIDER !== null;

// ⚠️ CRITICAL: Provider name is CASE-SENSITIVE and MUST match Swagger info.title EXACTLY
// The provider value MUST exactly match the identity service name as defined in Foundry
// Identity service names are user-chosen and can be ANYTHING
// Common error: Modifying the name in any way → causes 400 error

interface AuthContextType {
  claimsToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: { userid: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const FoundryAuthContext = createContext<AuthContextType | undefined>(undefined);

interface FoundryAuthProviderProps {
  children: ReactNode;
}

export const FoundryAuthProvider: React.FC<FoundryAuthProviderProps> = ({ children }) => {
  const [claimsToken, setClaimsToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use fallback OR custom Identity client (based on Swagger analysis)
  const authClient = new FoundryAccountsClient();
  // OR: const authClient = new {IdentityServiceName}Client();

  // Restore token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('foundry_claims_token');
    if (savedToken) {
      setClaimsToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (credentials: { userid: string; password: string }): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // ⛔ CRITICAL: Add provider field for custom userstores
      let loginCredentials: LoginRequest;

      if (IS_CUSTOM_USERSTORE) {
        // For custom userstores: provider field is REQUIRED
        loginCredentials = {
          ...credentials,
          provider: IDENTITY_PROVIDER  // ⚠️ REQUIRED for custom userstores
        };
      } else {
        // For Foundry accounts: provider field should NOT be included
        loginCredentials = credentials;
      }

      const response = await authClient.login(loginCredentials);

      // ⛔ CRITICAL: Extract the token VALUE, not the entire object
      if (response.claims_token?.value) {
        const token = response.claims_token.value;
        setClaimsToken(token);
        setIsAuthenticated(true);
        localStorage.setItem('foundry_claims_token', token);
      } else {
        // ⚠️ DO NOT use JSON.stringify as fallback - this creates double-encoded tokens
        // If claims_token.value is missing, the response structure is unexpected
        throw new Error('No claims token value received from server');
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setClaimsToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('foundry_claims_token');

    // Optional: call server logout
    // await authClient.logout();
  };

  return (
    <FoundryAuthContext.Provider
      value={{
        claimsToken,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </FoundryAuthContext.Provider>
  );
};

export const useFoundryAuth = (): AuthContextType => {
  const context = useContext(FoundryAuthContext);
  if (context === undefined) {
    throw new Error('useFoundryAuth must be used within a FoundryAuthProvider');
  }
  return context;
}
```

### Option B: OAuth2 Context (for OAuth/SAML Providers)

**Use this template when Identity Service has `/oauth2/` or `/saml/` paths.**

```typescript
// src/contexts/FoundryAuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { {IdentityServiceName}Client } from '../services/foundry/identity/{IdentityServiceName}Client';

/**
 * Foundry Authentication Context for OAuth2 Flow
 *
 * This context manages OAuth2 authentication using the identity service.
 * Authentication type: OAuth2 Redirect Flow (NO username/password form)
 *
 * Flow:
 * 1. User clicks "Sign in" button
 * 2. initiateOAuthLogin() redirects to OAuth provider (Google, Facebook, etc.)
 * 3. User authenticates with OAuth provider
 * 4. OAuth provider redirects back to our callback URL with authorization code
 * 5. handleOAuthCallback() exchanges code for claims token
 * 6. Token is stored in localStorage and context
 */

interface AuthContextType {
  claimsToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  initiateOAuthLogin: () => void;
  handleOAuthCallback: (code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const FoundryAuthContext = createContext<AuthContextType | undefined>(undefined);

interface FoundryAuthProviderProps {
  children: ReactNode;
}

export const FoundryAuthProvider: React.FC<FoundryAuthProviderProps> = ({ children }) => {
  const [claimsToken, setClaimsToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const authClient = new {IdentityServiceName}Client();

  // Restore token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('foundry_claims_token');
    if (savedToken) {
      setClaimsToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  /**
   * Initiates OAuth2 login by redirecting to OAuth provider
   * This will leave the current page and go to the OAuth provider's login
   */
  const initiateOAuthLogin = (): void => {
    // ⛔ CRITICAL: Construct the callback URL (where OAuth provider will redirect back)
    // This MUST match the redirect_uri in the token exchange request
    const redirectUri = `${window.location.origin}${import.meta.env.VITE_BASE_PATH || '/'}auth/callback`;

    // Redirect to OAuth provider
    authClient.initiateLogin(redirectUri);
  };

  /**
   * Handles OAuth callback after user authenticates with OAuth provider
   * Exchanges authorization code for claims token
   *
   * ⛔ CRITICAL: The redirect_uri MUST match exactly what was sent in the authorization request
   * ⛔ CRITICAL: The grant_type MUST be 'authorization_code' for OAuth2 spec compliance
   */
  const handleOAuthCallback = async (code: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // ⛔ CRITICAL: Construct the SAME redirect URI that was used in initiateOAuthLogin
      // OAuth2 spec requires this to match exactly, or token exchange will fail with "invalid_grant"
      const redirectUri = `${window.location.origin}${import.meta.env.VITE_BASE_PATH || '/'}auth/callback`;

      // ⛔ CRITICAL: Parse provider name from Swagger info.title
      // Run: jq -r '.info.title' /path/to/identity-service.json
      const providerName = 'PROVIDER_NAME'; // ⚠️ REPLACE with exact value from Swagger info.title

      const response = await authClient.exchangeCodeForToken({
        code,
        provider: providerName,  // ⛔ REQUIRED - from Swagger info.title
        redirect_uri: redirectUri,  // ⛔ CRITICAL - Must match authorization request
        grant_type: 'authorization_code',  // ⛔ REQUIRED - OAuth2 spec requirement
      });

      // Extract the token VALUE from the response
      if (response.claims_token?.value) {
        const token = response.claims_token.value;
        setClaimsToken(token);
        setIsAuthenticated(true);
        localStorage.setItem('foundry_claims_token', token);
      } else {
        throw new Error('No claims token value received from server');
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setClaimsToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('foundry_claims_token');

    // Optional: call server logout
    // await authClient.logout();
  };

  return (
    <FoundryAuthContext.Provider
      value={{
        claimsToken,
        isAuthenticated,
        isLoading,
        error,
        initiateOAuthLogin,
        handleOAuthCallback,
        logout,
      }}
    >
      {children}
    </FoundryAuthContext.Provider>
  );
};

export const useFoundryAuth = (): AuthContextType => {
  const context = useContext(FoundryAuthContext);
  if (context === undefined) {
    throw new Error('useFoundryAuth must be used within a FoundryAuthProvider');
  }
  return context;
}
```

**⚠️ Common OAuth2 Errors and Fixes:**

**Error: "invalid_grant" / "Bad Request"**
- **Cause:** Missing or mismatched `redirect_uri` or `grant_type` in token exchange
- **Fix:** Ensure `redirect_uri` matches EXACTLY between authorization and token requests
- **Fix:** Always include `grant_type: 'authorization_code'`

**Error: "Invalid provider name"**
- **Cause:** Provider name doesn't match Swagger `info.title` exactly
- **Fix:** Use `jq -r '.info.title' identity-service.json` to get exact name

## Step 4: Create Login Component

⛔ **MANDATORY - ALWAYS CREATE LOGIN UI BASED ON IDENTITY SERVICE TYPE** ⛔

**🚨 CRITICAL: The login UI must be generated dynamically based on the identity service's authentication flow 🚨**

### Step 4.1: Analyze Identity Service Authentication Flow

**Check Swagger paths to determine authentication type:**

```bash
# List all paths in the identity service
jq '.paths | keys[]' identity-service.json

# Common patterns:
# - /oauth2/login or /oauth2/token → OAuth provider (redirect flow)
# - /login with POST → Username/password flow
# - /saml/login → SAML redirect flow
```

**Parse login request parameters:**

```bash
# Get the request body schema for the login endpoint
jq '.paths["/login"].post.parameters[] | select(.in == "body") | .schema' identity-service.json

# OR for OAuth
jq '.paths["/oauth2/login"].get.parameters' identity-service.json
```

### Step 4.2: Generate Login UI Based on Identity Service Type

**🔍 Decision Tree:**

1. **OAuth2 Provider** (Google, Facebook, Salesforce, etc.)
   - **Detection**: Paths include `/oauth2/login` or `/oauth2/token`
   - **UI**: Single button that redirects to OAuth provider
   - **NO username/password fields**

2. **SAML Provider**
   - **Detection**: Paths include `/saml/login` or service name contains "SAML"
   - **UI**: Single button that redirects to SAML IdP
   - **NO username/password fields**

3. **Custom Userstore** (database-backed)
   - **Detection**: Path is `/login`, `loginRequestParams` includes userid + password + provider
   - **UI**: Username and password fields ONLY (provider is hidden/auto-filled)

4. **LDAP / Active Directory**
   - **Detection**: `loginRequestParams` includes userid + password + domain
   - **UI**: Username, password, and domain fields

5. **Foundry Accounts** (built-in)
   - **Detection**: basePath is `/authService/accounts`
   - **UI**: Username and password fields only

---

### UI Template A: OAuth/SAML Redirect Flow

**Use when:** Paths contain `/oauth2/` or `/saml/`

```typescript
// src/components/Login.tsx
import React from 'react';
import { useFoundryAuth } from '../contexts/FoundryAuthContext';

export const Login: React.FC = () => {
  const { initiateOAuthLogin, error } = useFoundryAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sign In</h2>
          <p className="text-gray-600 mt-2">Sign in with {ProviderName}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error.message}
          </div>
        )}

        <button
          onClick={() => initiateOAuthLogin()}
          className="w-full py-3 px-4 border rounded-lg bg-white hover:bg-gray-50"
        >
          Sign in with {ProviderName}
        </button>
      </div>
    </div>
  );
};
```

---

### UI Template B: Username/Password Flow

**Use when:** Path is `/login` with username/password in `loginRequestParams`

**Parse EXACT fields from Swagger `loginRequestParams.properties`:**

```bash
jq '.definitions.loginRequestParams.properties | keys[]' identity-service.json
# Output might be: userid, password, provider, domain, scope, etc.
```

**Field Inclusion Rules:**
1. **userid/username**: Show as input field if present
2. **password**: Show as input field if present
3. **provider**: **HIDE** - auto-filled by FoundryAuthContext from Swagger `info.title`
4. **domain**: Show as input field ONLY if present in Swagger
5. **scope**: Usually hidden, can be hardcoded if needed
6. **Any other fields**: Show as input fields if present in Swagger

```typescript
// src/components/Login.tsx
import React, { useState } from 'react';
import { useFoundryAuth } from '../contexts/FoundryAuthContext';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  // Add domain field ONLY if loginRequestParams includes 'domain'
  const [domain, setDomain] = useState(''); // For LDAP only

  const { login, isLoading, error } = useFoundryAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // ⛔ CRITICAL: Only pass fields that user entered
      // DO NOT add provider here - FoundryAuthContext adds it automatically
      await login({ userid, password });
      navigate('/'); // Redirect to home after successful login
    } catch (err) {
      // Error is already set in useFoundryAuth hook
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Sign In</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="userid" className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <input
              id="userid"
              type="text"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error.message}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
```

---

### Step 4.3: Concrete Examples by Identity Service Type

**Example 1: Google OAuth Provider**
```bash
# Swagger check
jq '.paths | keys[]' MyOAuthService.json
# Output: ["/oauth2/login", "/oauth2/token"]

# Decision: OAuth redirect flow → Use Template A (button, no form fields)
```

**Example 2: Custom Userstore**
```bash
# Swagger check
jq '.paths | keys[]' MyCustomAuth.json
# Output: ["/login"]

jq '.definitions.loginRequestParams.properties | keys[]' MyCustomAuth.json
# Output: ["userid", "password", "provider"]

# Decision: Username/password flow → Use Template B
# Fields: userid (show), password (show), provider (HIDE - auto-fill)
```

**Example 3: LDAP Provider**
```bash
jq '.definitions.loginRequestParams.properties | keys[]' LDAPProvider.json
# Output: ["userid", "password", "domain"]

# Decision: Username/password flow → Use Template B
# Fields: userid (show), password (show), domain (SHOW)
# Add domain input field to the form
```

**Example 4: Salesforce OAuth**
```bash
jq '.paths | keys[]' SalesforceProvider.json
# Output: ["/oauth2/login", "/oauth2/token"]

# Decision: OAuth redirect flow → Use Template A (button, no form fields)
```

**⚠️ Key Principle:**
The login UI is **data-driven** from Swagger - analyze the paths and loginRequestParams to determine what UI to generate. Do NOT assume all identity services use username/password.

---

## Step 4b: Create OAuth Callback Component (for OAuth/SAML providers)

⛔ **MANDATORY FOR OAUTH/SAML PROVIDERS** ⛔

**If you generated an OAuth2 or SAML authentication context, you MUST create this callback component.**

This component handles the redirect from the OAuth provider (Google, Facebook, etc.) back to your app.

---

**⚠️ CRITICAL: Match Your Project's Styling Approach**

The component template below uses **Tailwind CSS** as the default. Before generating:

1. **Check existing auth components** (Login, ProtectedRoute, etc.) - READ these files first
2. **Identify the styling approach** used in those components
3. **Generate this component using the SAME approach**

**Common styling approaches to detect:**
- **Tailwind CSS**: `className="flex items-center justify-center bg-gray-50"` (utility classes)
- **Plain CSS**: `className="auth-callback-container"` + `import './Login.css'`
- **CSS Modules**: `className={styles.container}` + `import styles from './Login.module.css'`
- **Styled Components**: `const Container = styled.div` declarations at file level
- **Material-UI**: `import { Box, Card, Button } from '@mui/material'` + MUI components
- **Chakra UI**: `import { Box, Spinner } from '@chakra-ui/react'` + Chakra components

**What to keep the same (functionality):**
- ✅ Component structure (error state, loading state, success state)
- ✅ useRef pattern for preventing double execution
- ✅ Logic (extracting code, calling handleOAuthCallback, navigation)
- ✅ Error handling and user feedback

**What to adapt (styling):**
- 🎨 Styling method (match existing components)
- 🎨 Colors and theme (match existing auth components)
- 🎨 Layout patterns (match existing spacing, shadows, borders, animations)
- 🎨 Component structure if using UI library (MUI Card vs div, MUI Button vs button)

**Example detection process:**

```bash
# Read the Login component to identify styling approach
# Look for these patterns:

# Tailwind: className="bg-white rounded-lg shadow-md p-6"
# Plain CSS: import './Login.css' + className="login-container"
# CSS Modules: import styles from './Login.module.css' + className={styles.container}
# Styled Components: const LoginContainer = styled.div`...`
# MUI: import { Card, Button } from '@mui/material'
```

**The template below uses Tailwind CSS. Adapt as needed:**

---

```typescript
// src/components/auth/OAuthCallback.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFoundryAuth } from '../../contexts/FoundryAuthContext';

/**
 * OAuth Callback Handler
 *
 * This component handles the OAuth redirect from the OAuth provider.
 * The provider redirects to this page with an authorization code in the URL.
 * We extract the code and exchange it for a claims token.
 *
 * ⚠️ CRITICAL: Uses useRef to prevent double execution in React Strict Mode
 * OAuth authorization codes are single-use - attempting to use them twice causes errors
 */
export const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useFoundryAuth();
  const [error, setError] = useState<string | null>(null);

  // ⛔ CRITICAL: Prevent double execution in React Strict Mode
  // React Strict Mode intentionally double-invokes effects in development
  // OAuth codes are single-use - second exchange attempt will fail
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processCallback = async () => {
      // Extract authorization code from URL
      const code = searchParams.get('code');

      if (!code) {
        setError('No authorization code received from OAuth provider');
        return;
      }

      try {
        // Exchange code for claims token
        await handleOAuthCallback(code);

        // Redirect to home page after successful authentication
        navigate('/', { replace: true });
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError((err as Error).message);
      }
    };

    processCallback();
  }, [searchParams, handleOAuthCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl">
        {error ? (
          <div>
            <div className="text-center mb-6">
              <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-10 w-10 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Authentication Failed</h2>
            </div>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Completing Authentication
            </h2>
            <p className="text-gray-600">Please wait while we sign you in...</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

**⚠️ Why the useRef Pattern is Critical:**

**Problem:** React Strict Mode (in development) intentionally double-invokes `useEffect` to help find bugs. This causes the OAuth callback to run twice.

**Issue:** OAuth authorization codes are **single-use tokens**. When the effect runs twice:
- ✅ First execution: Code exchange succeeds → token stored
- ❌ Second execution: Code already used → **"invalid_grant" error**

**Solution:** The `useRef(false)` pattern prevents the second execution:
```typescript
const hasProcessed = useRef(false);

useEffect(() => {
  if (hasProcessed.current) return;  // Skip if already processed
  hasProcessed.current = true;       // Mark as processed

  // ... process callback
}, [dependencies]);
```

**This pattern ensures:**
- ✅ Code is only exchanged once (even in Strict Mode)
- ✅ No "invalid_grant" errors on first login
- ✅ Clean user experience with no error flashes
- ✅ Works correctly in both development and production

---

## Step 4c: Create SAML Callback Component (for SAML providers)

⛔ **MANDATORY FOR SAML PROVIDERS** ⛔

**If you generated a SAML authentication context, you MUST create this callback component.**

This component handles the redirect from the SAML Identity Provider (IdP) back to your app.

**⚠️ CRITICAL: SAML is different from OAuth2:**
- OAuth2 sends `?code=...` in URL query parameter (GET)
- SAML sends `SAMLResponse` via POST (form submission)
- Different callback handling required

---

**⚠️ CRITICAL: Match Your Project's Styling Approach**

The component template below uses **Tailwind CSS** as the default. Before generating:

1. **Check existing auth components** (Login, ProtectedRoute, OAuthCallback if exists) - READ these files first
2. **Identify the styling approach** used in those components
3. **Generate this component using the SAME approach**

**If you already generated OAuthCallback component:**
- ✅ Use the EXACT same styling approach as OAuthCallback
- ✅ Copy the visual style (colors, layout, animations)
- ✅ Only change: "OAuth" text → "SAML", `code` → `SAMLResponse`

**Common styling approaches to detect:**
- **Tailwind CSS**: `className="flex items-center justify-center bg-gray-50"` (utility classes)
- **Plain CSS**: `className="saml-callback-container"` + `import './SAMLCallback.css'`
- **CSS Modules**: `className={styles.container}` + `import styles from './SAMLCallback.module.css'`
- **Styled Components**: `const Container = styled.div` declarations at file level
- **Material-UI**: `import { Box, Card, Button } from '@mui/material'` + MUI components
- **Chakra UI**: `import { Box, Spinner } from '@chakra-ui/react'` + Chakra components

**What to keep the same (functionality):**
- ✅ Component structure (error state, loading state, success state)
- ✅ useRef pattern for preventing double execution
- ✅ Logic (extracting SAMLResponse, calling handleSAMLCallback, navigation)
- ✅ Error handling and user feedback

**What to adapt (styling):**
- 🎨 Styling method (match existing components)
- 🎨 Colors and theme (match existing auth components)
- 🎨 Layout patterns (match existing spacing, shadows, borders, animations)
- 🎨 Component structure if using UI library (MUI Card vs div, MUI Button vs button)

**The template below uses Tailwind CSS. Adapt as needed:**

---

```typescript
// src/components/auth/SAMLCallback.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFoundryAuth } from '../../contexts/FoundryAuthContext';

/**
 * SAML Callback Handler
 *
 * This component handles the SAML redirect from the SAML Identity Provider (IdP).
 * The IdP redirects to this page with a SAMLResponse (typically via POST).
 * We extract the SAML response and exchange it for a claims token.
 *
 * ⚠️ CRITICAL: Uses useRef to prevent double execution in React Strict Mode
 * SAML responses are single-use - attempting to use them twice causes errors
 */
export const SAMLCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleSAMLCallback } = useFoundryAuth();
  const [error, setError] = useState<string | null>(null);

  // ⛔ CRITICAL: Prevent double execution in React Strict Mode
  // React Strict Mode intentionally double-invokes effects in development
  // SAML responses are single-use - second exchange attempt will fail
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processCallback = async () => {
      // Extract SAML response from URL
      // SAML IdPs typically POST to callback with SAMLResponse parameter
      const samlResponse = searchParams.get('SAMLResponse');
      const relayState = searchParams.get('RelayState');

      if (!samlResponse) {
        setError('No SAML response received from Identity Provider');
        return;
      }

      try {
        // Exchange SAML response for claims token
        await handleSAMLCallback(samlResponse, relayState);

        // Redirect to home page after successful authentication
        navigate('/', { replace: true });
      } catch (err) {
        console.error('SAML callback error:', err);
        setError((err as Error).message);
      }
    };

    processCallback();
  }, [searchParams, handleSAMLCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl">
        {error ? (
          <div>
            <div className="text-center mb-6">
              <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-10 w-10 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Authentication Failed</h2>
            </div>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Completing SAML Authentication
            </h2>
            <p className="text-gray-600">Please wait while we sign you in...</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

**⚠️ SAML Context Requirements:**

Your SAML authentication context must include a `handleSAMLCallback` function:

```typescript
// In your FoundryAuthContext for SAML:
interface AuthContextType {
  claimsToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  initiateSAMLLogin: () => void;
  handleSAMLCallback: (samlResponse: string, relayState?: string | null) => Promise<void>;
  logout: () => Promise<void>;
}

const handleSAMLCallback = async (samlResponse: string, relayState?: string | null): Promise<void> => {
  setIsLoading(true);
  setError(null);

  try {
    // Exchange SAML response for claims token
    const response = await authClient.exchangeSAMLResponse({
      SAMLResponse: samlResponse,
      RelayState: relayState,
      provider: providerName,  // from Swagger info.title
    });

    if (response.claims_token?.value) {
      const token = response.claims_token.value;
      setClaimsToken(token);
      setIsAuthenticated(true);
      localStorage.setItem('foundry_claims_token', token);
    } else {
      throw new Error('No claims token value received from server');
    }
  } catch (err) {
    setError(err as Error);
    throw err;
  } finally {
    setIsLoading(false);
  }
};
```

**⚠️ Key Differences from OAuth:**
- **Parameter name:** `SAMLResponse` (not `code`)
- **Optional parameter:** `RelayState` (application state preserved across redirect)
- **Endpoint:** `/saml/acs` (Assertion Consumer Service, not `/oauth2/token`)
- **HTTP Method:** Typically POST (not GET)

---

## Step 5: Wrap App with Auth Provider and Add Routes

⛔ **MANDATORY - WRAP APP WITH PROVIDER** ⛔

**CRITICAL:** You MUST wrap your entire app with `FoundryAuthProvider`. Without this, authentication will not work.

**For Username/Password Authentication:**

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FoundryAuthProvider } from './contexts/FoundryAuthContext';
import { Login } from './components/auth/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <FoundryAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {/* Your app content */}
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </FoundryAuthProvider>
  );
}

export default App;
```

**For OAuth Authentication:**

⛔ **CRITICAL: You MUST include the `/auth/callback` route for OAuth providers** ⛔

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FoundryAuthProvider } from './contexts/FoundryAuthContext';
import { Login } from './components/auth/Login';
import { OAuthCallback } from './components/auth/OAuthCallback';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <FoundryAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />  {/* ⛔ REQUIRED for OAuth */}

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {/* Your app content */}
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </FoundryAuthProvider>
  );
}

export default App;
```

**For SAML Authentication:**

⛔ **CRITICAL: You MUST include the `/auth/callback` route for SAML providers** ⛔

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FoundryAuthProvider } from './contexts/FoundryAuthContext';
import { Login } from './components/auth/Login';
import { SAMLCallback } from './components/auth/SAMLCallback';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <FoundryAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<SAMLCallback />} />  {/* ⛔ REQUIRED for SAML */}

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {/* Your app content */}
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </FoundryAuthProvider>
  );
}

export default App;
```

## Step 6: Create Protected Route Component

**Use template:** `templates/auth/components/ProtectedRoute.tsx`

**⚠️ IMPORTANT: Check if file already exists (incremental integration)**

**Action:**
```typescript
const protectedRoutePath = path.join(projectRoot, 'src/components/auth/ProtectedRoute.tsx');

if (fs.existsSync(protectedRoutePath)) {
  // File already exists - app already has route protection
  // DO NOT overwrite - user may have customizations
  console.log('ProtectedRoute.tsx already exists - skipping generation');
  console.log('Existing ProtectedRoute component will be used');
} else {
  // File doesn't exist - create from template
  const templatePath = path.join(skillDir, 'templates/auth/components/ProtectedRoute.tsx');
  fs.mkdirSync(path.dirname(protectedRoutePath), { recursive: true });
  fs.copyFileSync(templatePath, protectedRoutePath);
  console.log('Created ProtectedRoute.tsx from template');
}
```

**Purpose:** Redirects unauthenticated users to `/login` page

**Usage in routes:**
```typescript
<Route path="/" element={
  <ProtectedRoute>
    <HomePage />
  </ProtectedRoute>
} />
```

**Why not overwrite:**
- User may have customized redirect behavior (e.g., redirect to different login page, show loading spinner, etc.)
- Component is simple but may have project-specific styling or logic
- If user is adding a new service to an existing Foundry app, route protection is already set up

## Step 7: Use Claims Token in Service Calls

⛔ **CRITICAL - ALL SERVICE CALLS MUST INCLUDE CLAIMS TOKEN** ⛔

```typescript
// Example: Integration/Orchestration service client
export class {ServiceName}Client {
  private claimsToken?: string;

  constructor(claimsToken?: string) {
    this.claimsToken = claimsToken;
  }

  async {operation}(params: any) {
    const response = await fetch(`${foundryConfig.baseURL}/services/{ServiceName}/{operation}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Voltmx-App-Key': foundryConfig.appKey,
        'X-Voltmx-App-Secret': foundryConfig.appSecret,
        // CRITICAL: Include claims token if authenticated
        ...(this.claimsToken && { 'X-Voltmx-Authorization': this.claimsToken }),
      },
      body: JSON.stringify(params),
    });

    return response.json();
  }
}

// Usage in hook:
export function use{ServiceName}() {
  const { claimsToken } = useFoundryAuth();
  const client = new {ServiceName}Client(claimsToken || undefined);

  // ... rest of hook
}
```

## Parsing Swagger for Authentication

### Identify Identity Service Type

```bash
# Check authentication type from Swagger
jq -r '.paths | keys[]' IdentityService.json

# OAuth2 pattern
# - /oauth2/login
# - /oauth2/token

# Standard login pattern
# - /login

# SAML pattern
# - /saml/login
# - /saml/acs

# LDAP pattern
# - /login with LDAP-specific fields in loginRequestParams
```

### Extract Request Parameters

```bash
# Get all login request fields
jq '.definitions.loginRequestParams.properties' IdentityService.json

# Common fields across identity types:
# - userid/username: string
# - password: string
# - provider: string (for OAuth)
# - domain: string (for LDAP)
# - scope: string (for OAuth)
```

### Extract Response Structure

```bash
# Get login response structure
jq '.definitions.loginResponseParams.properties' IdentityService.json

# Standard response includes:
# - claims_token: { value: string, exp: number }
# - refresh_token: string (optional)
# - profile: { userid, email, firstname, lastname } (optional)
```

### Extract Deployment Pattern

```bash
# Get basePath to determine deployment pattern
jq -r '.basePath // ""' IdentityService.json

# Cloud deployment:
# - Output: "" (empty string)
# - Use baseURL directly

# On-premise deployment:
# - Output: "/authService/100000012"
# - Append to baseURL
```

## Common Identity Service Patterns

### Pattern 1: OAuth Provider (Google, Facebook, etc.)
```json
{
  "basePath": "/authService/100000002",
  "paths": {
    "/oauth2/login": { "get": {...} },
    "/oauth2/token": { "post": {...} }
  }
}
```

### Pattern 2: Custom User Store (LDAP, Database)
```json
{
  "basePath": "/authService/100000002",
  "paths": {
    "/login": { "post": {...} }
  },
  "definitions": {
    "loginRequestParams": {
      "properties": {
        "userid": {"type": "string"},
        "password": {"type": "string"},
        "provider": {"type": "string"}
      }
    }
  }
}
```

### Pattern 3: SAML Provider
```json
{
  "basePath": "/authService/100000002",
  "paths": {
    "/saml/login": { "get": {...} },
    "/saml/acs": { "post": {...} }
  }
}
```

### Pattern 4: Cloud Deployment (Empty basePath)
```json
{
  "host": "100000012.auth.sit-hclvoltmx.net",
  "basePath": "",
  "paths": {
    "/login": { "post": {...} }
  }
}
```

## Verification Checklist

⛔ **ALL ITEMS MANDATORY** ⛔

### Swagger Analysis:
- [ ] Scanned Swagger directory for Identity service JSON files
- [ ] Identified authentication type (OAuth, LDAP, SAML, custom)
- [ ] Parsed login endpoint from Swagger `paths`
- [ ] Parsed request parameters from `definitions.loginRequestParams`
- [ ] Parsed response structure from `definitions.loginResponseParams`
- [ ] **Extracted `host` from identity service Swagger (for VITE_FOUNDRY_AUTH_HOST)**
- [ ] **Extracted `host` from integration/object service Swagger (for VITE_FOUNDRY_SERVICE_HOST)**
- [ ] **Parsed `basePath` from Swagger (DO NOT HARDCODE)**
- [ ] **Handled empty basePath for cloud deployments**

### Configuration Files:
- [ ] **Generated `src/config/foundry.config.ts` with authHost and serviceHost**
- [ ] **Generated or updated `.env` with extracted Swagger host values**
- [ ] **Determined deployment type (cloud/on-premise) and activated correct section in .env**
- [ ] Configuration uses `VITE_FOUNDRY_AUTH_HOST` environment variable
- [ ] Configuration uses `VITE_FOUNDRY_SERVICE_HOST` environment variable
- [ ] Configuration uses `VITE_FOUNDRY_APP_KEY` and `VITE_FOUNDRY_APP_SECRET`

### Authentication Client:
- [ ] Created authentication client (custom OR FoundryAccountsClient)
- [ ] **Client uses `foundryConfig.authHost` (NOT hardcoded URLs)**
- [ ] **Client constructs URL as `https://${foundryConfig.authHost}${servicePath}`**
- [ ] Custom Identity client uses JSON format
- [ ] **Custom Identity client uses parsed basePath (not hardcoded)**
- [ ] FoundryAccountsClient uses form-urlencoded (NOT JSON)

### Authentication Context & UI:
- [ ] Created FoundryAuthContext with Context Provider pattern
- [ ] Created useFoundryAuth hook that uses Context
- [ ] Hook throws error if used outside provider
- [ ] Wrapped entire App with FoundryAuthProvider
- [ ] Provider stores claims token in localStorage
- [ ] Created Login component matching authentication type
- [ ] Added /login route to app
- [ ] Created ProtectedRoute component

### Service Integration:
- [ ] All service clients accept claimsToken parameter
- [ ] **All service clients use `foundryConfig.serviceHost` (NOT hardcoded URLs)**
- [ ] All service calls include X-Voltmx-Authorization header (when authenticated)
- [ ] All service calls include X-Voltmx-App-Key and X-Voltmx-App-Secret headers

## Common Mistakes

❌ **⚠️ CRITICAL: Extracting host from wrong Swagger file (causes 403 Forbidden)**
- Using service host for auth: `VITE_FOUNDRY_AUTH_HOST=m100000012001.sit-hclvoltmx.net` ❌
- Correct: `VITE_FOUNDRY_AUTH_HOST=100000012.auth.sit-hclvoltmx.net` ✅
- **PROBLEM:** Not distinguishing between identity service Swagger and integration service Swagger
- **FIX:** Identity services have `/login`, `/oauth2/login`, or `.auth.` in host
- **FIX:** Integration/Object services do NOT have authentication paths
- **ERROR:** 403 Forbidden when trying to login - auth service rejects requests
- **REAL EXAMPLE:**
  ```bash
  # WRONG - using integration service host for auth
  VITE_FOUNDRY_AUTH_HOST=m100000012001.sit-hclvoltmx.net

  # CORRECT - using identity service host for auth
  VITE_FOUNDRY_AUTH_HOST=100000012.auth.sit-hclvoltmx.net
  ```

❌ **⚠️ CRITICAL: Truncating host value (missing /services suffix)**
- Extracted: `m100000012001.sit-hclvoltmx.net/services` (from Swagger)
- Used: `m100000012001.sit-hclvoltmx.net` ❌ (truncated `/services`)
- **PROBLEM:** Removing `/services` suffix from the host value
- **FIX:** Use the EXACT value from `jq -r '.host'` - do NOT modify it
- **ERROR:** API calls fail - endpoints can't be reached
- **REAL EXAMPLE:**
  ```bash
  # Swagger has this:
  "host": "m100000012001.sit-hclvoltmx.net/services"

  # WRONG - removed /services
  VITE_FOUNDRY_SERVICE_HOST=m100000012001.sit-hclvoltmx.net

  # CORRECT - exact value from Swagger
  VITE_FOUNDRY_SERVICE_HOST=m100000012001.sit-hclvoltmx.net/services
  ```

❌ **⚠️ CRITICAL: Hardcoding URLs instead of using environment variables**
- Hardcoding `https://100000012.auth.sit-hclvoltmx.net` directly in service clients
- Using `foundryConfig.baseURL` instead of separate `authHost` and `serviceHost`
- Not extracting host values from Swagger to populate `.env`
- **FIX:** Always use `foundryConfig.authHost` and `foundryConfig.serviceHost` from environment variables
- **FIX:** Extract host values using `jq -r '.host'` from Swagger files
- **ERROR:** App won't work when deployed to different environments (dev/staging/prod)
- **ERROR:** Code must be regenerated for each environment instead of just updating `.env`

❌ **⚠️ CRITICAL: Using single VITE_FOUNDRY_BASE_URL for cloud deployments**
- Trying to use one base URL for both auth and services in cloud
- Cloud has separate subdomains: `*.auth.*` for identity, `m*.*` for services
- **FIX:** Use `VITE_FOUNDRY_AUTH_HOST` and `VITE_FOUNDRY_SERVICE_HOST` separately
- **ERROR:** Cloud deployments will fail - no single base URL exists

❌ **⚠️ CRITICAL: Hardcoding servicePath instead of parsing from Swagger**
- Hardcoding `/authService/100000012` in the client constructor
- Not handling empty basePath for cloud deployments
- **FIX:** Always parse basePath using `jq -r '.basePath // ""'` and use the exact value
- **ERROR:** Cloud deployments will fail with 404 because `/authService/` path doesn't exist

❌ **⚠️ CRITICAL: Substituting a different authentication type than user requested**
- User asks for OAuth but you decide to use username/password because it's "simpler" or "more practical"
- User asks for SAML but you use custom userstore instead
- Deciding one authentication method is better than what user explicitly requested
- **FIX:** ALWAYS use the EXACT authentication type user requested - NEVER substitute or decide differently
- **Example error**: "However, for simplicity in this application, I'll implement a fallback authentication approach that works with the username/password service which has standard username/password login. This is more practical..."
- **This is NEVER acceptable** - you must implement what the user requested, not what you think is easier

❌ **⚠️ CRITICAL: Using multiple identity services or creating provider selection dropdowns**
- Creating dropdown to let users choose between different identity services at runtime
- Using both identity services in the same app
- **FIX:** Select ONLY ONE identity service based on user's request, inspect Swagger paths to match type

❌ **⚠️ CRITICAL: Matching identity service by name instead of structure**
- Assuming a service is OAuth because the name contains "OAuth" or "Google"
- Identity service names are user-chosen and can be ANYTHING - they don't indicate type
- **FIX:** Inspect Swagger paths - `/oauth2/` indicates OAuth, `/login` indicates username/password, `/saml/` indicates SAML

❌ **⚠️ CRITICAL: Assuming there are only 2-3 identity service types**
- Thinking only OAuth and username/password exist
- Not considering SAML, LDAP, Active Directory, Salesforce, Okta, Siteminder, etc.
- **FIX:** Foundry supports 15+ identity service types - inspect Swagger structure to determine flow

❌ **⚠️ CRITICAL: Wrong login UI for identity service type**
- Generating username/password form for OAuth providers (should be redirect button)
- Generating redirect button for username/password providers (should be form fields)
- **FIX:** Always check Swagger paths first - `/oauth2/` or `/saml/` means redirect flow, `/login` alone means form flow

❌ **⚠️ CRITICAL: Missing provider parameter in OAuth2 requests**
- Not including `provider` query parameter in `/oauth2/login` GET request
- Not including `provider` field in `/oauth2/token` POST request body
- **FIX:** OAuth2 providers ALWAYS require the `provider` parameter (from Swagger `info.title`)
- **ERROR MESSAGE:** `"Invalid provider name. provider name can't be null or empty"` with 401 Unauthorized
- **Example**: `params.append('provider', 'GoogleOauthprovider');` where "GoogleOauthprovider" is from Swagger `info.title`

❌ **Using plain hook instead of Context Provider** - Will cause infinite redirect loops

❌ **Forgetting to wrap App with FoundryAuthProvider** - Will cause errors or redirect loops

❌ **Using JSON for accounts login** - Must be form-urlencoded

❌ **Wrong header name** - Must be `X-Voltmx-Authorization`, not `Authorization`

❌ **Not storing claims token** - Store `claims_token.value` in localStorage

❌ **⚠️ CRITICAL: Double-encoding claims token**
- Using `JSON.stringify(response.claims_token)` as fallback creates stringified JSON instead of token string
- This causes authentication to fail on all subsequent API calls
- **FIX:** Only use `claims_token.value` - throw error if it doesn't exist
- Example of wrong token: `'{"value":"abc123","exp":123456}'` ← This is double-encoded
- Example of correct token: `'abc123'` ← Just the value string

❌ **⚠️ CRITICAL: Incorrect provider name (MOST COMMON 400 ERROR)**
- Using modified version of identity service name instead of exact Swagger `info.title`
- Modifying the name (removing characters, changing case, removing pluralization, etc.)
- **FIX:** Always use the EXACT value from Swagger `info.title` (case-sensitive, no modifications)
- **ERROR MESSAGE:** `"Invalid Provider Name in Login Request"` with 400 status code
- **Example**: Swagger `info.title` = "MyAuthService_v2" → Use exactly "MyAuthService_v2", not "MyAuthService" or "myauthservice_v2"

❌ **Missing provider field for custom userstores** - Will cause authentication to fail

❌ **Including provider field for accounts login** - Should only be used for custom userstores

❌ **Not passing token to services** - All authenticated services need the claims token

❌ **Not parsing Swagger correctly** - Must extract exact field names from definitions
