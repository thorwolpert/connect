import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Connector } from '@google-cloud/cloud-sql-connector'
import pg from 'pg'
import path from 'path'
import fs from 'fs'
import * as schema from './schema'

const { Pool } = pg

let pool: pg.Pool | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let drizzleDb: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let initPromise: Promise<{ pool: pg.Pool, db: any }> | null = null

/**
 * Initializes the database connection pool and Drizzle ORM instance lazily.
 */
export async function initDb() {
  if (pool && drizzleDb) return { pool, db: drizzleDb }
  if (initPromise) return initPromise

  initPromise = (async () => {
    // In production (Cloud Run), use the IAM Cloud SQL Connector
    if (process.env.INSTANCE_CONNECTION_NAME) {
      console.info('[DB] Initializing Cloud SQL Connector for IAM Database Authentication...')
      const connector = new Connector()
      const clientOpts = await connector.getOptions({
        instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
        // @ts-expect-error: Cloud SQL Connector expects internal IpAddressTypes enum rather than PUBLIC string
        ipType: 'PUBLIC',
        // @ts-expect-error: Cloud SQL Connector expects internal AuthTypes enum rather than IAM string
        authType: 'IAM'
      })

      pool = new Pool({
        ...clientOpts,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE || 'postgres',
        max: 10,
        idleTimeoutMillis: 30000
      })
    } else {
      // In local development, connect via standard TCP pool
      console.info('[DB] Initializing local database TCP pool...')
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_DATABASE || 'postgres',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
      }
      pool = new Pool(dbConfig)
    }

    drizzleDb = drizzle(pool, { schema })
    return { pool, db: drizzleDb }
  })()

  return initPromise
}

/**
 * Returns the active Drizzle database client, initializing the connection pool if not already active.
 */
export async function useDb() {
  const { db } = await initDb()
  return db
}

/**
 * Exported Drizzle instance. Uses a JS Proxy to forward calls lazily.
 * This satisfies synchronous exports without requiring top-level await compile-time features.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = new Proxy({} as any, {
  get(target, prop) {
    if (!drizzleDb) {
      throw new Error('[DB] Database has not been initialized yet. Ensure initDb() is called during startup.')
    }
    const val = drizzleDb[prop]
    if (typeof val === 'function') {
      return val.bind(drizzleDb)
    }
    return val
  }
})

/**
 * Returns the raw database connection pool.
 */
export async function getDbPool() {
  const initialized = await initDb()
  return initialized.pool
}

/**
 * Runs Drizzle Kit migrations on application startup.
 */
export async function initDbSchema() {
  try {
    console.info('[DB] Checking and running database migrations...')

    // Ensure connection pool and Drizzle client are initialized
    const { db: activeDb } = await initDb()

    // Dynamically resolve migrations folder path depending on directory layout (local vs container)
    let migrationsFolder = path.resolve(process.cwd(), './hub/server/db/migrations')
    if (!fs.existsSync(migrationsFolder)) {
      migrationsFolder = path.resolve(process.cwd(), './server/db/migrations')
    }

    console.info('[DB] Resolving migrations from path:', migrationsFolder)
    await migrate(activeDb, { migrationsFolder })
    console.info('[DB] Database schema and tables initialized/updated successfully via Drizzle migrations.')
  } catch (error) {
    console.error('[DB] Failed to run database migrations:', error)
    throw error
  }
}
