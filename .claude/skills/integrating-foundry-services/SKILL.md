---
name: integrating-foundry-services
description: Complete Foundry service integration - generates TypeScript service clients, React hooks, UI components, and application scaffolding for HCL Foundry services from Swagger API documentation - handles BOTH new apps and existing apps
---

# Integrating Foundry Services from Swagger API Documentation

**This skill handles COMPLETE FOUNDRY SERVICE INTEGRATION for both new and existing applications.**

Generate TypeScript service clients, type definitions, React hooks, UI components, routing, and navigation for interacting with HCL Foundry backend services using Swagger/OpenAPI JSON documentation.

**Scope:**
- ✅ New application generation from scratch
- ✅ Adding Foundry services to existing applications
- ✅ Backend integration (service clients, hooks, types)
- ✅ UI generation (forms, tables, modals, pages) - when requested
- ✅ Routing and navigation setup

---

# ⛔ CRITICAL PREREQUISITE - INVOKE AUTHENTICATION SKILL FIRST ⛔

**🛑 STOP - READ THIS BEFORE DOING ANYTHING 🛑**

**BEFORE YOU READ ANY FURTHER IN THIS SKILL, YOU MUST INVOKE:**

```
Use Skill tool with command: "authenticating-foundry-apps"
```

**This provides ALL authentication code** (identity clients, context, hooks, login, protected routes).

---

**Why you MUST do this FIRST:**
- ❌ This skill does NOT contain authentication implementation code
- ❌ All authentication code has been moved to the authenticating-foundry-apps skill
- ✅ You MUST invoke that skill to get authentication patterns
- ✅ The authentication skill handles BOTH custom Identity Services AND Foundry Accounts fallback
- ✅ Authentication is ALWAYS required for Foundry apps - the auth skill determines which type to generate

**🚨 DO NOT PROCEED TO READ THE REST OF THIS SKILL UNTIL:**
1. ✅ You have invoked "authenticating-foundry-apps" using the Skill tool
2. ✅ You have read and understood the authentication skill
3. ✅ You are ready to use patterns from that skill (not from this one)

**IF YOU SKIP THIS STEP, THE GENERATED APP WILL HAVE BROKEN OR MISSING AUTHENTICATION.**

---

## UI Generation Policy

**Carefully analyze the user's request to determine whether to generate UI components.**

### Generate UI Components When:

1. **User explicitly requests UI:**
   - "Create a form for...", "Add a table to display...", "Build UI for..."
   - "Generate components for the Employee service"

2. **User creates new app without specifics:**
   - "Create an app that integrates with the services of the attached foundry app"
   - "Build an application for these Foundry services"
   - **Default behavior: Generate UI for ALL services**

3. **User requests integration for all services:**
   - "Integrate with all the Foundry services"
   - "Add support for all these services"

### DO NOT Generate UI When:

1. **User only wants backend integration:**
   - "Generate TypeScript clients for these services"
   - "Create service clients and hooks"
   - "Integrate the backend services"

2. **User has existing UI to connect:**
   - "Connect my existing employee form to the Foundry service"
   - "Integrate my current UI with the Employee service"
   - "Use the Foundry service in my existing component"

3. **User requests specific non-UI work:**
   - "Add authentication"
   - "Set up the service clients"

### When Ambiguous:

**If you cannot determine from context whether to generate UI, ASK the user:**

```
"Should I generate UI components (forms, tables, pages) for these services,
or would you prefer just the backend service clients and hooks?"
```

### UI Generation Scope:

When generating UI:
- **Object Services:** Full CRUD UI (list table, create/edit modal, delete confirmation)
- **Integration Services:** Operation forms with parameter inputs and result displays
- **Orchestration Services:** Composite operation forms with combined data displays
- **New Apps:** Also generate routing, navigation, and page composition
- **Existing Apps:** Just add components and route entries

---

## Scope of This Skill

**This skill provides EVERYTHING for Foundry service integration:**

### Backend Integration:
- ✅ TypeScript service client generation from Swagger (Integration, Object, Orchestration)
- ✅ Type definitions from Swagger definitions
- ✅ React hooks for data fetching and mutations
- ✅ Configuration setup (foundry.config.ts, .env)
- ✅ OData query parameter handling
- ✅ Response normalization (e.g., records → objectName)

### UI Generation (when requested):
- ✅ UI components for service operations (forms, tables, modals)
- ✅ Full CRUD interfaces for Object services
- ✅ Operation forms for Integration/Orchestration services
- ✅ Pages that compose service components

