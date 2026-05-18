// Auto-generated API client based on services-config.json
// This is a template - customize based on the services you generate

const BASE_URL = import.meta.env.VITE_BASE_PATH || ''

const API_PATHS = {
  database: `${BASE_URL}/api/database`,
  auth: `${BASE_URL}/api/auth`,
  files: `${BASE_URL}/api/files`
} as const

const normalizePath = (path: string) => {
  // Replace 2+ slashes with single slash
  let normalized = path.replace(/\/{2,}/g, '/');
  // Ensure it starts with /
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  console.log('[normalizePath]', path, '->', normalized);
  return normalized;
};

export const api = {
  // Database service - generic CRUD operations
  database: {
    getAll: async (resource: string) => {
      const normalizedPath = normalizePath(`${API_PATHS.database}/${resource}`);
      const response = await fetch(normalizedPath);
      if (!response.ok) throw new Error(`Failed to fetch ${resource}`)
      return response.json()
    },
    
    getById: async (resource: string, id: string) => {
      const normalizedPath = normalizePath(`${API_PATHS.database}/${resource}/${id}`);
      const response = await fetch(normalizedPath);
      if (!response.ok) throw new Error(`Failed to fetch ${resource}/${id}`)
      return response.json()
    },
    
    create: async (resource: string, data: any) => {
      const normalizedPath = normalizePath(`${API_PATHS.database}/${resource}`);
      const response = await fetch(normalizedPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error(`Failed to create ${resource}`)
      return response.json()
    },
    
    update: async (resource: string, id: string, data: any) => {
      const normalizedPath = normalizePath(`${API_PATHS.database}/${resource}/${id}`);
      const response = await fetch(normalizedPath, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error(`Failed to update ${resource}/${id}`)
      return response.json()
    },
    
    delete: async (resource: string, id: string) => {
      const normalizedPath = normalizePath(`${API_PATHS.database}/${resource}/${id}`);
      const response = await fetch(normalizedPath, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error(`Failed to delete ${resource}/${id}`)
      return response.json()
    }
  },
  
  // Authentication service
  auth: {
    login: async (credentials: { username: string; password: string }) => {
      const normalizedPath = normalizePath(`${API_PATHS.auth}/login`);
      const response = await fetch(normalizedPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      if (!response.ok) throw new Error('Login failed')
      return response.json()
    },
    
    logout: async () => {
      const normalizedPath = normalizePath(`${API_PATHS.auth}/logout`);
      const response = await fetch(normalizedPath, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Logout failed')
      return response.json()
    },
    
    register: async (userData: { username: string; email: string; password: string }) => {
      const normalizedPath = normalizePath(`${API_PATHS.auth}/register`);
      const response = await fetch(normalizedPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      if (!response.ok) throw new Error('Registration failed')
      return response.json()
    },
    
    getCurrentUser: async () => {
      const normalizedPath = normalizePath(`${API_PATHS.auth}/me`);
      const response = await fetch(normalizedPath);
      if (!response.ok) throw new Error('Failed to get current user')
      return response.json()
    }
  },
  
  // File service
  files: {
    upload: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const normalizedPath = normalizePath(`${API_PATHS.files}/upload`);
      const response = await fetch(normalizedPath, {
        method: 'POST',
        body: formData
      })
      if (!response.ok) throw new Error('File upload failed')
      return response.json()
    },
    
    list: async () => {
      const normalizedPath = normalizePath(`${API_PATHS.files}`);
      const response = await fetch(normalizedPath);
      if (!response.ok) throw new Error('Failed to list files')
      return response.json()
    },
    
    download: async (fileId: string) => {
      const normalizedPath = normalizePath(`${API_PATHS.files}/${fileId}`);
      const response = await fetch(normalizedPath);
      if (!response.ok) throw new Error('File download failed')
      return response.blob()
    },
    
    delete: async (fileId: string) => {
      const normalizedPath = normalizePath(`${API_PATHS.files}/${fileId}`);
      const response = await fetch(normalizedPath, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete file')
      return response.json()
    }
  }
}
