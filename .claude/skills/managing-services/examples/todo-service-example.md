# Todo Service Complete Example

This example demonstrates the complete workflow for generating a todo backend service with JSON file persistence.

## User Request

> "I need a database backend to store and retrieve todo items"

## Step-by-Step Implementation

### 1. Create Service Directory

```bash
mkdir -p services/todo
```

### 2. Generate package.json

Copy `templates/service-package.json` to `services/todo/package.json`:

```json
{
  "name": "@services/todo",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "tsx server.ts",
    "dev": "tsx watch server.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "tsx": "^4.7.0"
  }
}
```

### 3. Generate server.ts

Copy `templates/service-server.ts` to `services/todo/server.ts` and replace placeholders:

**Before:**
```typescript
const PORT = process.env.{SERVICE_NAME_UPPER}_PORT || {default-port}
console.log(`{Service name} service running on port ${PORT}`)
```

**After:**
```typescript
const PORT = process.env.TODO_PORT || 4001
console.log(`Todo service running on port ${PORT}`)
```

**Complete file:**

```typescript
import express from 'express'
import cors from 'cors'
import { router } from './routes.js'

const app = express()
const PORT = process.env.TODO_PORT || 4001

app.use(cors())
app.use(express.json())
app.use('/', router)

app.listen(PORT, () => {
  console.log(`Todo service running on port ${PORT}`)
})
```

### 4. Generate routes.ts

Create `services/todo/routes.ts` with todo-specific CRUD operations:

```typescript
import { Router } from 'express'
import fs from 'fs/promises'
import path from 'path'

export const router = Router()

const DATA_FILE = path.join(process.cwd(), 'data', 'todos.json')

// Ensure data directory exists
await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })

// Initialize data file if it doesn't exist
try {
  await fs.access(DATA_FILE)
} catch {
  await fs.writeFile(DATA_FILE, JSON.stringify([]))
}

// Helper to read todos
async function readTodos() {
  const data = await fs.readFile(DATA_FILE, 'utf-8')
  return JSON.parse(data)
}

// Helper to write todos
async function writeTodos(todos: any[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2))
}

// GET all todos
router.get('/', async (req, res) => {
  try {
    const todos = await readTodos()
    res.json(todos)
  } catch (error) {
    res.status(500).json({ error: 'Failed to read todos' })
  }
})

// POST new todo
router.post('/', async (req, res) => {
  try {
    const todos = await readTodos()
    const newTodo = {
      id: Date.now().toString(),
      title: req.body.title,
      completed: false,
      createdAt: new Date().toISOString()
    }
    todos.push(newTodo)
    await writeTodos(todos)
    res.json(newTodo)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' })
  }
})

// PUT update todo
router.put('/:id', async (req, res) => {
  try {
    const todos = await readTodos()
    const index = todos.findIndex((t: any) => t.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ error: 'Todo not found' })
    }
    todos[index] = { ...todos[index], ...req.body }
    await writeTodos(todos)
    res.json(todos[index])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' })
  }
})

// DELETE todo
router.delete('/:id', async (req, res) => {
  try {
    const todos = await readTodos()
    const filtered = todos.filter((t: any) => t.id !== req.params.id)
    await writeTodos(filtered)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' })
  }
})
```

### 5. Install Dependencies

```bash
cd services/todo && npm install && cd ../..
```

Expected output:
```
added 50 packages, and audited 51 packages in 2s
```

### 6. Update services-config.json

Add the todo service entry to `services-config.json`:

```json
{
  "services": [
    {
      "name": "todo",
      "port": 4001,
      "path": "/api/todos",
      "description": "Todo CRUD operations with JSON file storage"
    }
  ]
}
```

### 7. Regenerate vite.config.ts

Use `templates/vite.config.ts` - it will automatically include the new todo service in the proxy configuration.

With `VITE_BASE_PATH=/app-1234567890/`, the generated proxy will include:

```typescript
const proxyConfig = {
  '/app-1234567890/api/todos': {
    target: 'http://localhost:4001',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/app-1234567890\/api\/todos/, '')
  }
}
```

### 8. Generate API Client

Create `src/lib/api.ts` with todo methods:

