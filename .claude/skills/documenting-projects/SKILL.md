---
name: documenting-projects
description: Create and manage project documentation with proper file placement rules. Use when creating documentation, writing guides, or generating README files. Ensures docs go in correct locations (README.md in root, service docs in service directories, all other docs in /docs directory).
---

# Documenting Projects

Expert guidance for creating and managing project documentation with proper file placement and structure.

## ⚠️ CRITICAL FILE PLACEMENT RULES

**VERIFY BEFORE EVERY DOCUMENTATION FILE WRITE**

### Rule 1: Main Project README
```
Location: /home/node/txai-projects/project/README.md
Purpose: Main project overview, setup, and getting started guide
```

### Rule 2: Service-Specific READMEs
```
Location: /home/node/txai-projects/project/services/{service-name}/README.md
Purpose: Document specific service APIs, endpoints, and usage
```

### Rule 3: All Other Documentation
```
Location: /home/node/txai-projects/project/docs/
Purpose: Additional guides, architecture docs, integration docs, etc.
```

### Rule 4: NEVER Place Non-README Docs in Root
```
❌ WRONG: /home/node/txai-projects/project/ARCHITECTURE.md
✅ RIGHT: /home/node/txai-projects/project/docs/ARCHITECTURE.md

❌ WRONG: /home/node/txai-projects/project/API_GUIDE.md
✅ RIGHT: /home/node/txai-projects/project/docs/API_GUIDE.md

❌ WRONG: /home/node/txai-projects/project/DEPLOYMENT.md
✅ RIGHT: /home/node/txai-projects/project/docs/DEPLOYMENT.md
```

## 📋 Pre-Write Checklist

Before using the Write tool for ANY .md file:

```
[ ] Identified document type:
    [ ] Main README.md → /home/node/txai-projects/project/README.md
    [ ] Service README → /home/node/txai-projects/project/services/{name}/README.md
    [ ] Other documentation → /home/node/txai-projects/project/docs/{name}.md

[ ] If using /docs directory:
    [ ] Check if /docs exists: ls /home/node/txai-projects/project/docs/
    [ ] Create if needed: mkdir -p /home/node/txai-projects/project/docs

[ ] After creating docs in /docs:
    [ ] Update main README.md with link to new documentation
    [ ] Update project structure diagram if present
```

## 🎯 Documentation Decision Tree

```
START: Need to create documentation
  │
  ├─► Is it THE main project README?
  │   ├─► YES → /home/node/txai-projects/project/README.md
  │   └─► NO → Continue
  │
  ├─► Is it documenting a specific service/microservice?
  │   ├─► YES → /home/node/txai-projects/project/services/{service}/README.md
  │   └─► NO → Continue
  │
  └─► All other cases → /home/node/txai-projects/project/docs/{filename}.md
      └─► Create /docs if it doesn't exist
```

## 📁 Common Documentation Types and Placement

### Main Project Documentation
**Location:** `/home/node/txai-projects/project/README.md`
- Project overview
- Features list
- Getting started guide
- Installation instructions
- Basic usage
- Technology stack
- Links to detailed docs in /docs

### Service Documentation
**Location:** `/home/node/txai-projects/project/services/{service-name}/README.md`
- Service purpose and overview
- API endpoints
- Request/response examples
- Environment variables specific to service
- How to run the service
- Service-specific troubleshooting

### Additional Documentation (in /docs)
**Location:** `/home/node/txai-projects/project/docs/`

Common files:
- `ARCHITECTURE.md` - System architecture and design decisions
- `API.md` - Complete API reference
- `DEPLOYMENT.md` - Deployment instructions
- `CONTRIBUTING.md` - Contribution guidelines
- `BACKEND_INTEGRATION.md` - Backend integration guide
- `FRONTEND_GUIDE.md` - Frontend development guide
- `DATABASE_SCHEMA.md` - Database schema documentation
- `TESTING.md` - Testing strategy and guidelines
- `CHANGELOG.md` - Version history (though some prefer root for this)
- `TROUBLESHOOTING.md` - Common issues and solutions

## 📝 Main README.md Structure

The main README should include:

```markdown
# Project Name

Brief description

## Features
- Feature list

## Project Structure
- Directory tree

## Installation
- Setup steps

## Running the Application
- Development mode
- Production build

## Technology Stack
- List of technologies

## Environment Variables
- Required variables

## Additional Documentation
**This section should link to /docs directory:**
- [Architecture Guide](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Service Name API](services/service-name/README.md)

## Troubleshooting
- Common issues

## License
- License info
```

## 🔄 Workflow for Creating Documentation

### Step 1: Identify Documentation Type
Determine which type of documentation you're creating based on the decision tree above.

### Step 2: Verify Directory Structure
```bash
# Check if /docs exists (if needed)
ls -la /home/node/txai-projects/project/docs/

# Create if needed
mkdir -p /home/node/txai-projects/project/docs
```

