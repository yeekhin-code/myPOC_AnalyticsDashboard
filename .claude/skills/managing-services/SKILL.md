---
name: managing-services
description: Generate Express backend services (API layer) for Vite applications running in Kubernetes with proper proxy configuration, port management, and base path handling. Use when user requests backend services, APIs, authentication services, file storage, or any server-side Express functionality. ⚠️ IMPORTANT - This skill creates Express API services with in-memory storage. If the user explicitly requests DATABASE PERSISTENCE (PostgreSQL, MySQL, MongoDB, CouchDB), you MUST ALSO invoke the 'database-integration' skill to add real database support.
---

# Vibe Service Generator

## ⚠️ CRITICAL: Database Integration Required?

**If the user explicitly mentions:**
- Specific databases: "PostgreSQL", "MySQL", "MongoDB", "CouchDB"
- Database persistence: "persist to database", "store in database", "save to database", "database backend", "db backend"

**Then AFTER generating the service with this skill, you MUST:**
1. Invoke the **`database-integration`** skill
2. Replace the in-memory storage with real database operations

**This skill only provides the API layer (Express routes, in-memory storage).**
**Database persistence requires the `database-integration` skill.**

## When to Use This Skill

Activate this skill when the user:
- Creates, modifies, or removes non-UI services (API endpoints, background services, microservices)
- Requests backend functionality (API endpoints, authentication, file storage, etc.)
- Mentions Express servers or Node.js APIs
- Wants to add server-side capabilities to their Vite application
- Asks about service routing or API endpoints

**Note:** If database persistence is needed, this skill creates the API structure, then `database-integration` adds the database layer.

### Early Detection - Use During Project Planning

**Analyze the user's request BEFORE creating vite.config.ts.**

**Invoke this skill ONLY when the user EXPLICITLY requests persistence or server-side functionality:**

**Explicit indicators:**
- **Database storage:** "store in database", "save to database", "persist to database", "database backend"
- **Database technology:** "PostgreSQL", "MongoDB", "MySQL", "SQLite", "CouchDB"
- **Backend APIs:** "backend API", "REST API", "API endpoint", "server-side"
- **Service creation:** "create a service", "add a service", "microservice"
- **Authentication:** "user login", "authentication", "user accounts", "sign up/sign in"
- **Cross-session persistence:** "save between sessions", "persist across page reloads"

**Do NOT invoke for vague CRUD words alone:**
- "create", "manage", "edit", "update", "delete" without storage context
- "employee records", "todo list", "contacts" without persistence specification

**Examples:**
- ✅ "create app that stores msgs in database" → Backend needed
- ✅ "todo app with PostgreSQL backend" → Backend needed
- ❌ "create app that manages employee records" → No backend (use React state/localStorage)
- ❌ "todo app" → No backend (use in-memory state)

**Rule:** If user doesn't explicitly say WHERE to store data, don't create backend services.

### When Invoked By Other Skills

This skill is invoked by:
- **database-integration** - When database services are created
- **authenticating-foundry-apps** - When Foundry services are added
- **integrating-foundry-services** - When external services are integrated

**When invoked:**
1. Read services from services-config.json
2. Generate vite.config.ts using templates/vite.config.ts
   - This includes ALL deployment settings from `configuring-vite-environments`
   - PLUS dynamic proxy configuration for all services
3. If vite.config.ts already exists, OVERWRITE it with the service-aware version

## Architecture Overview

The application runs in a Kubernetes pod with these components:
- **CC Service** (port 3008) - Code generation service
- **Vite Dev Server** (port 5173) - Frontend application
- **Backend Services** (dynamic ports starting from 4001) - Express.js APIs

### Critical Path Handling

**Important**: Kubernetes Ingress maps `http://<host>/<appID>` to port 5173. The `VITE_BASE_PATH` environment variable contains the `/<appID>` path prefix (e.g., `/app123` or `/app-1234567890`).

**All API requests and proxy configurations MUST include this base path.**

All services run in the same pod and communicate via localhost.

## Service Generation Workflow

When the user requests backend services (database, authentication, file storage, etc.), follow these steps:

### 1. Generate Express Backend Services

**Directory Structure:**
- Place each service in: `/home/node/txai-projects/project/services/{service-name}/`
- Each service must be completely isolated with its own dependencies

**Required Files Per Service:**

