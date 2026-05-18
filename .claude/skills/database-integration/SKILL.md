---
name: database-integration
description: Adds TRUE database persistence to applications - supports local CouchDB or remote databases (PostgreSQL, MySQL, MongoDB, CouchDB). Creates Express service wrapper with REST API endpoints, configures Vite proxy, generates frontend client code and React hooks for data persistence. ⚠️ CRITICAL - Invoke this skill whenever the user mentions specific database names or "persist to database" - even if you already used 'managing-services' to create the API.
---

# Database Integration Skill

Automatically detect when users request database functionality and set up database integration with client code generation.

## ⚠️ When to Use This Skill

**CRITICAL: Invoke this skill whenever the user mentions:**
- **Specific database names:** "PostgreSQL", "MySQL", "MongoDB", "CouchDB", "Postgres", "Mongo"
- **Persistence keywords:** "persist to database", "persist to db", "store in database", "store in db", "save to database", "save to db", "database backend", "db backend"
- **Even if you already used `managing-services` to create the API**

## Detection Keywords

**⚠️ CRITICAL: Use Conservative Detection - Only Trigger on EXPLICIT Database Requests**

**Trigger this skill ONLY when the user EXPLICITLY requests database functionality:**

**Explicit database indicators (must match):**
- **Database technology mentioned:** "database", "db", "couchdb", "postgresql", "postgres", "mysql", "mongodb", "mongo", "sqlite"
- **Explicit database phrases:**
  - "use database", "use db", "add database", "add db", "connect to database", "database backend", "db backend"
  - "store **in** database", "store **in** db", "save **to** database", "save **to** db", "persist **to** database", "persist **to** db"
  - "database connection", "db connection", "connection string", "remote database", "remote db", "database server", "db server"
- **Database persistence phrases:**
  - "need database persistence", "need db persistence", "data persistence **with database**", "data persistence **with db**"
  - "save **to** database between sessions", "save **to** db between sessions"

**DO NOT trigger on vague persistence phrases:**
- ❌ "store data" (too vague - could mean localStorage, memory, etc.)
- ❌ "persist data" (too vague - could mean client-side)
- ❌ "save records" (too vague)
- ❌ "store records" (too vague)
- ❌ "data storage" (too vague)
- ❌ "not storing in memory" (negative phrase, doesn't specify database)
- ❌ "not storing in localStorage" (negative phrase, doesn't specify database)

**Rule:** User must explicitly say they want a DATABASE, not just "persistence" or "storage"

**Examples:**
- ✅ "Create service with PostgreSQL database" → Trigger
- ✅ "Store employee records in database" → Trigger
- ✅ "Add database persistence" → Trigger
- ❌ "Create service to manage employees, not storing in memory" → DON'T trigger (no database mentioned)
- ❌ "Service with CRUD APIs for employees" → DON'T trigger (no database mentioned)
- ❌ "Persist employee data" → DON'T trigger (no database mentioned, could use service with in-memory storage)

## Supported Databases

### Local Database (Default)
- ✅ **CouchDB** - Document database with REST API and offline-first capabilities
  - Used when NO remote database connection details are provided
  - Automatically started via `start-db.sh` script (uses native CouchDB installation)

### Remote Databases
- ✅ **PostgreSQL** - Relational database with remote server
- ✅ **MySQL/MariaDB** - Relational database with remote server
- ✅ **MongoDB** - Document database with remote server
- ✅ **CouchDB** - Remote CouchDB server instance

## Workflow

### 1. Detect Database Type and Connection

**First, check if user provided remote database connection details:**

Look for any of these patterns in the user's message:
- Database type keywords: `"postgresql"`, `"postgres"`, `"mysql"`, `"mongodb"`, `"mongo"`
- Connection strings: `"postgresql://..."`, `"mysql://..."`, `"mongodb://..."`, `"http://...5984"`
- Connection details: mentions of `host`, `port`, `database name`, `username`, `password`, `server`, `remote`

**Decision Flow:**

```
IF remote database details provided in user message:
  → Use Remote Database Setup (proceed to Section 2A)
ELSE:
  → Use Local CouchDB Setup (proceed to Section 2B)
```

---

### 2A. Set Up Remote Database Service

**⚠️ USE THIS SECTION ONLY when user provides remote database connection details**

---

**Step 2A.1: Extract Database Connection Information**

Parse the user's message to identify:

1. **Database Type**: PostgreSQL, MySQL, MongoDB, or remote CouchDB
2. **Connection Details**:
   - Host/Server address
   - Port number
   - Database name
   - Username
   - Password
   - SSL/TLS requirements (if mentioned)
   - Or a complete connection string

**Example user inputs:**
```
"Use PostgreSQL at db.example.com:5432, database: myapp, user: admin, password: secret"
"Connect to MongoDB: mongodb://admin:pass123@mongo.example.com:27017/myapp"
"MySQL server: mysql.example.com, port 3306, db: app_db, user: root, password: mypass"
"Remote CouchDB at http://couchdb.example.com:5984, user: admin, pass: secret"
```

If any required information is missing, **ask the user** to provide:
- Database type (if ambiguous)
- Host/server address
- Port (or use standard defaults: PostgreSQL=5432, MySQL=3306, MongoDB=27017, CouchDB=5984)
- Database name
- Credentials (username/password)

---

**Step 2A.2: Determine Service Port**

use the **`managing-services`** skill to Choose the next available port for the database service

---

**Step 2A.3: Create Database Service Directory**

```bash
mkdir -p services/database
```

---

**Step 2A.4: Generate Service package.json**

Create `services/database/package.json` with the appropriate database driver:

**Base package.json:**
```json
{
  "name": "database-service",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "tsx server.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/node": "^20.0.0",
    "tsx": "^4.7.0"
  }
}
```

**Add database-specific driver to dependencies:**

- **PostgreSQL**: `"pg": "^8.11.3"` and add to devDependencies: `"@types/pg": "^8.10.9"`
- **MySQL**: `"mysql2": "^3.6.5"`
- **MongoDB**: `"mongodb": "^6.3.0"`
- **Remote CouchDB**: `"nano": "^10.1.2"`

---

**Step 2A.5: Generate Database Service Server**

Create `services/database/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import { router as dbRoutes } from './routes.js';

const app = express();
const port = process.env.DB_SERVICE_PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', dbRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'database',
    type: process.env.DB_TYPE || 'unknown',
    remote: true
  });
});

app.listen(port, () => {
  console.log(`Database service (${process.env.DB_TYPE}) running on port ${port}`);
  console.log(`Connected to: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});
```

---

**Step 2A.6: Generate Database Service Routes**

Create `services/database/routes.ts` based on database type.

**For PostgreSQL:**

```typescript
import { Router } from 'express';
import pg from 'pg';

export const router = Router();

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Successfully connected to PostgreSQL');
    release();
  }
});

// Get all records from a table
router.get('/tables/:table/docs', async (req, res) => {
  try {
    const { table } = req.params;
    const result = await pool.query(`SELECT * FROM ${table}`);
    res.json({ docs: result.rows });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch documents' });
  }
});

