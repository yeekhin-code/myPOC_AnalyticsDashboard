import express from 'express'
import cors from 'cors'
import { router } from './routes.js'

const app = express()
// Use service-specific environment variable (e.g., TODO_PORT, AUTH_PORT)
const PORT = process.env.{SERVICE_NAME_UPPER}_PORT || {default-port}

app.use(cors())
app.use(express.json())
app.use('/', router)

app.listen(PORT, () => {
  console.log(`{Service name} service running on port ${PORT}`)
})
