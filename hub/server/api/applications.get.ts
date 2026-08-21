import { eq, desc, and } from 'drizzle-orm'
import { useDb } from '../db'
import { applications } from '../db/schema'
import { validateUserAccess } from '../utils/auth'

export default defineEventHandler(async (event) => {
  // Validate authentication, organization membership, and administrator role
  const { accountId } = await validateUserAccess(event)

  const queryParams = getQuery(event)
  const shortName = queryParams.shortName as string

  try {
    const db = await useDb()
    if (shortName) {
      const result = await db.select()
        .from(applications)
        .where(and(
          eq(applications.shortName, shortName),
          eq(applications.accountId, accountId)
        ))
        .limit(1)

      if (result.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: `Application with short name "${shortName}" not found or access is denied.`
        })
      }
      return { success: true, data: result[0] }
    }

    // Only return applications belonging to the user's active organization account
    const result = await db.select()
      .from(applications)
      .where(eq(applications.accountId, accountId))
      .orderBy(desc(applications.createdAt))

    return { success: true, data: result }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error // Forward H3/route errors
    console.error('[API] Error fetching application registrations:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Internal Server Error while fetching applications.'
    })
  }
})