// Create record
router.post('/tables/:table/docs', async (req, res) => {
  try {
    const { table } = req.params;
    const data = req.body;
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await pool.query(
      `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: error.message || 'Failed to create document' });
  }
});

// Update record
router.put('/tables/:table/docs/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    const data = req.body;
    delete data.id; // Don't update the ID field
    
    const setClause = Object.keys(data)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');
    const values = [...Object.values(data), id];
    
    const result = await pool.query(
      `UPDATE ${table} SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: error.message || 'Failed to update document' });
  }
});

// Delete record
router.delete('/tables/:table/docs/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    res.json({ message: 'Document deleted' });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: error.message || 'Failed to delete document' });
  }
});

// Find records with filter
router.post('/tables/:table/find', async (req, res) => {
  try {
    const { table } = req.params;
    const { where = {}, limit = 100, offset = 0 } = req.body;
    
    let query = `SELECT * FROM ${table}`;
    const params: any[] = [];
    
    if (Object.keys(where).length > 0) {
      const conditions = Object.entries(where)
        .map(([key, _], i) => `${key} = $${i + 1}`)
        .join(' AND ');
      query += ` WHERE ${conditions}`;
      params.push(...Object.values(where));
    }
    
    query += ` LIMIT ${limit} OFFSET ${offset}`;
    
    const result = await pool.query(query, params);
    res.json({ docs: result.rows });
  } catch (error: any) {
    console.error('Error finding documents:', error);
    res.status(500).json({ error: error.message || 'Failed to find documents' });
  }
});
```

**For MySQL:**

```typescript
import { Router } from 'express';
import mysql from 'mysql2/promise';

export const router = Router();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('Successfully connected to MySQL');
    conn.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL:', err);
  });

// Get all records from a table
router.get('/tables/:table/docs', async (req, res) => {
  try {
    const { table } = req.params;
    const [rows] = await pool.query(`SELECT * FROM ??`, [table]);
    res.json({ docs: rows });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch documents' });
  }
});

// Create record
router.post('/tables/:table/docs', async (req, res) => {
  try {
    const { table } = req.params;
    const data = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO ?? SET ?`,
      [table, data]
    );
    res.json({ id: (result as any).insertId });
  } catch (error: any) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: error.message || 'Failed to create document' });
  }
});

// Update record
router.put('/tables/:table/docs/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    const data = req.body;
    delete data.id;
    
    const [result] = await pool.query(
      `UPDATE ?? SET ? WHERE id = ?`,
      [table, data, id]
    );
    res.json({ message: 'Document updated', affectedRows: (result as any).affectedRows });
  } catch (error: any) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: error.message || 'Failed to update document' });
  }
});

// Delete record
router.delete('/tables/:table/docs/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    await pool.query(`DELETE FROM ?? WHERE id = ?`, [table, id]);
    res.json({ message: 'Document deleted' });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: error.message || 'Failed to delete document' });
  }
});

// Find records with filter
router.post('/tables/:table/find', async (req, res) => {
  try {
    const { table } = req.params;
    const { where = {}, limit = 100, offset = 0 } = req.body;
    
    let query = `SELECT * FROM ??`;
    const params: any[] = [table];
    
    if (Object.keys(where).length > 0) {
      query += ` WHERE ` + Object.keys(where).map(key => `?? = ?`).join(' AND ');
      Object.entries(where).forEach(([key, val]) => {
        params.push(key, val);
      });
    }
    
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const [rows] = await pool.query(query, params);
    res.json({ docs: rows });
  } catch (error: any) {
    console.error('Error finding documents:', error);
    res.status(500).json({ error: error.message || 'Failed to find documents' });
  }
});
```

**For MongoDB:**

```typescript
import { Router } from 'express';
import { MongoClient, ObjectId } from 'mongodb';

export const router = Router();

const connectionString = process.env.DB_CONNECTION_STRING || 
  `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const client = new MongoClient(connectionString);
let db: any;

client.connect()
  .then(() => {
    db = client.db(process.env.DB_NAME);
    console.log('Successfully connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

// Get all documents from collection
router.get('/collections/:collection/docs', async (req, res) => {
  try {
    const { collection } = req.params;
    const docs = await db.collection(collection).find({}).toArray();
    res.json({ docs });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch documents' });
  }
});

// Create document
router.post('/collections/:collection/docs', async (req, res) => {
  try {
    const { collection } = req.params;
    const doc = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection(collection).insertOne(doc);
    res.json({ id: result.insertedId });
  } catch (error: any) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: error.message || 'Failed to create document' });
  }
});

// Update document
router.put('/collections/:collection/docs/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const result = await db.collection(collection).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    res.json(result.value);
  } catch (error: any) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: error.message || 'Failed to update document' });
  }
});

// Delete document
router.delete('/collections/:collection/docs/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    await db.collection(collection).deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'Document deleted' });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: error.message || 'Failed to delete document' });
  }
});

// Find documents
router.post('/collections/:collection/find', async (req, res) => {
  try {
    const { collection } = req.params;
    const { filter = {}, limit = 100, skip = 0, sort = {} } = req.body;
    const docs = await db.collection(collection)
      .find(filter)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .toArray();
    res.json({ docs });
  } catch (error: any) {
    console.error('Error finding documents:', error);
    res.status(500).json({ error: error.message || 'Failed to find documents' });
  }
});
```

**For Remote CouchDB:**

```typescript
import { Router } from 'express';
import Nano from 'nano';

export const router = Router();

const couchUrl = process.env.DB_CONNECTION_STRING || 
  `http://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}`;

const nano = Nano(couchUrl);

// Test connection
nano.db.list()
  .then(() => console.log('Successfully connected to CouchDB'))
  .catch(err => console.error('Error connecting to CouchDB:', err));

// Get all databases
router.get('/databases', async (req, res) => {
  try {
    const databases = await nano.db.list();
    res.json({ databases });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list databases' });
  }
});

// Create database
router.post('/databases/:name', async (req, res) => {
  try {
    const { name } = req.params;
    await nano.db.create(name);
    res.json({ message: `Database ${name} created` });
  } catch (error: any) {
    if (error.statusCode === 412) {
      res.status(200).json({ message: 'Database already exists' });
    } else {
      res.status(500).json({ error: error.message || 'Failed to create database' });
    }
  }
});

// Get all documents from a database
router.get('/databases/:name/docs', async (req, res) => {
  try {
    const { name } = req.params;
    const db = nano.db.use(name);
    const result = await db.list({ include_docs: true });
    const docs = result.rows
      .filter(row => !row.id.startsWith('_design'))
      .map(row => row.doc);
    res.json({ docs });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch documents' });
  }
});

// Create document
router.post('/databases/:name/docs', async (req, res) => {
  try {
    const { name } = req.params;
    const db = nano.db.use(name);
    const doc = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.insert(doc);
    res.json({ id: result.id, rev: result.rev });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create document' });
  }
});

// Update document
router.put('/databases/:name/docs/:id', async (req, res) => {
  try {
    const { name, id } = req.params;
    const db = nano.db.use(name);
    const doc = {
      ...req.body,
      _id: id,
      updatedAt: new Date().toISOString()
    };
    const result = await db.insert(doc);
    res.json({ id: result.id, rev: result.rev });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update document' });
  }
});

