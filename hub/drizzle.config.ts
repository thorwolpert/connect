import { defineConfig } from 'drizzle-kit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const targetEnv = process.env.ENV || (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV ? process.env.NODE_ENV : '')

const envFileNames = [
  targetEnv ? `.env.${targetEnv}` : null,
  '.env'
].filter(Boolean) as string[]

const loadedKeys = new Set<string>()

function loadEnvFile(fileName: string) {
  const possiblePaths = [
    path.resolve(__dirname, fileName),
    path.resolve(process.cwd(), fileName),
    path.resolve(process.cwd(), 'hub', fileName)
  ]

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8')
      envConfig.split('\n').forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
        if (match) {
          const key = match[1]
          let value = match[2] || ''
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
          }
          if (!loadedKeys.has(key)) {
            process.env[key] = value.trim()
            loadedKeys.add(key)
          }
        }
      })
      console.log(`[drizzle.config.ts] 🎯 Loaded environment file: ${envPath}`)
      return true
    }
  }
  return false
}

envFileNames.forEach(loadEnvFile)

console.log(`[drizzle.config.ts] 🔌 Connecting to DB host=${process.env.DB_HOST || 'localhost'} port=${process.env.DB_PORT || '5432'} db=${process.env.DB_DATABASE || 'postgres'} user=${process.env.DB_USER || 'postgres'}`)
console.log(`[drizzle.config.ts] 📄 Schema path: ${path.resolve(__dirname, 'server/db/schema.ts')}`)

export default defineConfig({
  schema: path.resolve(__dirname, 'server/db/schema.ts'),
  out: path.resolve(__dirname, 'server/db/migrations'),
  dialect: 'postgresql',
  schemaFilter: ['public', 'hub'],
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'postgres',
    ssl: process.env.DB_SSL === 'true'
  }
})