### Application Setup (Foundry-specific):
- ✅ Foundry configuration file (foundry.config.ts)
- ✅ Foundry environment variables (.env additions)
- ✅ Foundry directory structure (services/foundry/, types/, hooks/)
- ✅ Navigation components that link to Foundry service pages
- ✅ Routing integration for Foundry service UI

**This skill does NOT provide:**
- ❌ Authentication implementation - use `authenticating-foundry-apps`
- ❌ Base project setup (Vite, React, Tailwind, React Router) - use `configuring-vite-environments`

**Related Skills You Need:**
- `authenticating-foundry-apps` - MANDATORY, provides authentication (Identity clients, context, hooks)
- `configuring-vite-environments` - For base project setup (Vite, React, Tailwind, routing) - invoke this FIRST for new apps

## When to Use This Skill

**Use `integrating-foundry-services` for ALL Foundry integration scenarios:**

### New Applications:
- ✅ "Create an app that integrates with the services of the attached foundry app"
- ✅ "Build a new application for these Foundry services"
- ✅ Generate complete app with service integration

### Existing Applications:
- ✅ "Add Foundry service integration to my existing app"
- ✅ "Connect my app to the Employee service"
- ✅ Add service clients, hooks, and optionally UI to existing codebase

### Backend Only:
- ✅ "Generate TypeScript clients for these Foundry services"
- ✅ "Create service clients and hooks" (no UI generation)

## Critical API Rules

### Headers (Exact Names)
```typescript
'X-Voltmx-Authorization': claimsToken
'X-Voltmx-App-Key': appKey
'X-Voltmx-App-Secret': appSecret
```

### Service Endpoints (from Swagger)
```typescript
// Integration/Orchestration: basePath = /{ServiceName}
POST ${host}${basePath}${path}  // e.g., /services/WeatherService/getWeather

// Object Services: basePath = /data/v1/{ServiceName}
GET/POST/PUT/DELETE ${host}${basePath}${path}  // e.g., /services/data/v1/EmployeeObjService/objects/Employee

// Identity: basePath = /authService/*
POST ${baseUrl}${basePath}${path}  // e.g., /authService/100000002/login
```

### Object Service Response Normalization

**CRITICAL:** Foundry returns `records` field, always normalize:

```typescript
export interface {ObjectName}Response {
  records?: {ObjectName}[];
  {objectName}?: {ObjectName}[];  // lowercase
  opstatus: number;
  httpStatusCode?: number;
}

async get(params?: ODataQueryParams): Promise<{ObjectName}Response> {
  const data = await response.json();
  const objectNameLower = '{objectName}'.toLowerCase();
  if (data.records && !data[objectNameLower]) {
    data[objectNameLower] = data.records;
  }
  return data;
}
```

### Object Service Update Field Filtering

**⛔ CRITICAL:** Foundry automatically manages certain system fields. These fields **MUST NOT** be included in update requests or the request may fail.

**System-Managed Fields (DO NOT send in updates):**
- `CreatedBy` - Set automatically by Foundry on create
- `CreatedDateTime` - Set automatically by Foundry on create
- `LastUpdatedBy` - Updated automatically by Foundry on update
- `LastUpdatedDateTime` - Updated automatically by Foundry on update
- `SoftDeleteFlag` - Managed by Foundry for soft deletes

**How to Identify User-Editable Fields from Swagger:**

```bash
# Get all properties from the object definition
jq '.definitions.{ObjectName}.properties | keys[]' object-service.json

# Example output for Employee:
# "CreatedBy"          ← System-managed (exclude)
# "CreatedDateTime"    ← System-managed (exclude)
# "Email"              ← User-editable (include)
# "Id"                 ← Primary key (include in updates, not in formData)
# "LastUpdatedBy"      ← System-managed (exclude)
# "LastUpdatedDateTime" ← System-managed (exclude)
# "Name"               ← User-editable (include)
# "SoftDeleteFlag"     ← System-managed (exclude)
```

**Field Classification Rules:**
1. **Primary Key** (usually `Id`): Include in update payload, NOT in formData
2. **User-Editable**: Custom business fields (Name, Email, Age, etc.) - Include in formData
3. **System-Managed**: Created*, LastUpdated*, SoftDeleteFlag - Exclude from both