// Delete document
router.delete('/databases/:name/docs/:id', async (req, res) => {
  try {
    const { name, id } = req.params;
    const { rev } = req.query;
    if (!rev) {
      return res.status(400).json({ error: 'Revision (rev) is required' });
    }
    const db = nano.db.use(name);
    await db.destroy(id, rev as string);
    res.json({ message: 'Document deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete document' });
  }
});

// Find documents (Mango query)
router.post('/databases/:name/find', async (req, res) => {
  try {
    const { name } = req.params;
    const db = nano.db.use(name);
    const result = await db.find(req.body);
    res.json({ docs: result.docs });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to find documents' });
  }
});
```

---

**Step 2A.7: Create Environment Configuration**

Create or update `.env` file with the database connection details:

**For PostgreSQL:**
```bash
# Database Service Configuration
DB_SERVICE_PORT=4001
DB_TYPE=postgresql

# PostgreSQL Connection
DB_HOST=db.example.com
DB_PORT=5432
DB_NAME=myapp
DB_USER=admin
DB_PASSWORD=secret
DB_SSL=false

# Frontend config
VITE_DATABASE_NAME=myapp
VITE_DATABASE_TYPE=postgresql
```

**For MySQL:**
```bash
# Database Service Configuration
DB_SERVICE_PORT=4001
DB_TYPE=mysql

# MySQL Connection
DB_HOST=mysql.example.com
DB_PORT=3306
DB_NAME=myapp
DB_USER=root
DB_PASSWORD=secret

# Frontend config
VITE_DATABASE_NAME=myapp
VITE_DATABASE_TYPE=mysql
```

**For MongoDB:**
```bash
# Database Service Configuration
DB_SERVICE_PORT=4001
DB_TYPE=mongodb

# MongoDB Connection (choose one method)
# Method 1: Connection string
DB_CONNECTION_STRING=mongodb://admin:pass@mongo.example.com:27017/myapp

# Method 2: Individual parameters
DB_HOST=mongo.example.com
DB_PORT=27017
DB_NAME=myapp
DB_USER=admin
DB_PASSWORD=secret

# Frontend config
VITE_DATABASE_NAME=myapp
VITE_DATABASE_TYPE=mongodb
```

**For Remote CouchDB:**
```bash
# Database Service Configuration
DB_SERVICE_PORT=4001
DB_TYPE=couchdb

# CouchDB Connection (choose one method)
# Method 1: Connection string
DB_CONNECTION_STRING=http://admin:passw0rd@couchdb.example.com:5984

# Method 2: Individual parameters
DB_HOST=couchdb.example.com
DB_PORT=5984
DB_USER=admin
DB_PASSWORD=passw0rd

# Frontend config
VITE_DATABASE_NAME=myapp
VITE_DATABASE_TYPE=couchdb
```

---

**Step 2A.8: Install Service Dependencies**

```bash
cd services/database
npm install
cd ../..
```

---

**Step 2A.9: Update services-config.json**

use the **`managing-services`** skill to Add the database service to configuration

Replace `"type"` with the actual database type: `postgresql`, `mysql`, `mongodb`, or `couchdb`.

---

**Step 2A.10: Update start-services.sh**

Add database service startup to `start-services.sh`:

```bash
#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Get database service port from environment or services-config.json
DB_SERVICE_PORT=${DB_SERVICE_PORT:-4001}