### Step 3: Create Documentation File
Use the correct path based on documentation type:
- Main README: Root directory
- Service README: Service directory
- Other docs: /docs directory

### Step 4: Update Main README
If you created documentation in /docs, update the main README.md:
```markdown
## Additional Documentation

For detailed information, see:
- [Your New Doc](docs/YOUR_NEW_DOC.md) - Description
```

### Step 5: Update Project Structure (if present)
If the main README has a project structure diagram, update it:
```
├── docs/
│   ├── EXISTING_DOC.md
│   └── YOUR_NEW_DOC.md        # Add this line
```

## ✅ Verification

After creating documentation, verify:

```bash
# Check file was created in correct location
ls -la /home/node/txai-projects/project/docs/YOUR_DOC.md

# OR for service README
ls -la /home/node/txai-projects/project/services/service-name/README.md

# Verify main README references it
grep -r "YOUR_DOC.md" /home/node/txai-projects/project/README.md
```

## 🚫 Common Mistakes to Avoid

### ❌ Mistake 1: Placing Docs in Root
```bash
# WRONG
/home/node/txai-projects/project/INTEGRATION_GUIDE.md

# RIGHT
/home/node/txai-projects/project/docs/INTEGRATION_GUIDE.md
```

### ❌ Mistake 2: Forgetting to Create /docs
```bash
# Will fail if /docs doesn't exist
Write to /home/node/txai-projects/project/docs/API.md

# MUST do this first
mkdir -p /home/node/txai-projects/project/docs
```

### ❌ Mistake 3: Not Linking from Main README
Creating documentation in /docs but not linking to it from the main README makes it hard to discover.

### ❌ Mistake 4: Overwriting Service README with Main README
```bash
# WRONG - This overwrites the service's README
/home/node/txai-projects/project/services/my-service/README.md
(with main project content)

# Each service README should document THAT SERVICE specifically
```

## 📊 Documentation Templates

### Service README Template
```markdown
# {Service Name}

Brief description of what this service does.

## Features
- List key features

## API Endpoints

### Endpoint Name
\```
METHOD /path
\```

**Request:**
\```json
{...}
\```

**Response:**
\```json
{...}
\```

## Environment Variables
- `VAR_NAME` - Description

## Running the Service
\```bash
npm start
\```

## Troubleshooting
Common issues specific to this service
```

### Additional Documentation Template (for /docs)
```markdown
# {Document Title}

Brief overview of what this document covers.

## Table of Contents
- [Section 1](#section-1)
- [Section 2](#section-2)

## Section 1
Content...

## Section 2
Content...

## Related Documentation
- [Other Doc](OTHER_DOC.md)
- [Main README](../README.md)
```

## 🎯 Only Generate Documentation When Needed

**Important:** Only create documentation if:
1. User explicitly requests it ("create documentation", "write a guide")
2. Application has complex setup requirements that warrant additional docs
3. User asks for it indirectly ("how do I document this?")

**Don't** proactively create extensive documentation for simple applications.

## 📝 Examples

### Example 1: User asks "Create documentation for the backend API"
```
Decision: This is additional documentation, not main README
Action: Create /home/node/txai-projects/project/docs/BACKEND_API.md
Follow-up: Update main README to link to it
```

### Example 2: User asks "Document the auth service"
```
Decision: This is service-specific documentation
Action: Create /home/node/txai-projects/project/services/auth-service/README.md
Follow-up: Update main README to link to it (optional)
```

### Example 3: User asks "Update the README"
```
Decision: This is the main README
Action: Edit /home/node/txai-projects/project/README.md
Follow-up: None (it's the main entry point)
```

### Example 4: User asks "Create an architecture guide"
```
Decision: This is additional documentation
Action:
  1. mkdir -p /home/node/txai-projects/project/docs
  2. Create /home/node/txai-projects/project/docs/ARCHITECTURE.md
  3. Update main README "Additional Documentation" section
```

## 🔍 Final Verification Prompt

Before completing any documentation task, ask yourself:

1. **What type of documentation is this?**
   - Main README? → Root
   - Service README? → Service dir
   - Other? → /docs dir

2. **Does the directory exist?**
   - Check and create if needed

3. **Is it discoverable?**
   - Linked from main README?
   - Listed in project structure?

4. **Is it in the right place?**
   - NOT in root (unless main README)
   - In /docs or service dir

## Summary

✅ **Main README** → `/home/node/txai-projects/project/README.md`
✅ **Service READMEs** → `/home/node/txai-projects/project/services/{name}/README.md`
✅ **Everything Else** → `/home/node/txai-projects/project/docs/{filename}.md`

❌ **Never place non-README documentation in the project root**

When in doubt: **If it's not THE main README, it goes in /docs**