Use the templates in the `templates/` directory as starting points:
- `templates/service-package.json` - Base package.json for services
- `templates/service-server.ts` - Express server template
- `templates/service-routes.ts` - Basic CRUD routes template

**When generating a service:**
1. Copy template files to `services/{service-name}/`
2. Replace placeholders:
   - `{service-name}` - lowercase service name (e.g., "todo", "auth")
   - `{SERVICE_NAME_UPPER}` - uppercase for env var (e.g., "TODO", "AUTH")
   - `{default-port}` - assigned port number (e.g., 4001, 4002)
   - `{Service name}` - human-readable name (e.g., "Todo", "Auth")
3. Customize routes based on user requirements
4. Install dependencies: `cd services/{service-name} && npm install`

**Environment Variable Pattern:**
- Each service uses a unique environment variable for its port
- Format: `{SERVICE_NAME_UPPER}_PORT` (e.g., `TODO_PORT=4001`, `DATABASE_PORT=4002`)
- This prevents conflicts and enables independent configuration

**Port Assignment:**
- Start from port 4001
- Increment for each new service (4002, 4003, etc.)
- Track assignments in services-config.json

### 2. Track Port Assignments

Create or update `services-config.json` in the project root:

```json
{
  "services": [
    {
      "name": "database",
      "port": 4001,
      "path": "/api/database",
      "description": "Database CRUD operations"
    },
    {
      "name": "auth",
      "port": 4002,
      "path": "/api/auth",
      "description": "Authentication and authorization"
    },
    {
      "name": "files",
      "port": 4003,
      "path": "/api/files",
      "description": "File upload and storage"
    }
  ]
}
```

### 3. Generate vite.config.ts with Dynamic Proxy

**CRITICAL**: The proxy configuration must include `VITE_BASE_PATH` in all proxy paths.

Use the template at `templates/vite.config.ts` which:
- **Includes ALL deployment settings from the `configuring-vite-environments` skill**
  - Base path configuration: `base: process.env.VITE_BASE_PATH || '/'`
  - Server settings: `host: '0.0.0.0'`, `cors: true`
  - Allowed hosts: `process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS || '.qs.hcllabs.net'`
  - Build configuration: `outDir: 'dist'`, `sourcemap: true`
- **PLUS dynamic proxy configuration for services:**
  - Reads services from `services-config.json`
  - Gets base URL from `VITE_BASE_PATH` environment variable
  - Dynamically builds proxy configuration with base path prefix
  - Sets up proper path rewriting

**Key features of the template:**
- Single source of truth: Combines deployment fundamentals + service proxying
- Proxy paths include the base path: `${baseUrl}${service.path}`
- Rewrites strip the full prefix before forwarding to backend
- All services are automatically proxied based on configuration

**Example Generated Proxy Config:**

With `VITE_BASE_PATH=/app-1234567890/`:
```typescript
const proxyConfig = {
  '/app-1234567890/api/database': {
    target: 'http://localhost:4001',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/app-1234567890\/api\/database/, '')
  },
  '/app-1234567890/api/auth': {
    target: 'http://localhost:4002',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/app-1234567890\/api\/auth/, '')
  }
}
```

### 4. Generate Frontend API Client

**🚨 CRITICAL PROCESS - FOLLOW EXACTLY 🚨**

**YOU MUST USE THE TEMPLATE - DO NOT GENERATE FROM SCRATCH**

1. **READ** the template file: `templates/api-client.ts`
2. **COPY** its contents as the starting point
3. **CUSTOMIZE** based on services in `services-config.json`
4. **WRITE** to `src/lib/api.ts`

**The template includes CRITICAL implementations:**
- ✅ `normalizePath()` function with correct regex: `/\/{2,}/g`
  - This removes ALL double slashes, including leading `//`
  - DO NOT rewrite this function - use it as-is
- ✅ `BASE_URL` from `import.meta.env.VITE_BASE_PATH`
- ✅ `API_PATHS` object structure
- ✅ Proper error handling patterns

**What to customize:**
- Update `API_PATHS` keys to match your services from `services-config.json`
- Add/remove service sections (database, auth, files, etc.)
- Generate methods specific to each service type
- Add TypeScript types for request/response data

**What NOT to customize:**
- ❌ Do NOT change the `normalizePath()` function
- ❌ Do NOT change the `BASE_URL` pattern
- ❌ Do NOT remove the `normalizePath()` calls before fetch

