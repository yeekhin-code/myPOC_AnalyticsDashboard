# Foundry Authentication Templates

This directory contains reusable templates for generating Foundry authentication code.

**⚠️ IMPORTANT: Supports Incremental Integration**

These templates are designed to support adding Foundry services to existing apps without breaking existing code. Always check if files exist before generating.

## Template Structure

```
templates/
├── config/
│   ├── foundry.config.ts      # Foundry configuration with environment variables
│   └── env.template           # .env file template with placeholders
├── auth/
│   ├── clients/
│   │   └── FoundryAccountsClient.ts  # Fallback authentication client
│   └── components/
│       └── ProtectedRoute.tsx        # Route protection component
└── README.md
```

## Usage

### 1. Configuration Files (Always Generate)

**foundry.config.ts**
- **Location:** `src/config/foundry.config.ts`
- **Usage:** Copy as-is, no modifications needed
- **Purpose:** Provides environment variable configuration for Foundry services

**env.template**
- **Location:** `.env` (root of project)
- **Usage:** Replace placeholders with values extracted from Swagger
- **Placeholders:**
  - `{{CLOUD_SECTION_COMMENT}}` - "# Active..." or "# Commented out..."
  - `{{CLOUD_COMMENT_PREFIX}}` - Empty string or "# "
  - `{{CLOUD_AUTH_HOST}}` - From identity service Swagger `host` field
  - `{{CLOUD_SERVICE_HOST}}` - From integration/object service Swagger `host` field
  - `{{ONPREM_SECTION_COMMENT}}` - "# Active..." or "# Commented out..."
  - `{{ONPREM_COMMENT_PREFIX}}` - Empty string or "# "
  - `{{ONPREM_AUTH_HOST}}` - Example on-premise host
  - `{{ONPREM_SERVICE_HOST}}` - Example on-premise service host

**How to populate .env template:**

```typescript
// Detect deployment type from Swagger
const identityBasePath = extractBasePath(identitySwagger);
const isCloud = identityBasePath === '';

// Extract host values
const cloudAuthHost = extractHost(identitySwagger);
const cloudServiceHost = extractHost(integrationSwagger);

// Replace placeholders
const envContent = envTemplate
  .replace('{{CLOUD_SECTION_COMMENT}}', isCloud
    ? '# Active - This matches the Foundry Swagger export used to generate this app'
    : '# Commented out - Uncomment and update for cloud deployments')
  .replace(/{{CLOUD_COMMENT_PREFIX}}/g, isCloud ? '' : '# ')
  .replace('{{CLOUD_AUTH_HOST}}', cloudAuthHost)
  .replace('{{CLOUD_SERVICE_HOST}}', cloudServiceHost)
  .replace('{{ONPREM_SECTION_COMMENT}}', !isCloud
    ? '# Active - This matches the Foundry Swagger export used to generate this app'
    : '# Commented out - Uncomment and update for on-premise deployments')
  .replace(/{{ONPREM_COMMENT_PREFIX}}/g, !isCloud ? '' : '# ')
  .replace('{{ONPREM_AUTH_HOST}}', 'my-company-foundry.net')
  .replace('{{ONPREM_SERVICE_HOST}}', 'my-company-foundry.net/services');
```

### 2. Authentication Clients

**FoundryAccountsClient.ts**
- **When to use:** When NO custom identity service is found in Swagger export
- **Location:** `src/services/foundry/identity/FoundryAccountsClient.ts`
- **Usage:** Copy as-is, no modifications needed
- **Purpose:** Provides default Foundry Accounts authentication

**Custom Identity Clients** (not templated)
- For custom identity services, generate from SKILL.md instructions
- Each identity service type (OAuth, SAML, LDAP, etc.) has different requirements
- Templates would need too many variations - better to generate from Swagger

### 3. UI Components

**ProtectedRoute.tsx**
- **When to use:** Always (required for route protection)
- **Location:** `src/components/auth/ProtectedRoute.tsx`
- **Usage:** Copy as-is, no modifications needed
- **Purpose:** Redirects unauthenticated users to login page

