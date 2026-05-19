---
name: configuring-vite-environments
description: Configure Vite projects with required settings for deployment, manage environment variables, and implement service-specific API configuration patterns
---

# Configuring Vite Environments

Essential Vite configuration and environment variable management for deployment-ready applications.

## ⚠️ When To Use This Skill

**ALWAYS invoke this skill for ALL Vite projects.**

This skill defines the **deployment fundamentals** that every Vite application needs, regardless of complexity.

**For frontend-only projects (no backend services):**
- Invoke this skill
- Use the basic vite.config.ts template from this skill

**For projects with backend services:**
- Invoke this skill FIRST (to understand deployment requirements)
- Then invoke **`managing-services`** skill
- The `managing-services` template implements everything from this skill PLUS dynamic proxy

## How This Skill Relates to managing-services

This skill is the **single source of truth** for deployment fundamentals:
- Base path configuration: `base: process.env.VITE_BASE_PATH || '/'`
- Server settings: `host: '0.0.0.0'`, `cors: true`
- Allowed hosts: `process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS || '.qs.hcllabs.net'`
- Build configuration: `outDir: 'dist'`, `sourcemap: true`

The `managing-services` skill **implements and extends** these fundamentals:
- Includes ALL settings from this skill
- PLUS dynamic proxy configuration for backend services
- Reads service definitions from `services-config.json`

**Key principle:** Both skills work together. This skill defines the contract, `managing-services` implements it with extensions.

## ⚠️ Required Vite Configuration

**EVERY vite.config.ts MUST include:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    host: '0.0.0.0',
    cors: true,
    allowedHosts: [
      process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS || '.qs.hcllabs.net'
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

**These settings are NON-NEGOTIABLE** for deployment compatibility.

## Environment Variables

### Naming Conventions
- **Client-side:** `VITE_` prefix (accessible in React)
- **Format:** SCREAMING_SNAKE_CASE (e.g., `VITE_API_BASE_URL`)
- **Examples:** Placeholder values showing expected format

### Variable Types
```bash
# API Configuration
VITE_API_BASE_URL=https://api.example.com
VITE_API_KEY=your_api_key_here

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG_MODE=false

# Services
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

### Security
- Never include real API keys in .env
- Use placeholder values
- Add comments explaining each variable

### Usage in Components
```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const apiKey = import.meta.env.VITE_API_KEY;

const response = await fetch(`${apiBaseUrl}/users`, {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

## Service-Specific Configuration

If your project includes backend services:
- Use the **`managing-services`** skill
- Its vite.config.ts template includes ALL the settings above PLUS dynamic proxy
- You do NOT need to separately apply this skill - `managing-services` includes it

## Vite Config Requirements

### Base Path
```typescript
base: process.env.VITE_BASE_PATH || '/'
```
Enables deployment flexibility.

### Server Configuration
```typescript
server: {
  host: '0.0.0.0',           // Allow external connections
  cors: true,                // Enable CORS for API calls
  allowedHosts: [
    process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS || '.qs.hcllabs.net'
  ],
}
```

### Build Configuration
```typescript
build: {
  outDir: 'dist',
  sourcemap: true,
}
```

### Error Handling
Always include fallback values for environment variables:
```typescript
process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS || '.qs.hcllabs.net'
```

## Router Base Path

If using React Router, apply base path:
```typescript
import { BrowserRouter } from 'react-router-dom';

const basePath = import.meta.env.VITE_BASE_PATH || '/';

<BrowserRouter basename={basePath}>
  <Routes>
    <Route path="/" element={<Home />} />
  </Routes>
</BrowserRouter>
```

## When to Create .env

1. **API integrations** - External APIs, auth keys, service endpoints
2. **Service creation** - MCP service-router services needing proxy config
3. **Feature flags** - User-configurable behavior
4. **Build-time config** - Different settings for dev/staging/prod
5. **External integrations** - Maps, payments, analytics

## Important Rules

### DO NOT Override Runtime Variables
If `process.env.API_BASE_PATH` is configured in runtime:
- DO NOT modify or override its value
- Use it as-is in your configuration

### Proxy Configuration
- For service-specific proxy configuration, see **`managing-services`** skill

## Complete Example

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    host: '0.0.0.0',
    cors: true,
    allowedHosts: [
      process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS || '.qs.hcllabs.net'
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

**.env:**
```bash
# Required for deployment
VITE_BASE_PATH=/

# API Configuration
VITE_API_BASE_URL=https://api.example.com
VITE_API_KEY=your_api_key_here

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG_MODE=false

# For service-specific variables, see managing-services skill
```

**Router with base path:**
```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const basePath = import.meta.env.VITE_BASE_PATH || '/';

function App() {
  return (
    <BrowserRouter basename={basePath}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Starting the Frontend

**To start the Vite dev server, always use this command:**

```bash
mkdir -p /home/node/txai-projects/project/.logs && npm run dev -- --host 0.0.0.0 > /home/node/txai-projects/project/.logs/server.log 2>&1
```

**What this does:**
- Creates the `.logs` directory if it doesn't exist (`mkdir -p`)
- Starts the Vite dev server (`npm run dev`)
- Redirects all output (stdout + stderr) to `/home/node/txai-projects/project/.logs/server.log`

**⚠️ This is the required command for starting the frontend.** Do not use bare `npm run dev` without log redirection.

## Checklist

- [ ] vite.config.ts includes all required settings
- [ ] base path configured: `process.env.VITE_BASE_PATH || '/'`
- [ ] server.host set to '0.0.0.0'
- [ ] CORS enabled
- [ ] allowedHosts with fallback
- [ ] .env created with all needed variables
- [ ] VITE_ prefix for client-side variables
- [ ] Router uses base path if applicable
- [ ] No real secrets in .env file
- [ ] For service-specific setup, see **managing-services** skill

## Related Skills

- **`managing-services`** - For projects with backend services (includes all settings from this skill + proxy configuration)