**Update Request Rules:**
- ✅ **DO** include the primary key field (e.g., `Id`) - Required for identifying the record
- ✅ **DO** include user-editable fields (e.g., `Name`, `Email`, custom fields)
- ❌ **DO NOT** include system-managed fields listed above
- ❌ **DO NOT** include fields with lowercase variants (e.g., `createdby`, `lastupdatedby`)

**Why this matters:**
- Including system fields in updates can cause **400 Bad Request** errors
- Foundry may reject the update or behave unpredictably
- System fields are managed by Foundry's backend and should never be client-controlled

**Implementation Pattern:**
- **Client filtering** (already implemented in update() method) - filters all system fields
- **UI component filtering** (handleEdit function) - only sets user-editable fields in formData
- **Submit handler** (handleSubmit function) - explicitly includes primary key + formData

## Detect Context: New App vs Existing App

**Before starting, determine the context:**

### Indicators of Existing App
- `package.json` exists in the project directory
- `src/` directory exists with components
- Existing routing setup (React Router)
- `vite.config.ts` or similar build configuration exists

### Indicators of New App
- Empty or minimal directory
- No `package.json`
- User explicitly says "create new app" or "generate app"

### Workflow for New Apps

**For new applications, you must FIRST invoke `configuring-vite-environments` skill:**

1. **`configuring-vite-environments`** - Sets up base project (Vite, React, TypeScript, Tailwind, routing)
2. **`authenticating-foundry-apps`** - Adds Foundry authentication
3. **`integrating-foundry-services`** (this skill) - Adds Foundry service integration

**This skill assumes the base React+Vite+Tailwind project already exists.** If it doesn't, invoke `configuring-vite-environments` first.

### Workflow for Existing Apps

**For existing applications:**

1. **`authenticating-foundry-apps`** - Adds Foundry authentication (if not present)
2. **`integrating-foundry-services`** (this skill) - Adds Foundry service integration to existing structure

---

## Pre-Implementation Analysis

### 1. Service Discovery from Swagger

```bash
cd /path/to/swagger-export-directory

echo "=== Identity Services ==="
for file in *.json; do
  basePath=$(jq -r '.basePath // empty' "$file")
  if [[ "$basePath" == /authService/* ]]; then
    echo "  $(jq -r '.info.title' "$file") - $file"
  fi
done

echo "=== Integration Services ==="
for file in *.json; do
  basePath=$(jq -r '.basePath // empty' "$file")
  host=$(jq -r '.host // empty' "$file")
  if [[ "$basePath" != /authService/* && "$basePath" != /data/v1/* && "$host" == */services* ]]; then
    echo "  $(jq -r '.info.title' "$file") - $file"
  fi
done

echo "=== Object Services ==="
for file in *.json; do
  basePath=$(jq -r '.basePath // empty' "$file")
  if [[ "$basePath" == /data/v1/* ]]; then
    echo "  $(jq -r '.info.title' "$file") - $file"
  fi
done
```

### 2. Create Service Inventory

Document all services in `FOUNDRY_SERVICES_INVENTORY.md`:
- Service names, types (Identity/Integration/Object/Orchestration)
- basePath and host from Swagger
- Operations with inputs/outputs from Swagger paths and definitions
- Objects with fields and CRUD verbs from Swagger

## Integration Steps

### Phase 0: Authentication Skill

⛔ **MANDATORY FIRST STEP - INVOKE AUTHENTICATION SKILL** ⛔

**STOP! Before proceeding to Phase 1:**

🛑 **YOU MUST USE THE Skill TOOL TO INVOKE: `authenticating-foundry-apps`**

```
Use the Skill tool with skill name: "authenticating-foundry-apps"
```

**DO NOT CONTINUE until you have:**
1. ✅ Invoked the `authenticating-foundry-apps` skill using the Skill tool
2. ✅ Received the complete authentication implementation patterns
3. ✅ Understood how to implement authentication for this project

**Why this is mandatory:**
- The authentication skill contains critical implementation details NOT included here
- It provides complete code for Identity clients, FoundryAuthContext, hooks, and components
- It handles BOTH custom Identity Services AND Foundry Accounts fallback
- **Authentication is ALWAYS required** - the skill determines which type to generate
- Skipping this step will result in broken or incomplete authentication

**⚠️ CRITICAL: This skill does NOT contain authentication implementation details. You MUST invoke the authenticating-foundry-apps skill to get them.**

**Do NOT proceed to Phase 1 until you have invoked the authenticating-foundry-apps skill**

### Phase 1: Configuration

⛔ **MANDATORY - ALWAYS CREATE THESE FILES** ⛔