**Other UI Components** (not templated)
- Login components vary based on authentication type (form vs redirect button)
- OAuth/SAML callback components have conditional logic
- Better to generate from SKILL.md instructions based on detected auth type

## Incremental Integration Scenarios

### Scenario 1: Fresh app, first Foundry integration
**User:** "Create a UI to manage pets"
**Later:** "Now integrate with the SwaggerTest service from this Foundry file"

**Actions:**
- ✅ Create `foundry.config.ts` (doesn't exist)
- ✅ Create `.env` with full template (doesn't exist)
- ✅ Create `FoundryAccountsClient.ts` (doesn't exist)
- ✅ Create `ProtectedRoute.tsx` (doesn't exist)
- ✅ Create auth context and login UI

### Scenario 2: App already has Foundry, adding another service
**User:** "Create an app using ServiceA from this Foundry file"
**Later:** "Now also add integration with ServiceB from this new Foundry file"

**Actions:**
- ⏭️ Skip `foundry.config.ts` (already exists, still valid)
- ✅ Update `.env` with comment showing detected values (preserve existing config)
- ⏭️ Skip `FoundryAccountsClient.ts` (already exists if no custom identity)
- ⏭️ Skip `ProtectedRoute.tsx` (already exists)
- ⏭️ Skip auth context and login UI (already exists)
- ✅ Generate only the new service client for ServiceB

### Scenario 3: Non-Foundry app, adding Foundry
**User:** "Create a pets management UI" (no Foundry)
**Later:** "Integrate with this Foundry file to store pets data"

**Actions:**
- ✅ Create `foundry.config.ts` (doesn't exist)
- ✅ Update `.env` (may exist for other purposes - prepend Foundry config)
- ✅ Create `FoundryAccountsClient.ts` (doesn't exist)
- ✅ Create `ProtectedRoute.tsx` (doesn't exist)
- ✅ Create auth context and login UI

### Scenario 4: Switching environments (dev → prod)
**User:** "I attached the production Foundry file, update the config"

**Actions:**
- ⏭️ Skip `foundry.config.ts` (doesn't change between environments)
- ✅ Update `.env` with comment showing detected prod values (user manually updates)
- ⏭️ Skip all other files (environment change only affects `.env`)

## Template Selection Logic

```typescript
// 1. Check-and-create pattern (don't overwrite)
if (!fs.existsSync('src/config/foundry.config.ts')) {
  generateFromTemplate('config/foundry.config.ts', 'src/config/foundry.config.ts');
}

// 2. Always update .env (designed for incremental updates)
generateOrUpdateEnv('config/env.template', '.env', swaggerValues);

// 3. Check-and-create for stable components
if (!fs.existsSync('src/components/auth/ProtectedRoute.tsx')) {
  generateFromTemplate('auth/components/ProtectedRoute.tsx', 'src/components/auth/ProtectedRoute.tsx');
}

// 4. Check-and-create for authentication client
if (!hasCustomIdentityService && !fs.existsSync('src/services/foundry/identity/FoundryAccountsClient.ts')) {
  generateFromTemplate('auth/clients/FoundryAccountsClient.ts', 'src/services/foundry/identity/FoundryAccountsClient.ts');
}

// 5. Generate auth context and login UI from SKILL.md (if not exists)
// These depend on authentication type and have complex conditional logic
if (!fs.existsSync('src/contexts/FoundryAuthContext.tsx')) {
  generateAuthContext(authType);
  generateLoginUI(authType);
}
```

## Why Not Template Everything?

**Templated (stable, predictable):**
- Configuration files - always the same structure
- FoundryAccountsClient - always the same (fallback auth)
- ProtectedRoute - simple, no variations

**Not Templated (variable, Swagger-dependent):**
- Custom identity clients - vary by provider type (OAuth, SAML, LDAP, etc.)
- Auth contexts - different for username/password vs OAuth flows
- Login UI - different for form vs redirect button
- Callback components - OAuth vs SAML have different parameter handling

These are better generated from SKILL.md instructions that inspect Swagger and adapt accordingly.
