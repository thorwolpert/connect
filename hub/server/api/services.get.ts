import { asc } from 'drizzle-orm'
import { useDb } from '../db'
import { applications } from '../db/schema'

export default defineEventHandler(async () => {
  try {
    const db = await useDb()
    const dbServices = await db.select()
      .from(applications)
      .orderBy(asc(applications.category), asc(applications.longName))

    return {
      success: true,
      data: dbServices || []
    }
  } catch (error) {
    console.error('[API] Could not fetch services from database:', error)
    return {
      success: false,
      data: [],
      error: 'Failed to fetch services from database'
    }
  }
})