**Verification checklist:**
- [ ] Started from `templates/api-client.ts` (not generated from scratch)
- [ ] `normalizePath()` function exists with `/\/{2,}/g` regex
- [ ] All fetch calls use `normalizePath()` wrapper
- [ ] `BASE_URL` uses `import.meta.env.VITE_BASE_PATH`

See `templates/api-client.ts` for the complete implementation pattern.

### 5. Create .env File for Local Development

**BEFORE creating start-services.sh, create a `.env` file for local development.**

Create `.env` in the project root:

```bash
# Base path for local development
# In production, this is set by Kubernetes to /app-{hash}/
VITE_BASE_PATH=/

# Service ports (add one for each service in services-config.json)
# Example: If you have a database service on port 4001:
# DATABASE_PORT=4001
```

**IMPORTANT - Do NOT copy the template literally:**
- ❌ **WRONG**: `VITE_BASE_PATH=/app-$APP_HASH/` (from template)
- ✅ **CORRECT**: `VITE_BASE_PATH=/` (for local development)

**Why this matters:**
- **Local development**: Use `VITE_BASE_PATH=/` (root path)
- **Kubernetes production**: Runtime sets `APP_HASH` environment variable, which `start-services.sh` uses
- The `start-services.sh` template exports `VITE_BASE_PATH=/app-$APP_HASH/` for production
- For local dev, `.env` overrides this with `/`

**Add service port variables for each service:**
```bash
# Example for multiple services:
DATABASE_PORT=4001
AUTH_PORT=4002
FILES_PORT=4003
```

### 6. Generate Service Startup Script

Create `start-services.sh` in the project root using `templates/start-services.sh`.

**CRITICAL**: All services MUST be started with `nohup` to ensure they persist after the script exits.

The template provides:
- Sets `VITE_BASE_PATH` environment variable (uses `APP_HASH` if available, otherwise uses value from `.env`)
- Creates logs directory
- Reads services from `services-config.json`
- Stops each service if it is already running
- Starts each service with unique environment variable (e.g., `TODO_PORT`)
- Uses `nohup` to ensure persistence
- Redirects logs to `logs/{service-name}.log`
- Starts Vite dev server with nohup

**Why nohup is required:**
- Ensures services continue running after the startup script completes
- Services persist even if shell or SSH session closes
- Critical for Kubernetes pod lifecycle management
- Without nohup, services terminate when parent process exits

See `templates/start-services.sh` for the complete implementation.

**Critical** Use the start-services.sh script that is generated to start or restart backend services when requested by the user and when you make changes to services that require a restart.

### 7. Update package.json Scripts

Ensure the project's `package.json` includes:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "start-services": "bash start-services.sh",
    "preview": "vite preview"
  }
}
```

## Complete Example: Todo Service

For a detailed walkthrough of generating a complete todo service with database persistence, see `examples/todo-service-example.md`.

The example demonstrates:
- Creating the service directory structure
- Using templates to generate service files
- Installing dependencies
- Updating configuration files
- Generating the API client
- Creating frontend components that use the service

**Quick Overview:**

When user says: "I need a database backend to store and retrieve todo items"

1. Create `services/todo/` directory
2. Use `templates/service-package.json` → `services/todo/package.json`
3. Use `templates/service-server.ts` → `services/todo/server.ts` (replace `TODO_PORT`, `4001`)
4. Create `services/todo/routes.ts` with todo-specific CRUD operations
5. Run `cd services/todo && npm install`
6. Update `services-config.json` with todo service entry
7. Regenerate `vite.config.ts` using `templates/vite.config.ts`
8. **Create `.env` file with `VITE_BASE_PATH=/` and service port variables**
9. **Generate `src/lib/api.ts` using `templates/api-client.ts` as base** (customize for todo service)
10. Update `start-services.sh` using `templates/start-services.sh`
11. Create frontend components using `api.database` or `api.todos` methods

See the full example with complete code in `examples/todo-service-example.md`.

## Request Flow Example

With `VITE_BASE_PATH=/app-1234567890/`:

1. **Frontend code:**
```typescript
fetch(`${BASE_URL}/api/todos`)
// Becomes: /app-1234567890/api/todos
```

2. **Browser sends:**
```
GET http://localhost/app-1234567890/api/todos
```

3. **Traefik Ingress:**
- Matches route `/app-1234567890/`
- Forwards to port 5173

4. **Vite receives:**
```
GET /app-1234567890/api/todos
```

5. **Vite proxy matches:**
- Pattern: `/app-1234567890/api/todos`
- Target: `http://localhost:4001`