**REQUIRED:** You MUST create both .env and foundry.config.ts files. These are NOT optional.

**foundry.config.ts:**

⛔ **GET FROM authenticating-foundry-apps SKILL TEMPLATES** ⛔

**This file is generated by the `authenticating-foundry-apps` skill.**

The configuration should use `authHost` and `serviceHost` (NOT `baseURL`):

```typescript
export interface FoundryConfig {
  authHost: string;
  serviceHost: string;
  appKey: string;
  appSecret: string;
}

export const foundryConfig: FoundryConfig = {
  authHost: import.meta.env.VITE_FOUNDRY_AUTH_HOST || '',
  serviceHost: import.meta.env.VITE_FOUNDRY_SERVICE_HOST || '',
  appKey: import.meta.env.VITE_FOUNDRY_APP_KEY || '',
  appSecret: import.meta.env.VITE_FOUNDRY_APP_SECRET || '',
};

export function validateFoundryConfig(): void {
  const missing: string[] = [];
  if (!foundryConfig.authHost) missing.push('VITE_FOUNDRY_AUTH_HOST');
  if (!foundryConfig.serviceHost) missing.push('VITE_FOUNDRY_SERVICE_HOST');
  if (!foundryConfig.appKey) missing.push('VITE_FOUNDRY_APP_KEY');
  if (!foundryConfig.appSecret) missing.push('VITE_FOUNDRY_APP_SECRET');

  if (missing.length > 0) {
    throw new Error(`Missing: ${missing.join(', ')}`);
  }
}
```

**NOTE:** The actual template file is at `skills/authenticating-foundry-apps/templates/config/foundry.config.ts`

**.env:**

⛔ **MANDATORY - THESE VARIABLES MUST EXIST** ⛔

⛔ **GET FROM authenticating-foundry-apps SKILL TEMPLATES** ⛔

**This file is generated by the `authenticating-foundry-apps` skill.**

The `.env` file should contain:

```
VITE_FOUNDRY_APP_KEY=your_app_key
VITE_FOUNDRY_APP_SECRET=your_app_secret

# Cloud deployment (uncomment if using cloud)
# VITE_FOUNDRY_AUTH_HOST=100000012.auth.sit-hclvoltmx.net
# VITE_FOUNDRY_SERVICE_HOST=m100000012001.sit-hclvoltmx.net/services

# On-premise deployment (uncomment if using on-premise)
# VITE_FOUNDRY_AUTH_HOST=my-company-foundry.net
# VITE_FOUNDRY_SERVICE_HOST=my-company-foundry.net/services
```

**NOTE:** The `authenticating-foundry-apps` skill automatically detects whether your Swagger export is from cloud or on-premise and uncomments the appropriate section.

**Template file location:** `skills/authenticating-foundry-apps/templates/config/env.template`

**⚠️ IMPORTANT NOTES:**
- App keys and secrets can be **any length** - there is NO requirement for 32 characters or any specific length
- Do NOT validate or report character length as an error
- Copy the exact values from Foundry Console without modification
- Values may contain alphanumeric characters and may vary in length

**DO NOT skip these environment variables. The application will not work without them.**

### Phase 2: Generate Service Clients from Swagger

⛔ **MANDATORY - ALL SERVICE CLIENTS MUST INCLUDE AUTHENTICATION** ⛔

**CRITICAL:** Every service client MUST include the Foundry authentication headers in EVERY request:
- `X-Voltmx-App-Key` - REQUIRED (from foundryConfig.appKey)
- `X-Voltmx-App-Secret` - REQUIRED (from foundryConfig.appSecret)
- `X-Voltmx-Authorization` - REQUIRED for authenticated endpoints (claims token)

**DO NOT create service clients without these headers. They will fail at runtime.**

**Directory Structure:**
```
src/services/foundry/
├── identity/{IdentityName}Client.ts or FoundryAccountsClient.ts
├── integration/{ServiceName}Client.ts
├── orchestration/{ServiceName}Client.ts
└── objects/{ServiceName}/{ObjectName}Client.ts
```

**Authentication Client:**

⛔ **GET FROM authenticating-foundry-apps SKILL** ⛔

**You already invoked the `authenticating-foundry-apps` skill in Phase 0.**

Use the complete authentication implementation provided by that skill:
- Identity service client OR FoundryAccountsClient (depending on what exists in Swagger)
- Complete implementation code is in the authenticating-foundry-apps skill
- Follow ALL patterns from that skill

**DO NOT implement authentication here. Use the code from the authenticating-foundry-apps skill.**