# Check if another process is using the database service port
if lsof -Pi :${DB_SERVICE_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "Port ${DB_SERVICE_PORT} is already in use. Killing existing process..."
  lsof -ti :${DB_SERVICE_PORT} | xargs kill -9 2>/dev/null || true
  sleep 2
  echo "Process killed. Port ${DB_SERVICE_PORT} is now available."
fi

# Start database service (connects to remote database)
echo "Starting database service (${DB_TYPE})..."
cd services/database
nohup npm start > ../../logs/database.log 2>&1 &
cd ../..
echo "Database service started (PID: $!)"

# Add other services below...
```

---

**Step 2A.11: Update vite.config.ts Proxy**

⚠️ **MANDATORY SKILL INVOCATION** You MUST invoke the **`managing-services`** skill NOW:
- Invoke the **`managing-services`** skill to add database proxy configuration to `vite.config.ts`
- Use the Skill tool: managing-services
- Update vite.config.ts with Dynamic Proxy

**DO NOT manually add proxy configuration. The managing-services skill template MUST be used.**

**CRITICAL**: use the **`managing-services`** skill for vite proxy configuration and add proxy configuration dynamically with base URL prefix in **`managing-services`** skill templates/vite.config.ts

---

**Step 2A.12: Start the Service**

```bash
# Run the startup script
bash start-services.sh

# Wait a few seconds, then verify
curl http://localhost:${DB_SERVICE_PORT}/health

# Test connection (example for PostgreSQL)
curl http://localhost:${DB_SERVICE_PORT}/tables/users/docs
```

---

**✅ Remote database setup complete. Skip to Section 3 (Frontend Integration).**

---

### 2B. Set Up Local CouchDB Service

**⚠️ USE THIS SECTION ONLY when NO remote database details are provided (DEFAULT)**

**This is the default setup when user requests database functionality without specifying a remote database server.**

When user asks for database functionality without remote connection details:
1. Use local CouchDB (default database)
2. Check if database client code already exists in the project
3. Check if CouchDB service is already running
4. If not running, set up CouchDB as a local service

---

**Step 2B.1: Check if CouchDB Service Already Exists**

Check if CouchDB is already configured as a service:

```bash
# Check if services-config.json exists and contains couchdb
if [ -f "services-config.json" ]; then
  grep -q '"name": "couchdb"' services-config.json && echo "CouchDB service exists" || echo "CouchDB service not found"
fi

# Check if CouchDB is running
ps aux | grep -v grep | grep couchdb || echo "CouchDB not running"
```

If CouchDB service exists and is running, proceed to Step 3. Otherwise, continue with setup.

---

**Step 2B.2: Determine CouchDB Port**

use the **`managing-services`** skill to Choose the next available port for the database service and assign it to COUCHDB_PORT

---

**Step 2B.3: Start CouchDB Service and Create Application Database**

Create a script to start CouchDB: `start-db.sh`

```bash
#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Setup log file
LOG_FILE="logs/couchdb_start.log"

# Function to log messages to both console and file
log() {
  echo "$@" | tee -a "${LOG_FILE}"
}

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Get database configuration from environment or use defaults
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5984}
DB_USER=${DB_USER:-admin}
DB_PASSWORD=${DB_PASSWORD:-passw0rd}
DB_CONNECTION_STRING=${DB_CONNECTION_STRING:-http://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}}

# Get database name from environment or derive from package.json
if [ -z "${DB_NAME}" ]; then
  # Extract app name from package.json
  APP_NAME=$(grep -m 1 '"name":' package.json 2>/dev/null | sed 's/.*"name":\s*"\([^"]*\)".*/\1/' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9_]/_/g')
  DB_NAME=${APP_NAME:-myapp}_db
fi

log "========================================"
log "CouchDB Database Initialization"
log "========================================"
log "Configuration:"
log "  Host: ${DB_HOST}"
log "  Port: ${DB_PORT}"
log "  User: ${DB_USER}"
log "  Database: ${DB_NAME}"
log "  Log file: ${LOG_FILE}"
log ""

# Check if CouchDB is already running
log "[$(date +%H:%M:%S)] Checking if CouchDB is already running..."
if curl -s ${DB_HOST}:${DB_PORT}/ > /dev/null 2>&1; then
  echo "[$(date +%H:%M:%S)] ✓ CouchDB is already running at ${DB_HOST}:${DB_PORT}"
  COUCHDB_WAS_RUNNING=true
else
  echo "[$(date +%H:%M:%S)] CouchDB is not running, attempting to start..."
  COUCHDB_WAS_RUNNING=false
  
  # Only try to start if it's localhost
  if [ "${DB_HOST}" = "localhost" ] || [ "${DB_HOST}" = "127.0.0.1" ]; then
    START_TIME=$(date +%s)
    
    # Try systemctl first (if systemd is available)
    log "[$(date +%H:%M:%S)] Trying systemctl start couchdb..."
    if command -v systemctl > /dev/null 2>&1; then
      if sudo /usr/bin/systemctl start couchdb 2>&1; then
        log "[$(date +%H:%M:%S)] ✓ Started CouchDB via systemctl"
        log "[$(date +%H:%M:%S)] Waiting 2 seconds for CouchDB to initialize..."
        sleep 2
      else
        log "[$(date +%H:%M:%S)] ⚠ systemctl failed, trying other methods..."
      fi
    else
      log "[$(date +%H:%M:%S)] ⚠ systemctl not available"
    fi
    
    # Try service command (System V init) - only if not already running
    if ! curl -s ${DB_HOST}:${DB_PORT}/ > /dev/null 2>&1; then
      log "[$(date +%H:%M:%S)] Trying service couchdb start..."
      if sudo /usr/sbin/service couchdb start 2>&1; then
        log "[$(date +%H:%M:%S)] ✓ Started CouchDB via service command"
        log "[$(date +%H:%M:%S)] Waiting 2 seconds for CouchDB to initialize..."
        sleep 2
      else
        log "[$(date +%H:%M:%S)] ⚠ service command failed, trying direct start..."
      fi
    fi
    
    # Try direct start (fallback) - only if not already running
    # NOTE: Use nohup with & instead of -b flag. The -b flag is a legacy Erlang
    # option that blocks for 10-30s waiting for the VM to initialize.
    if ! curl -s ${DB_HOST}:${DB_PORT}/ > /dev/null 2>&1; then
      log "[$(date +%H:%M:%S)] Trying direct start: nohup sudo /opt/couchdb/bin/couchdb..."
      nohup sudo /opt/couchdb/bin/couchdb >> "${LOG_FILE}" 2>&1 &
      log "[$(date +%H:%M:%S)] ✓ Started CouchDB in background (PID: $!)"
      log "[$(date +%H:%M:%S)] Waiting 2 seconds for CouchDB to initialize..."
      sleep 2
    fi
    
    # Calculate how long we've already waited
    ELAPSED_TIME=$(($(date +%s) - START_TIME))
    log "[$(date +%H:%M:%S)] Initial startup attempts complete (${ELAPSED_TIME}s elapsed)"
    
    # Wait for CouchDB to accept connections (up to remaining time out of 30 seconds)
    REMAINING_WAIT=$((30 - ELAPSED_TIME))
    if [ $REMAINING_WAIT -lt 1 ]; then
      REMAINING_WAIT=1
    fi
    
    log "[$(date +%H:%M:%S)] Waiting for CouchDB to accept connections (max ${REMAINING_WAIT} more seconds)..."
    COUCHDB_READY=false
    CHECK_COUNT=0
    
    for i in $(seq 1 $REMAINING_WAIT); do
      CHECK_COUNT=$((CHECK_COUNT + 1))
      
      # Try to connect
      if RESPONSE=$(curl -s ${DB_HOST}:${DB_PORT}/ 2>&1); then
        TOTAL_TIME=$(($(date +%s) - START_TIME))
        log ""
        log "[$(date +%H:%M:%S)] ✓ CouchDB is ready! (Total startup time: ${TOTAL_TIME}s, ${CHECK_COUNT} connection attempts)"
        log "[$(date +%H:%M:%S)] Response: ${RESPONSE}"
        COUCHDB_READY=true
        break
      else
        # Show progress with diagnostic info every 5 seconds
        if [ $((i % 5)) -eq 0 ]; then
          CURRENT_ELAPSED=$(($(date +%s) - START_TIME))
          log "[$(date +%H:%M:%S)] Still waiting... (${CURRENT_ELAPSED}s elapsed, ${CHECK_COUNT} attempts)"
          
          # Check if process is running
          if ps aux | grep -v grep | grep couchdb > /dev/null; then
            log "[$(date +%H:%M:%S)]   → CouchDB process is running"
          else
            log "[$(date +%H:%M:%S)]   → WARNING: CouchDB process not found!"
          fi
          
          # Check if port is listening
          if lsof -i :${DB_PORT} > /dev/null 2>&1; then
            log "[$(date +%H:%M:%S)]   → Port ${DB_PORT} is listening"
          else
            log "[$(date +%H:%M:%S)]   → Port ${DB_PORT} is not listening yet"
          fi
        else
          echo -n "." | tee -a "${LOG_FILE}"
        fi
      fi
      
      sleep 1
    done
    
    if [ "$COUCHDB_READY" = false ]; then
      TOTAL_TIME=$(($(date +%s) - START_TIME))
      log ""
      log "[$(date +%H:%M:%S)] ✗ ERROR: CouchDB did not start accepting connections after ${TOTAL_TIME} seconds"
      log ""
      log "Diagnostic Information:"
      log "  → Process running: $(ps aux | grep -v grep | grep couchdb > /dev/null && echo 'YES' || echo 'NO')"
      log "  → Port listening: $(lsof -i :${DB_PORT} > /dev/null 2>&1 && echo 'YES' || echo 'NO')"
      log "  → Connection attempts: ${CHECK_COUNT}"
      log ""
      log "Common causes:"
      log "  1. CouchDB not installed properly"
      log "  2. Port ${DB_PORT} blocked by firewall"
      log "  3. Configuration error in CouchDB"
      log "  4. Insufficient system resources"
      log ""
      log "Check CouchDB logs:"
      log "  Linux: sudo tail -50 /var/log/couchdb/couchdb.log"
      log "  macOS: tail -50 /usr/local/var/log/couchdb/couchdb.log"
      log ""
      exit 1
    fi
  else
    log "[$(date +%H:%M:%S)] ✗ ERROR: Remote CouchDB at ${DB_HOST}:${DB_PORT} is not accessible"
    log "Please ensure CouchDB is running and accessible from this machine"
    exit 1
  fi
fi

# Initialize CouchDB system databases (only for localhost and only if we just started it)
if [ "$COUCHDB_WAS_RUNNING" = false ] && ([ "${DB_HOST}" = "localhost" ] || [ "${DB_HOST}" = "127.0.0.1" ]); then
  log ""
  log "[$(date +%H:%M:%S)] Initializing CouchDB system databases..."
  
  log "[$(date +%H:%M:%S)]   Creating _users database..."
  if curl -s -X PUT "http://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/_users" 2>&1 | grep -q '"ok":true\|file_exists'; then
    log "[$(date +%H:%M:%S)]   ✓ _users database ready"
  else
    log "[$(date +%H:%M:%S)]   ⚠ _users database creation returned unexpected response"
  fi
  
  log "[$(date +%H:%M:%S)]   Creating _replicator database..."
  if curl -s -X PUT "http://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/_replicator" 2>&1 | grep -q '"ok":true\|file_exists'; then
    log "[$(date +%H:%M:%S)]   ✓ _replicator database ready"
  else
    log "[$(date +%H:%M:%S)]   ⚠ _replicator database creation returned unexpected response"
  fi
  
  log "[$(date +%H:%M:%S)] ✓ CouchDB system databases initialized"
fi

# Create application database
log ""
log "[$(date +%H:%M:%S)] Creating application database: ${DB_NAME}..."
CREATE_RESPONSE=$(curl -s -X PUT "http://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}")

if echo "$CREATE_RESPONSE" | grep -q '"ok":true'; then
  log "[$(date +%H:%M:%S)] ✓ Application database '${DB_NAME}' created successfully"
elif echo "$CREATE_RESPONSE" | grep -q 'file_exists'; then
  log "[$(date +%H:%M:%S)] ✓ Application database '${DB_NAME}' already exists"
else
  log "[$(date +%H:%M:%S)] ⚠ Warning: Unexpected response creating database"
  log "[$(date +%H:%M:%S)]   Response: ${CREATE_RESPONSE}"
fi

# Verify database exists
log "[$(date +%H:%M:%S)] Verifying database..."
VERIFY_RESPONSE=$(curl -s "http://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}")
if echo "$VERIFY_RESPONSE" | grep -q '"db_name"'; then
  DOC_COUNT=$(echo "$VERIFY_RESPONSE" | grep -o '"doc_count":[0-9]*' | grep -o '[0-9]*')
  log "[$(date +%H:%M:%S)] ✓ Application database verified (${DOC_COUNT} documents)"
else
  log "[$(date +%H:%M:%S)] ⚠ Warning: Could not verify application database"
fi

log ""
log "========================================"
log "CouchDB Setup Complete!"
log "========================================"
if [ "$COUCHDB_WAS_RUNNING" = false ]; then
  log "  Status: Started CouchDB and initialized database"
else
  log "  Status: CouchDB was already running, database ready"
fi
log "  Access: http://${DB_HOST}:${DB_PORT}"
log "  Database: ${DB_NAME}"
log ""
```

Make the script executable:

```bash
chmod +x start-db.sh
```

---

**Step 2B.4: Create Environment Configuration**

Create or update `.env` file with CouchDB connection details:

```bash
# CouchDB Database Configuration
# You can change these values to connect to a remote CouchDB server
DB_HOST=localhost
DB_PORT=5984
DB_USER=admin
DB_PASSWORD=passw0rd
DB_NAME=myapp_db
DB_CONNECTION_STRING=http://admin:passw0rd@localhost:5984

# CouchDB Service Port (for the Express wrapper service)
COUCHDB_SERVICE_PORT=4001

# Frontend Configuration
VITE_DATABASE_TYPE=couchdb
```

**To use a remote CouchDB server:**
1. Change `DB_HOST` to your remote server address (e.g., `db.example.com`)
2. Update `DB_PORT` if different (default: 5984)
3. Set `DB_USER` and `DB_PASSWORD` for your remote server
4. Set `DB_NAME` to your desired database name (will be created if it doesn't exist)
5. Update `DB_CONNECTION_STRING` to match: `http://{user}:{password}@{host}:{port}`

---

**Step 2B.5: Create CouchDB Service Directory**

Create the service structure:

```bash
mkdir -p services/couchdb
```

---

**Step 2B.6: Generate CouchDB Service Package.json**

Create `services/couchdb/package.json`:

```json
{
  "name": "couchdb-service",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "tsx server.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "nano": "^10.1.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/node": "^20.0.0",
    "tsx": "^4.7.0"
  }
}
```

---

**Step 2B.7: Generate CouchDB Service Server**

Create `services/couchdb/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import { router as dbRoutes } from './routes.js';

const app = express();
const port = process.env.COUCHDB_PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', dbRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'couchdb' });
});

app.listen(port, () => {
  console.log(`CouchDB service running on port ${port}`);
});
```

---

**Step 2B.8: Generate CouchDB Service Routes**

Create `services/couchdb/routes.ts`:

```typescript
import { Router } from 'express';
import Nano from 'nano';

export const router = Router();

// Initialize Nano client
const nano = Nano('http://admin:passw0rd@localhost:5984');

// Get all databases
router.get('/databases', async (req, res) => {
  try {
    const databases = await nano.db.list();
    res.json({ databases });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list databases' });
  }
});

// Create database
router.post('/databases/:name', async (req, res) => {
  try {
    const { name } = req.params;
    await nano.db.create(name);
    res.json({ message: `Database ${name} created` });
  } catch (error: any) {
    if (error.statusCode === 412) {
      res.status(200).json({ message: 'Database already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create database' });
    }
  }
});

// Get all documents from a database
router.get('/databases/:name/docs', async (req, res) => {
  try {
    const { name } = req.params;
    const db = nano.db.use(name);
    const result = await db.list({ include_docs: true });
    const docs = result.rows
      .filter(row => !row.id.startsWith('_design'))
      .map(row => row.doc);
    res.json({ docs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Create document
router.post('/databases/:name/docs', async (req, res) => {
  try {
    const { name } = req.params;
    const db = nano.db.use(name);
    const doc = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.insert(doc);
    res.json({ id: result.id, rev: result.rev });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// Update document
router.put('/databases/:name/docs/:id', async (req, res) => {
  try {
    const { name, id } = req.params;
    const db = nano.db.use(name);
    const doc = {
      ...req.body,
      _id: id,
      updatedAt: new Date().toISOString()
    };
    const result = await db.insert(doc);
    res.json({ id: result.id, rev: result.rev });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document
router.delete('/databases/:name/docs/:id', async (req, res) => {
  try {
    const { name, id } = req.params;
    const { rev } = req.query;
    if (!rev) {
      return res.status(400).json({ error: 'Revision (rev) is required' });
    }
    const db = nano.db.use(name);
    await db.destroy(id, rev as string);
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Find documents (Mango query)
router.post('/databases/:name/find', async (req, res) => {
  try {
    const { name } = req.params;
    const db = nano.db.use(name);
    const result = await db.find(req.body);
    res.json({ docs: result.docs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to find documents' });
  }
});
```

---

**Step 2B.9: Install CouchDB Service Dependencies**

```bash
cd services/couchdb
npm install
cd ../..
```

---

**Step 2B.10: Update services-config.json**

use the **`managing-services`** skill to Add CouchDB to the services configuration services-config.json file.

---

**Step 2B.11: Ensure CouchDB is Running**

The CouchDB service connects to the local CouchDB installation at localhost:5984.
CouchDB is already started in Step 2B.3 if it wasn't running.

---

**Step 2B.12: Update vite.config.ts Proxy**

⚠️ **MANDATORY SKILL INVOCATION** You MUST invoke the **`managing-services`** skill NOW:
- Invoke the **`managing-services`** skill to add database proxy configuration to `vite.config.ts`
- Use the Skill tool: managing-services
- Update vite.config.ts with Dynamic Proxy

**DO NOT manually add proxy configuration. The managing-services skill template MUST be used.**

**CRITICAL**: use the **`managing-services`** skill for vite proxy configuration and add proxy configuration dynamically with base URL prefix in **`managing-services`** skill templates/vite.config.ts

---

**Step 2B.13: Update start-services.sh to Auto-Start Database**

Add database startup logic to the **beginning** of `start-services.sh` to ensure the database starts before services on every application restart.

**Instructions:**

Add the following code block immediately after the shebang line in `start-services.sh` (before the VITE_BASE_PATH and service startup logic):

```bash
#!/bin/bash

# ========================================
# AUTO-START DATABASE (if start-db.sh exists)
# ========================================
if [ -f "start-db.sh" ]; then
  echo "================================================"
  echo "Initializing database (start-db.sh found)..."
  echo "================================================"
  bash start-db.sh
  
  if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Database initialization failed!"
    echo "Services will not start without a working database."
    echo "Please check the error messages above and fix database issues."
    echo ""
    exit 1
  fi
  
  echo ""
  echo "✓ Database initialization successful"
  echo ""
fi

# Continue with normal service startup...
# (Rest of start-services.sh follows below)
```

**What this does:**
- ✅ Checks if `start-db.sh` exists in the project
- ✅ Runs database initialization **before** starting services
- ✅ Works automatically on application restarts
- ✅ Fails fast if database can't start (prevents services from running without DB)
- ✅ Backward compatible (projects without database integration are unaffected)
- ✅ User only needs to run: `bash start-services.sh` (one command for everything)

**⚠️ IMPORTANT:** After adding this block, `start-services.sh` is the ONLY script you need to run. Do NOT run `start-db.sh` separately — it will be called automatically. In Step 2B.16, only run `bash start-services.sh`.
**Note:** This replaces the need to manually run `bash start-db.sh` before `bash start-services.sh`. The database will now start automatically as part of the service startup process.

---

**Step 2B.14: Create CouchDB Installation Guide**

Create `docs/COUCHDB_INSTALL.md` with installation instructions:

```markdown
# CouchDB Installation Guide

This guide provides instructions for installing Apache CouchDB on different operating systems.

## Table of Contents
- [Windows Installation](#windows-installation)
- [macOS Installation](#macos-installation)
- [Linux Installation](#linux-installation)
- [Verifying Installation](#verifying-installation)
- [Configuration](#configuration)

---

## Windows Installation

Follow instructions from https://docs.couchdb.org/en/stable/install/windows.html

---

## macOS Installation

Follow instructions from https://docs.couchdb.org/en/stable/install/mac.html

---

## Linux Installation

Follow instructions from https://docs.couchdb.org/en/stable/install/unix.html

```

**CRITICAL**: Add local CouchDB install instructions as Prerequisites for Installation in App README.md file

---

## Verifying Installation

### Check CouchDB is Running

```bash
# Test the API endpoint
curl http://localhost:5984/

# Expected response:
{
  "couchdb": "Welcome",
  "version": "3.3.3",
  "git_sha": "...",
  "uuid": "...",
  "features": [...],
  "vendor": {
    "name": "The Apache Software Foundation"
  }
}
```

### Access Fauxton (Web UI)

1. Open browser: http://localhost:5984/_utils
2. Login with your admin credentials (admin/passw0rd)
3. Create a test database to verify write permissions

### Test with Authentication

```bash
# Create a test database
curl -X PUT http://admin:passw0rd@localhost:5984/testdb

# List databases
curl http://admin:passw0rd@localhost:5984/_all_dbs

# Delete test database
curl -X DELETE http://admin:passw0rd@localhost:5984/testdb
```

---

## Configuration

### Update Your Application's .env File

After installing CouchDB, update your application's `.env` file:

```bash
# For local installation
DB_HOST=localhost
DB_PORT=5984
DB_USER=admin
DB_PASSWORD=passw0rd
DB_NAME=myapp_db
DB_CONNECTION_STRING=http://admin:passw0rd@localhost:5984

# For remote CouchDB server
# DB_HOST=your-server.com
# DB_PORT=5984
# DB_USER=your_username
# DB_PASSWORD=your_password
# DB_NAME=your_database_name
# DB_CONNECTION_STRING=http://your_username:your_password@your-server.com:5984
```

### Security Recommendations

1. **Change Default Password**
   - Never use `passw0rd` in production
   - Use strong passwords (16+ characters, mixed case, numbers, symbols)

2. **Restrict Network Access**
   - For development: bind to `127.0.0.1` (localhost only)
   - For production: use firewall rules and SSL/TLS

3. **Enable SSL/TLS**
   - Configure HTTPS for production deployments
   - Use Let's Encrypt for free SSL certificates

4. **Regular Updates**
   ```bash
   # Check for updates regularly
   brew upgrade couchdb  # macOS
   sudo apt update && sudo apt upgrade couchdb  # Ubuntu/Debian
   ```

---

## Troubleshooting

### CouchDB Won't Start

**Check logs:**
- Linux: `/var/log/couchdb/couchdb.log`
- macOS: `/usr/local/var/log/couchdb/couchdb.log`
- Windows: `C:\Program Files\Apache CouchDB\var\log\couchdb.log`

**Common issues:**
- Port 5984 already in use: `sudo lsof -i :5984`
- Permission issues: Check file ownership in data directory
- Insufficient disk space: CouchDB needs space for data and logs

### Cannot Connect to CouchDB

```bash
# Check if CouchDB is running
ps aux | grep couchdb

# Check if port is listening
netstat -an | grep 5984
telnet localhost 5984

# Test with curl
curl -v http://localhost:5984/
```

### Authentication Issues

```bash
# Reset admin password (Ubuntu/Debian)
sudo nano /opt/couchdb/etc/local.ini
# Add/modify under [admins] section:
admin = newpassword

# Restart CouchDB
sudo systemctl restart couchdb
```

---

## Additional Resources

- [Official CouchDB Documentation](https://docs.couchdb.org/)
- [CouchDB Installation Guide](https://docs.couchdb.org/en/stable/install/index.html)
- [CouchDB Best Practices](https://docs.couchdb.org/en/stable/best-practices/index.html)
- [Fauxton UI Guide](https://docs.couchdb.org/en/stable/fauxton/index.html)

---

## Next Steps

After installing CouchDB:
1. Update your application's `.env` file with the correct credentials
2. Run `bash start-db.sh` to verify connection and create application database
3. Access Fauxton at http://localhost:5984/_utils to manage your databases
```

---

**Step 2B.15: Update Application README**

Add CouchDB setup instructions to the main `README.md`:

```markdown
## Database Setup

This application uses Apache CouchDB for data persistence.

### Installing CouchDB

CouchDB must be installed on your system before running this application.

**📖 See detailed installation instructions: [docs/COUCHDB_INSTALL.md](docs/COUCHDB_INSTALL.md)**

Quick install commands:

- **macOS:** See [docs/COUCHDB_INSTALL.md](docs/COUCHDB_INSTALL.md#macos-installation)
- **Ubuntu/Debian:** See [docs/COUCHDB_INSTALL.md](docs/COUCHDB_INSTALL.md#linux-installation)
- **Windows:** See [docs/COUCHDB_INSTALL.md](docs/COUCHDB_INSTALL.md#windows-installation)
- **Docker:** `docker run -d -p 5984:5984 -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=passw0rd couchdb:3.3`

### Configuration

The application connects to CouchDB using configuration in `.env`:

```bash
DB_HOST=localhost          # CouchDB server address
DB_PORT=5984              # CouchDB port (default: 5984)
DB_USER=admin             # Admin username
DB_PASSWORD=passw0rd      # Admin password
DB_NAME=myapp_db          # Database name (auto-created)
DB_CONNECTION_STRING=http://admin:passw0rd@localhost:5984
```

**For local development:** Use the default values above

**For remote CouchDB:** Update `DB_HOST`, `DB_NAME`, and credentials to point to your remote server

### Starting the Application

```bash
# Install dependencies
npm install

# Start all services (automatically starts database if needed)
bash start-services.sh

# Start frontend - see "Starting the Frontend" section in configuring-vite-environments skill
```

The database will be started and created automatically when you run `start-services.sh` (which checks for and runs `start-db.sh` if it exists).

### Accessing the Database

- **Fauxton UI:** http://localhost:5984/_utils (login with admin credentials)
- **API Endpoint:** http://localhost:5984/
- **Application Database:** `{app-name}_db`

### Troubleshooting

If you encounter database connection issues:

1. Verify CouchDB is running: `curl http://localhost:5984/`
2. Check credentials in `.env` match your CouchDB admin user
3. Review CouchDB logs (location varies by OS - see [docs/COUCHDB_INSTALL.md](docs/COUCHDB_INSTALL.md#troubleshooting))
4. Ensure port 5984 is not blocked by firewall

For more help, see the [CouchDB Installation Guide](docs/COUCHDB_INSTALL.md).
```

---

**Step 2B.16: Start the Services**

**⚠️ CRITICAL: You MUST start all backend services BEFORE the frontend app.**

```bash
# Start everything (database + all services) with one command
# start-services.sh automatically calls start-db.sh first (added in Step 2B.13)
bash start-services.sh
```

**⚠️ Do NOT run `start-db.sh` separately** — it is called automatically by `start-services.sh` (see Step 2B.13).

Wait a few seconds for the services to start, then verify:

```bash
# Check if CouchDB database is running
curl http://${DB_HOST}:${DB_PORT}/

# Check if CouchDB service is running
ps aux | grep -v grep | grep "couchdb.*tsx server.ts"

# Test the service
curl http://localhost:${COUCHDB_SERVICE_PORT}/health

# Verify application database was created
curl http://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/_all_dbs
```

---

## ⚠️ CRITICAL: Service Startup Order

**You MUST start backend services BEFORE the frontend app. Always follow this order:**

1. **`bash start-services.sh`** — Starts CouchDB daemon (via `start-db.sh`), then all Express services
2. **Start the frontend** — See "Starting the Frontend" section in configuring-vite-environments skill (only AFTER services are running)

**Never run `npm run dev` without first running `bash start-services.sh`.**
**Never run `start-db.sh` separately — it is called automatically by `start-services.sh`.**

**✅ Local CouchDB setup complete. Proceed to Section 3 (Frontend Integration).**

------

### 3. Initialize Application Database (Common for Both Local and Remote)

**This section applies to both local CouchDB (Section 2B) and remote databases (Section 2A).**

After the database service is running, initialize the application database:

**For Local CouchDB:**

```bash
# Get the CouchDB service port from services-config.json
COUCHDB_PORT=$(grep -A 3 '"name": "couchdb"' services-config.json | grep '"port"' | grep -o '[0-9]*')

# Create application database (sanitize app name)
APP_DB_NAME=$(echo "app_myapp" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9_]/_/g')

# Create database via the CouchDB service
curl -X POST "http://localhost:${COUCHDB_PORT}/databases/${APP_DB_NAME}"

# Verify database was created
curl "http://localhost:${COUCHDB_PORT}/databases"
```

**For Remote PostgreSQL/MySQL:**

```bash
# Tables should already exist in the remote database
# If not, create them using SQL:
# For PostgreSQL/MySQL, the user should create tables via their database admin tool
# Or provide SQL schema for the service to execute

# Get the database service port
DB_SERVICE_PORT=$(grep -A 3 '"name": "database"' services-config.json | grep '"port"' | grep -o '[0-9]*')

# Test connection
curl http://localhost:${DB_SERVICE_PORT}/health
```

**For Remote MongoDB:**

```bash
# Collections will be created automatically on first insert
# Get the database service port
DB_SERVICE_PORT=$(grep -A 3 '"name": "database"' services-config.json | grep '"port"' | grep -o '[0-9]*')

# Test connection
curl http://localhost:${DB_SERVICE_PORT}/health
```

### 4. Generate Frontend Database Client Code (Common for Both Local and Remote)

use the **`managing-services`** skill to Update or create `src/lib/api.ts` to include database methods.

**Note:** The API client automatically adapts based on `VITE_DATABASE_TYPE` environment variable:
- `couchdb`: Uses `/databases/{name}/docs`
- `postgresql` or `mysql`: Uses `/tables/{name}/docs`
- `mongodb`: Uses `/collections/{name}/docs`

---

### 5. Generate React Hook for Database Operations (Common for Both Local and Remote)

Create `src/hooks/useDatabase.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { database } from '../lib/api';

export interface DatabaseRecord {
  _id?: string;
  _rev?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useDatabase<T extends DatabaseRecord>(
  databaseName: string,
  options?: {
    autoFetch?: boolean;
    selector?: any;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const records = options?.selector
        ? await database.find<T>(databaseName, options.selector)
        : await database.getAllDocs<T>(databaseName);
      setData(records);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [databaseName, options?.selector]);

  const create = useCallback(
    async (doc: Omit<T, '_id' | '_rev' | 'createdAt' | 'updatedAt'>) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await database.createDoc(databaseName, doc);
        await fetchAll(); // Refresh data
        return result;
      } catch (err) {
        setError(err as Error);
        console.error('Error creating document:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [databaseName, fetchAll]
  );

  const update = useCallback(
    async (doc: T) => {
      if (!doc._id || !doc._rev) {
        throw new Error('Document must have _id and _rev for update');
      }
      setIsLoading(true);
      setError(null);
      try {
        const result = await database.updateDoc(databaseName, doc);
        await fetchAll(); // Refresh data
        return result;
      } catch (err) {
        setError(err as Error);
        console.error('Error updating document:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [databaseName, fetchAll]
  );

  const remove = useCallback(
    async (id: string, rev: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await database.deleteDoc(databaseName, id, rev);
        await fetchAll(); // Refresh data
      } catch (err) {
        setError(err as Error);
        console.error('Error deleting document:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [databaseName, fetchAll]
  );

  const find = useCallback(
    async (
      selector: any,
      queryOptions?: {
        limit?: number;
        skip?: number;
        sort?: Array<{ [key: string]: 'asc' | 'desc' }>;
      }
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const records = await database.find<T>(databaseName, selector, queryOptions);
        setData(records);
        return records;
      } catch (err) {
        setError(err as Error);
        console.error('Error finding documents:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [databaseName]
  );

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchAll();
    }
  }, [fetchAll, options?.autoFetch]);

  return {
    data,
    isLoading,
    error,
    fetchAll,
    create,
    update,
    remove,
    find,
  };
}
```

### 6. Update Environment Configuration

Add to `.env`:

```bash
# CouchDB Configuration
VITE_COUCHDB_DATABASE=app_myapp
```

**Note:** The CouchDB service URL is handled by the Vite proxy configuration, so no URL needs to be specified in .env.

### 7. No Additional Dependencies Required

The database integration uses the CouchDB service you created, which already has all necessary dependencies (nano, express, cors). The frontend uses standard fetch API, so no additional npm packages are needed for the client side.

---

## Usage Examples

### Basic CRUD Operations

```typescript
import { useDatabase } from './hooks/useDatabase';

interface User {
  _id?: string;
  _rev?: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

function UserList() {
  const { data, isLoading, error, create, update, remove } = useDatabase<User>('app_myapp');

  const handleCreate = async () => {
    try {
      await create({
        name: 'John Doe',
        email: 'john@example.com'
      });
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  const handleUpdate = async (user: User) => {
    if (!user._id || !user._rev) return;
    
    try {
      await update({
        ...user,
        name: 'Jane Doe'
      });
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const handleDelete = async (user: User) => {
    if (!user._id || !user._rev) return;
    
    try {
      await remove(user._id, user._rev);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleCreate}>Add User</button>
      <ul>
        {data.map(user => (
          <li key={user._id}>
            {user.name} - {user.email}
            <button onClick={() => handleUpdate(user)}>Edit</button>
            <button onClick={() => handleDelete(user)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Query with Selector

```typescript
const { find } = useDatabase<User>('app_myapp');

// Find users by email domain
const users = await find({
  email: { $regex: '.*@example.com$' }
});

// Find users with pagination
const pagedUsers = await find(
  { email: { $exists: true } },
  { limit: 10, skip: 0, sort: [{ name: 'asc' }] }
);
```

## Troubleshooting

### Service Not Starting

1. **Check if CouchDB service is running:**
   ```bash
   ps aux | grep -v grep | grep "tsx server.ts.*couchdb"
   ```

2. **Check service logs:**
   ```bash
   tail -f logs/couchdb.log
   tail -f logs/couchdb_start.log
   ```

3. **Re-run the database startup script:**
   ```bash
   bash start-db.sh
   ```

4. **Test CouchDB directly:**
   ```bash
   curl http://localhost:5984/
   ```

### Connection Errors

1. **Verify CouchDB service port:**
   ```bash
   # Check services-config.json for the port
   grep -A 3 '"name": "couchdb"' services-config.json
   ```

2. **Test the service endpoint:**
   ```bash
   # Replace 4001 with actual port from services-config.json
   curl http://localhost:4001/health
   curl http://localhost:4001/databases
   ```

3. **Check Vite proxy configuration:**
   - Ensure `vite.config.ts` includes CouchDB proxy
   - Verify proxy path includes `VITE_BASE_PATH`

### Database Not Found

```bash
# List all databases
COUCHDB_PORT=$(grep -A 3 '"name": "couchdb"' services-config.json | grep '"port"' | grep -o '[0-9]*')
curl "http://localhost:${COUCHDB_PORT}/databases"

# Create database if missing
curl -X POST "http://localhost:${COUCHDB_PORT}/databases/app_myapp"
```

## Best Practices

1. **Always include timestamps:** The service automatically adds `createdAt` and `updatedAt`

2. **Handle revision conflicts:** CouchDB requires `_rev` for updates - always include it

3. **Query efficiently:** Use selectors instead of fetching all documents
   ```typescript
   // ❌ Don't fetch all and filter in JS
   const all = await database.getAllDocs('app_myapp');
   const filtered = all.filter(doc => doc.email.includes('@example.com'));
   
   // ✅ Use database query
   const filtered = await database.find('app_myapp', { 
     email: { $regex: '.*@example.com$' } 
   });
   ```

4. **Use the generated API client:** Always use the `database` methods from `src/lib/api.ts` rather than raw fetch calls

5. **Service management:** Use `start-services.sh` to start/restart the CouchDB service along with other backend services

## Database Schema Design

For CouchDB (document database), design your schemas as self-contained documents:

```typescript
// ✅ Good - self-contained document
interface BlogPost {
  _id?: string;
  _rev?: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ❌ Avoid - requiring joins across documents
interface BlogPost {
  _id?: string;
  _rev?: string;
  title: string;
  content: string;
  authorId: string; // Would need separate lookup
  tagIds: string[]; // Would need separate lookups
}
```

## Summary

After running this skill, the user will have:

**For Local CouchDB Setup (Default):**
1. ✅ CouchDB running locally (port 5984) via `start-db.sh` script
2. ✅ CouchDB Express service created in `services/couchdb/`
3. ✅ Application database created and initialized
4. ✅ Service tracked in `services-config.json` with type: `couchdb`

**For Remote Database Setup:**
1. ✅ Database service created in `services/database/`
2. ✅ Connection to remote database (PostgreSQL/MySQL/MongoDB/CouchDB)
3. ✅ Environment variables configured for connection
4. ✅ Service tracked in `services-config.json` with appropriate type

**Common for Both:**
5. ✅ Service dependencies installed
6. ✅ Frontend API client with database methods in `src/lib/api.ts`
7. ✅ React hook for easy database integration in `src/hooks/useDatabase.ts`
8. ✅ Vite proxy configuration updated (`/api/database`)
9. ✅ Service startup script updated (`start-services.sh`)
10. ✅ Example usage patterns and best practices

**Architecture Notes:**

**Local CouchDB:**
- CouchDB runs locally (localhost:5984), started via `start-db.sh` script
- CouchDB service (Express) wraps the local instance
- Frontend → Vite proxy → Express service → Local CouchDB

**Remote Database:**
- Database runs on remote server (user-provided connection details)
- Database service (Express) connects to remote instance
- Frontend → Vite proxy → Express service → Remote Database Server
- Supports PostgreSQL, MySQL, MongoDB, and remote CouchDB

**Common:**
- All services communicate via localhost (same pod)
- Service uses unique port defined in `services-config.json`
- All API paths include `VITE_BASE_PATH` for proper Kubernetes routing
- Frontend API client adapts based on `VITE_DATABASE_TYPE` env variable

The database is now fully integrated and ready to use in the application!