```typescript
const BASE_URL = import.meta.env.VITE_BASE_PATH || ''

const API_PATHS = {
  todos: `${BASE_URL}/api/todos`
} as const

interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

export const api = {
  todos: {
    getAll: async (): Promise<Todo[]> => {
      const response = await fetch(API_PATHS.todos)
      if (!response.ok) throw new Error('Failed to fetch todos')
      return response.json()
    },
    
    create: async (title: string): Promise<Todo> => {
      const response = await fetch(API_PATHS.todos, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      if (!response.ok) throw new Error('Failed to create todo')
      return response.json()
    },
    
    update: async (id: string, updates: Partial<Pick<Todo, 'title' | 'completed'>>): Promise<Todo> => {
      const response = await fetch(`${API_PATHS.todos}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error('Failed to update todo')
      return response.json()
    },
    
    delete: async (id: string): Promise<{ success: boolean }> => {
      const response = await fetch(`${API_PATHS.todos}/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete todo')
      return response.json()
    }
  }
}
```

### 9. Update start-services.sh

The template `templates/start-services.sh` automatically reads from `services-config.json`, so it will include the todo service.

The startup script will execute:
```bash
TODO_PORT=4001 nohup tsx services/todo/server.ts > logs/todo.log 2>&1 &
```

### 10. Create Frontend Component

Create a React component that uses the todo API:

```tsx
import { useEffect, useState } from 'react'
import { api } from './lib/api'

interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [loading, setLoading] = useState(true)

  // Load todos on mount
  useEffect(() => {
    loadTodos()
  }, [])

  async function loadTodos() {
    try {
      setLoading(true)
      const data = await api.todos.getAll()
      setTodos(data)
    } catch (error) {
      console.error('Failed to load todos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newTodoTitle.trim()) return

    try {
      const newTodo = await api.todos.create(newTodoTitle)
      setTodos([...todos, newTodo])
      setNewTodoTitle('')
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  async function handleToggle(todo: Todo) {
    try {
      const updated = await api.todos.update(todo.id, {
        completed: !todo.completed
      })
      setTodos(todos.map(t => t.id === updated.id ? updated : t))
    } catch (error) {
      console.error('Failed to update todo:', error)
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.todos.delete(id)
      setTodos(todos.filter(t => t.id !== id))
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  if (loading) return <div>Loading todos...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Todos</h1>

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add
        </button>
      </form>

      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No todos yet</p>
        ) : (
          todos.map(todo => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo)}
                className="w-5 h-5"
              />
              <span className={todo.completed ? 'line-through text-gray-500 flex-1' : 'flex-1'}>
                {todo.title}
              </span>
              <button
                onClick={() => handleDelete(todo.id)}
                className="px-3 py-1 text-red-500 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

## Request Flow

With `VITE_BASE_PATH=/app-1234567890/`:

1. **Frontend code calls:**
   ```typescript
   api.todos.getAll()
   ```

2. **Fetch request:**
   ```
   GET /app-1234567890/api/todos
   ```

3. **Browser sends:**
   ```
   GET http://localhost/app-1234567890/api/todos
   ```

4. **Traefik routes to Vite (port 5173)**

5. **Vite proxy matches:** `/app-1234567890/api/todos`

6. **Vite rewrites to:** `/` and forwards to `http://localhost:4001`

7. **Todo service receives:**
   ```
   GET /
   ```

8. **Express router handles:**
   ```typescript
   router.get('/', async (req, res) => {
     const todos = await readTodos()
     res.json(todos)
   })
   ```

9. **Response flows back:** Todo service → Vite → Traefik → Browser

## Testing the Service

### Manual Testing

1. **Start services:**
   ```bash
   bash start-services.sh
   ```

2. **Test directly (bypassing proxy):**
   ```bash
   # Create a todo
   curl -X POST http://localhost:4001/ \
     -H "Content-Type: application/json" \
     -d '{"title":"Test todo"}'

   # Get all todos
   curl http://localhost:4001/

   # Update a todo
   curl -X PUT http://localhost:4001/1730000000000 \
     -H "Content-Type: application/json" \
     -d '{"completed":true}'

   # Delete a todo
   curl -X DELETE http://localhost:4001/1730000000000
   ```

3. **Test through Vite proxy:**
   ```bash
   # From your frontend
   curl http://localhost:5173/app-1234567890/api/todos
   ```

### Verify Files

Check the generated files:
```bash
# Service files
ls -la services/todo/
# Should show: package.json, server.ts, routes.ts, node_modules/

# Data file (created after first use)
cat data/todos.json

# Logs
tail -f logs/todo.log
tail -f logs/vite.log
```

## Summary

This example demonstrated:
- Creating an isolated Express service with its own dependencies
- Using JSON file storage for persistence
- Configuring unique environment variables (TODO_PORT)
- Setting up Vite proxy with base path
- Creating a type-safe API client
- Building a React component that uses the service
- Testing the complete request flow

The todo service is now fully integrated with the Vite application and accessible through the Kubernetes Ingress routing.