**Integration Client (from Swagger):**
```typescript
// Parse from Integration service Swagger JSON
export class {ServiceName}Client {
  private serviceHost: string;
  private servicePath: string;
  private claimsToken?: string;

  constructor(claimsToken?: string) {
    this.serviceHost = foundryConfig.serviceHost;
    // From Swagger: basePath (e.g., "/WeatherService")
    this.servicePath = '{basePath from Swagger}';
    this.claimsToken = claimsToken;
  }

  // Generate method for each operation in Swagger paths
  async {operationName}(params: {OperationName}Request): Promise<{OperationName}Response> {
    // Parse from Swagger: paths["/operationPath"].post
    const path = '{path from Swagger}';  // e.g., "/getWeather"
    const method = '{method from Swagger}';  // Usually 'POST'

    const response = await fetch(`https://${this.serviceHost}${this.servicePath}${path}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Voltmx-App-Key': foundryConfig.appKey,
        'X-Voltmx-App-Secret': foundryConfig.appSecret,
        ...(this.claimsToken && { 'X-Voltmx-Authorization': this.claimsToken }),
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) throw new Error(`{operationName} failed: ${response.statusText}`);
    return response.json();
  }
}

// Parse request/response types from Swagger definitions
export interface {OperationName}Request {
  // Parse from Swagger: definitions.Request_{ServiceName}_{operationName}.properties
  {param}: {type};
}

export interface {OperationName}Response {
  // Parse from Swagger: definitions.Response_{ServiceName}_{operationName}.properties
  opstatus: number;
  httpStatusCode: number;
  // ... other fields from Swagger definitions
}
```

**Object Client (from Swagger):**
```typescript
// Parse from Object service Swagger JSON
export class {ObjectName}Client {
  private serviceHost: string;
  private servicePath: string;
  private claimsToken?: string;

  constructor(claimsToken?: string) {
    this.serviceHost = foundryConfig.serviceHost;
    // From Swagger: basePath + path
    // e.g., "/data/v1/EmployeeObjService" + "/objects/Employee"
    this.servicePath = '{basePath + path from Swagger}';
    this.claimsToken = claimsToken;
  }

  async get(params?: ODataQueryParams): Promise<{ObjectName}Response> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();

    const response = await fetch(`https://${this.serviceHost}${this.servicePath}?${queryString}`, {
      method: 'GET',  // From Swagger: paths["/objects/{ObjectName}"].get
      headers: {
        'X-Voltmx-App-Key': foundryConfig.appKey,
        'X-Voltmx-App-Secret': foundryConfig.appSecret,
        ...(this.claimsToken && { 'X-Voltmx-Authorization': this.claimsToken }),
      },
    });

    if (!response.ok) throw new Error(`Get failed: ${response.statusText}`);

    const data = await response.json();

    // CRITICAL: Normalize response
    const objectNameLower = '{objectName}'.toLowerCase();
    if (data.records && !data[objectNameLower]) {
      data[objectNameLower] = data.records;
    }