6. **Vite rewrites path:**
- Removes `/app-1234567890/api/todos`
- Result: `/`

7. **Todo service receives:**
```
GET /
```

8. **Express router handles:**
```typescript
router.get('/', async (req, res) => {
  // Return todos
})
```

## Critical Requirements Checklist

Before completing any service generation task, verify:

- [ ] Each service has its own `package.json` with isolated dependencies
- [ ] Ran `npm install` in each service directory
- [ ] All services use `nohup` in startup script
- [ ] Service logs redirect to `logs/{service-name}.log`
- [ ] Each service uses unique environment variable: `{SERVICE_NAME}_PORT`
- [ ] **Created `.env` file with `VITE_BASE_PATH=/` (NOT `/app-$APP_HASH/`)**
- [ ] **Added service port variables to `.env` (e.g., `DATABASE_PORT=4001`)**
- [ ] All API paths include `${BASE_URL}` from `import.meta.env.VITE_BASE_PATH`
- [ ] `vite.config.ts` proxy paths include `${baseUrl}${service.path}`
- [ ] Set `base: baseUrl` in vite.config.ts
- [ ] Updated `services-config.json` with new service
- [ ] **Generated `src/lib/api.ts` FROM `templates/api-client.ts` template (not from scratch)**
- [ ] **`src/lib/api.ts` contains `normalizePath()` function with `/\/{2,}/g` regex**
- [ ] Updated `start-services.sh` to start new service
- [ ] Frontend components use the api client, not raw fetch
- [ ] All services communicate via localhost (same pod)

## Common Mistakes to Avoid

❌ **Don't:** Set `.env` to `VITE_BASE_PATH=/app-$APP_HASH/` (copying from template)
✅ **Do:** Set `.env` to `VITE_BASE_PATH=/` for local development

❌ **Don't:** Generate `src/lib/api.ts` from scratch
✅ **Do:** Start from `templates/api-client.ts` template and customize it

❌ **Don't:** Write your own `normalizeUrl()` function with buggy regex
✅ **Do:** Use the template's `normalizePath()` function with `/\/{2,}/g` regex

❌ **Don't:** Use generic `PORT` environment variable
✅ **Do:** Use service-specific variables like `TODO_PORT`, `AUTH_PORT`

❌ **Don't:** Forget base path in proxy configuration
✅ **Do:** Always include `${baseUrl}${service.path}` in proxy paths

❌ **Don't:** Hardcode API URLs in frontend
✅ **Do:** Use `import.meta.env.VITE_BASE_PATH` and the generated api client

❌ **Don't:** Start services without `nohup`
✅ **Do:** Always use `nohup ... &` to ensure persistence

❌ **Don't:** Share package.json between services
✅ **Do:** Give each service its own package.json and node_modules

❌ **Don't:** Skip installing dependencies
✅ **Do:** Run `npm install` in each service directory after generation

## Debugging Tips

**Double slash (`//`) in API URLs:**
- Check if `src/lib/api.ts` was generated from template
- Verify `normalizePath()` function exists with regex: `/\/{2,}/g`
- Ensure all fetch calls wrap URLs with `normalizePath()`
- If function is missing or wrong, regenerate from `templates/api-client.ts`

**Service not starting:**
- Check logs: `tail -f logs/{service-name}.log`
- Verify port not in use: `lsof -i :{port}`
- Confirm environment variable is set correctly

**API calls returning 404:**
- Verify proxy path includes base path
- Check service is running: `ps aux | grep tsx`
- Confirm `services-config.json` is correct
- Check browser console for actual URL being called
- Verify no double slashes in URL (see above)

**Proxy not working:**
- Restart Vite dev server after config changes
- Check vite.config.ts syntax
- Verify baseUrl is set from VITE_BASE_PATH

**CORS errors:**
- Ensure service includes `cors()` middleware
- Verify `changeOrigin: true` in proxy config

## Summary

This skill enables automatic generation of Express backend services that:
- Run in the same Kubernetes pod as the Vite frontend
- Use unique ports and environment variables
- Route API calls through Vite's proxy with proper base path handling
- Persist using nohup for reliable operation
- Maintain isolated dependencies per service
- Provide type-safe API clients for frontend consumption