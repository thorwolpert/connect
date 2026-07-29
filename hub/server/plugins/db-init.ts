import { initDbSchema } from '../db'

export default defineNitroPlugin(async () => {
  // Skip database initialization during the prerendering build phase
  if (import.meta.prerender) {
    console.info('[DB Plugin] Prerendering build phase detected. Skipping database migration.')
    return
  }

  console.log('[DB Plugin] Initializing database connection and schemas via Drizzle ORM...')
  try {
    await initDbSchema()
  } catch (error) {
    console.error('[DB Plugin] Database initialization failed on startup:', error)
  }
})