    return data;
  }

  async create(data: Partial<{ObjectName}>): Promise<{ObjectName}Response> {
    const response = await fetch(`https://${this.serviceHost}${this.servicePath}`, {
      method: 'POST',  // From Swagger: paths["/objects/{ObjectName}"].post
      headers: {
        'Content-Type': 'application/json',
        'X-Voltmx-App-Key': foundryConfig.appKey,
        'X-Voltmx-App-Secret': foundryConfig.appSecret,
        ...(this.claimsToken && { 'X-Voltmx-Authorization': this.claimsToken }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`Create failed: ${response.statusText}`);
    return response.json();
  }

  async update(data: Partial<{ObjectName}>): Promise<{ObjectName}Response> {
    // ⛔ CRITICAL: Filter out system-managed fields that Foundry manages automatically
    // These fields should NOT be included in update requests as they can cause failures
    const systemManagedFields = [
      'CreatedBy', 'CreatedDateTime',
      'LastUpdatedBy', 'LastUpdatedDateTime',
      'SoftDeleteFlag',
      'createdby', 'createddatetime',  // lowercase variants
      'lastupdatedby', 'lastupdateddatetime',
      'softdeleteflag'
    ];

    // Filter out system-managed fields, keep only user-editable fields + primary key
    const updatePayload: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (!systemManagedFields.includes(key)) {
        updatePayload[key] = value;
      }
    }

    const response = await fetch(`https://${this.serviceHost}${this.servicePath}`, {
      method: 'PUT',  // From Swagger: paths["/objects/{ObjectName}"].put
      headers: {
        'Content-Type': 'application/json',
        'X-Voltmx-App-Key': foundryConfig.appKey,
        'X-Voltmx-App-Secret': foundryConfig.appSecret,
        ...(this.claimsToken && { 'X-Voltmx-Authorization': this.claimsToken }),
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Update failed (${response.status}): ${errorText}`);
    }
    return response.json();
  }

  async delete(primaryKey: Partial<{ObjectName}>): Promise<void> {
    const response = await fetch(`https://${this.serviceHost}${this.servicePath}`, {
      method: 'DELETE',  // From Swagger: paths["/objects/{ObjectName}"].delete
      headers: {
        'Content-Type': 'application/json',
        'X-Voltmx-App-Key': foundryConfig.appKey,
        'X-Voltmx-App-Secret': foundryConfig.appSecret,
        ...(this.claimsToken && { 'X-Voltmx-Authorization': this.claimsToken }),
      },
      body: JSON.stringify(primaryKey),
    });

    if (!response.ok) throw new Error(`Delete failed: ${response.statusText}`);
  }
}

// Parse from Swagger: definitions.{ObjectName}.properties
export interface {ObjectName} {
  // Parse all properties from Swagger definition
  {field}: {type};
}

export interface {ObjectName}Response {
  records?: {ObjectName}[];
  {objectName}?: {ObjectName}[];  // lowercase version
  opstatus: number;
  httpStatusCode?: number;
}
```

### Phase 3: Authentication Setup

⛔ **MANDATORY - USE authenticating-foundry-apps SKILL** ⛔

**For authentication hook, login component, and protected routes:**

Use the **authenticating-foundry-apps** skill which provides complete authentication setup including:
- useFoundryAuth hook implementation
- Login component with form
- ProtectedRoute component
- Claims token management patterns

**DO NOT proceed without setting up authentication using the authenticating-foundry-apps skill.**

### Phase 3b: Service Hooks (After Authentication Setup)

**Object Service Hook:**
```typescript
// src/hooks/use{ObjectName}.ts
export function use{ObjectName}() {
  const { claimsToken } = useFoundryAuth();
  const [data, setData] = useState<{ObjectName}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const client = new {ObjectName}Client(claimsToken || undefined);

  const fetchAll = async (params?: ODataQueryParams): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.get(params);
      setData(response.{objectName} || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const create = async (item: Partial<{ObjectName}>): Promise<{ObjectName} | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await client.create(item);
      await fetchAll();
      return result;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, fetchAll, create, update, remove };
}
```

**Integration Service Hook:**
```typescript
// src/hooks/use{ServiceName}.ts
export function use{ServiceName}() {
  const { claimsToken } = useFoundryAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const client = new {ServiceName}Client(claimsToken || undefined);

  const {operationName} = async (params: {OperationName}Request) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await client.{operationName}(params);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { {operationName}, isLoading, error };
}
```

### Phase 4: UI Component Generation

⛔ **MANDATORY - ALWAYS GENERATE UI COMPONENTS FOR SERVICES** ⛔

**CRITICAL:** This skill MUST generate UI components when integrating services. Do NOT just generate service clients and hooks without UI.

**Component Location:**
```
src/components/
├── {objectName}/
│   ├── {ObjectName}List.tsx
│   ├── {ObjectName}Form.tsx
│   └── {ObjectName}Modal.tsx (if CRUD operations)
└── {serviceName}/
    ├── {ServiceName}Form.tsx
    └── {ServiceName}Result.tsx
```

**Object Service - List Component with Full CRUD:**
```typescript
// src/components/{objectName}/{ObjectName}List.tsx
import React, { useEffect, useState } from 'react';
import { use{ObjectName} } from '../../hooks/use{ObjectName}';
import type { {ObjectName} } from '../../services/foundry/objects/{ServiceName}/{ObjectName}Client';

export const {ObjectName}List: React.FC = () => {
  const { data, isLoading, error, fetchAll, create, update, remove } = use{ObjectName}();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ObjectName} | null>(null);
  const [formData, setFormData] = useState<Partial<{ObjectName}>>({});

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      // ⛔ CRITICAL: Only send user-editable fields + primary key
      // Do NOT send system-managed fields (CreatedBy, CreatedDateTime, etc.)
      // The EmployeeClient.update() already filters these, but being explicit here is cleaner
      const updateData = {
        {primaryKeyField}: editingItem.{primaryKeyField},  // Primary key (required)
        ...formData,  // User-editable fields only
      };
      await update(updateData);
    } else {
      await create(formData);
    }
    setShowModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const handleEdit = (item: {ObjectName}) => {
    setEditingItem(item);
    // ⛔ CRITICAL: Only set user-editable fields in formData
    // Parse from Swagger to identify which fields are user-editable
    // Exclude: Id (primary key), CreatedBy, CreatedDateTime, LastUpdatedBy, LastUpdatedDateTime, SoftDeleteFlag
    setFormData({
      {field1}: item.{field1},  // User-editable field
      {field2}: item.{field2},  // User-editable field
      // Add all user-editable fields from Swagger definition
    });
    setShowModal(true);
  };

  const handleDelete = async (item: {ObjectName}) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await remove({ {primaryKeyField}: item.{primaryKeyField} });
    }
  };

  if (isLoading && data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{ObjectName}s</h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({});
            setShowModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add {ObjectName}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error.message}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Generate columns from Swagger object definition properties */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {Field1Label}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {Field2Label}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.{primaryKeyField}} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.{field1}}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.{field2}}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {editingItem ? 'Edit' : 'Add'} {ObjectName}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Generate form fields from Swagger object definition properties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {Field1Label}
                </label>
                <input
                  type="text"
                  value={formData.{field1} || ''}
                  onChange={(e) => setFormData({ ...formData, {field1}: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {Field2Label}
                </label>
                <input
                  type="text"
                  value={formData.{field2} || ''}
                  onChange={(e) => setFormData({ ...formData, {field2}: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({});
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
```

**Integration Service - Operation Form Component:**
```typescript
// src/components/{serviceName}/{ServiceName}Form.tsx
import React, { useState } from 'react';
import { use{ServiceName} } from '../../hooks/use{ServiceName}';
import type { {OperationName}Request, {OperationName}Response } from '../../services/foundry/integration/{ServiceName}Client';

export const {ServiceName}{OperationName}Form: React.FC = () => {
  const { {operationName}, isLoading, error } = use{ServiceName}();
  const [formData, setFormData] = useState<{OperationName}Request>({
    // Initialize with default values from Swagger request definition
  });
  const [result, setResult] = useState<{OperationName}Response | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await {operationName}(formData);
      setResult(response);
    } catch (err) {
      console.error('Operation failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{ServiceName} - {OperationName}</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error.message}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Generate form fields from Swagger request definition properties */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {ParamLabel}
            </label>
            <input
              type="text"
              value={formData.{paramName} || ''}
              onChange={(e) => setFormData({ ...formData, {paramName}: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Submit'}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Result</h2>
          <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
```

**CRITICAL UI Generation Rules:**
1. **Parse field types from Swagger** to generate appropriate input types (text, number, date, select, etc.)
2. **Use Tailwind CSS** for styling (already available in generated apps)
3. **Include loading states** with spinners and disabled buttons
4. **Include error handling** with error message displays
5. **For Object Services**: Generate full CRUD UI (list, add, edit, delete with modals)
6. **For Integration Services**: Generate operation-specific forms with result displays
7. **Responsive design**: Use responsive Tailwind classes for mobile/desktop

### Phase 5: Route Integration (if app has routing)

**If the app already has React Router setup**, add routes for new components:

```typescript
// Add to existing App.tsx or routes file
import { {ObjectName}List } from './components/{objectName}/{ObjectName}List';
import { {ServiceName}{OperationName}Form } from './components/{serviceName}/{ServiceName}Form';

// Add routes
<Route path="/{objectName-plural}" element={<ProtectedRoute><{ObjectName}List /></ProtectedRoute>} />
<Route path="/{serviceName}/{operationName}" element={<ProtectedRoute><{ServiceName}{OperationName}Form /></ProtectedRoute>} />
```

**If app doesn't have routing**, suggest adding navigation links to main page or creating a simple navigation component.

## Parsing Swagger for Service Generation

### Extract Service Metadata

```bash
# Get service name and paths
SERVICE_NAME=$(jq -r '.info.title' service.json)
BASE_PATH=$(jq -r '.basePath' service.json)
HOST=$(jq -r '.host' service.json)

# List all operations
jq -r '.paths | keys[]' service.json

# For each operation, get HTTP method
jq '.paths["/operationPath"] | keys[]' service.json

# Get request parameters
jq '.paths["/operationPath"].post.parameters' service.json

# Get request body schema reference
jq '.paths["/operationPath"].post.parameters[] | select(.in == "body") | .schema["$ref"]' service.json

# Get response schema reference
jq '.paths["/operationPath"].post.responses["200"].schema["$ref"]' service.json

# Extract definition
jq '.definitions.Request_{ServiceName}_{operationName}' service.json
jq '.definitions.Response_{ServiceName}_{operationName}' service.json
```

### Map Swagger Types to TypeScript

```typescript
// Type mapping from Swagger to TypeScript:
// "string" → string
// "integer" / "number" → number
// "boolean" → boolean
// "array" → Array<T> (parse items.type or items.$ref)
// "object" → interface (parse properties)
// "$ref": "#/definitions/TypeName" → TypeName (reference to other interface)
// "string" with format "date-time" → string (or Date)
```

## Troubleshooting

### CORS Errors
Configure Vite proxy:
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/services': {
        target: 'https://your-foundry-instance.com',
        changeOrigin: true,
        secure: false,
      },
      '/authService': {
        target: 'https://your-foundry-instance.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

### 401 Unauthorized
- Verify claims token is passed to client constructor
- Check token expiration
- Ensure login completed successfully
- Verify X-Voltmx-App-Key and X-Voltmx-App-Secret are correct (copy exact values from Foundry Console)

**⚠️ IMPORTANT:** App keys and secrets can be ANY length - there is NO requirement for them to be 32 characters or any specific length. Do NOT report character length as an error.

### 404 Not Found
- Verify service path construction from Swagger (host + basePath + path)
- Check that `/services` prefix is added for Integration/Object services
- Ensure basePath matches Swagger exactly

## Verification Checklist

- [ ] Config file created with environment variables
- [ ] **Used authenticating-foundry-apps skill for authentication setup**
- [ ] Authentication client generated (custom Identity or FoundryAccountsClient) from Swagger
- [ ] Login component and route created
- [ ] ProtectedRoute component created
- [ ] useFoundryAuth hook created
- [ ] Service clients accept claimsToken parameter
- [ ] All headers use correct names (X-Voltmx-*)
- [ ] Service paths constructed from Swagger host + basePath + path
- [ ] Object Service GET methods normalize `records` → `{objectName}`
- [ ] **Object Service UPDATE methods filter out system-managed fields (CreatedBy, CreatedDateTime, LastUpdatedBy, LastUpdatedDateTime, SoftDeleteFlag)**
- [ ] TypeScript types generated from Swagger definitions
- [ ] Request/response interfaces match Swagger definitions exactly
- [ ] All operations from Swagger paths implemented as client methods
- [ ] React hooks created for services
- [ ] **UI components generated for all services (forms, tables, modals)**
- [ ] **Object services have full CRUD UI (list, add, edit, delete)**
- [ ] **Integration services have operation forms with result displays**
- [ ] **Components use Tailwind CSS styling**
- [ ] **Loading states and error handling included in UI**
- [ ] **Routes added to existing routing (if applicable)**

## Common Mistakes

❌ Not parsing Swagger structure correctly - Must identify services by basePath pattern
❌ Wrong header names - Must be X-Voltmx-Authorization, not Authorization
❌ Not normalizing Object Service responses - Must convert records to objectName
❌ Missing authentication headers - All requests need appKey, appSecret, and claimsToken
❌ Incorrect path construction - Must use host + basePath + path from Swagger
❌ **⚠️ NEVER validate app key/secret length** - App keys and secrets can be ANY length (NOT required to be 32 characters). Do NOT report character length as an error when authentication fails.
❌ Not handling optional vs required parameters from Swagger
❌ Type mapping errors - Must map Swagger types to TypeScript correctly
❌ Forgetting $ref references - Must resolve $ref to actual type definitions
❌ **Generating only service clients without UI components** - Must generate UI for service integration
❌ **Not generating CRUD modals for Object services** - Must provide add/edit/delete functionality
❌ **Missing loading states or error handling in UI** - All components must handle loading and errors
❌ **⚠️ CRITICAL: Including system-managed fields in Object Service updates** - Causes 400 errors or update failures
  - Sending `CreatedBy`, `CreatedDateTime`, `LastUpdatedBy`, `LastUpdatedDateTime`, or `SoftDeleteFlag` in PUT requests
  - These fields are managed by Foundry and should be filtered out before sending updates
  - **FIX:** Always filter system-managed fields in the `update()` method (see Object Service Update Field Filtering section)
