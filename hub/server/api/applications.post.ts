import { eq } from 'drizzle-orm'
import { useDb } from '../db'
import { applications } from '../db/schema'
import { validateUserAccess } from '../utils/auth'

export default defineEventHandler(async (event) => {
  // Validate authentication, organization membership, and administrator role
  const { accountId } = await validateUserAccess(event)

  const body = await readBody(event)

  // Basic validation
  if (!body.shortName || !body.longName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Short Name and Long Name are required.'
    })
  }

  try {
    const db = await useDb()
    // 1. Verify if the application already exists and belongs to the same organization
    const existing = await db.select()
      .from(applications)
      .where(eq(applications.shortName, body.shortName))
      .limit(1)

    const existingApp = existing[0]
    if (existingApp && existingApp.accountId !== null && existingApp.accountId !== accountId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access Denied: This application registration belongs to another organization.'
      })
    }

    // 2. Perform insert or update on conflict using Drizzle ORM
    const result = await db.insert(applications)
      .values({
        accountId, // Link the application to the active organization account
        shortName: body.shortName,
        longName: body.longName,
        description: body.description || null,
        logoUrl: body.logoUrl || null,
        monetized: body.monetized ?? false,
        primarySku: body.primarySku || 'APP-SRV-STD',
        skuGrid: body.skuGrid || [],
        paymentMethods: body.paymentMethods || [],
        callbackUrl: body.callbackUrl || null,
        journalVoucher: body.journalVoucher || {},
        accessControlType: body.accessControlType || 'STANDARD',
        openfgaSchema: body.openfgaSchema || null,
        servicePath: body.servicePath || null,
        githubCodeowners: body.githubCodeowners || null,
        githubRepoUrl: body.githubRepoUrl || null,
        deploymentTargets: body.deploymentTargets || [],
        gcpProjectId: body.gcpProjectId || null,
        platformServices: body.platformServices || []
      })
      .onConflictDoUpdate({
        target: applications.shortName,
        set: {
          accountId,
          longName: body.longName,
          description: body.description || null,
          logoUrl: body.logoUrl || null,
          monetized: body.monetized ?? false,
          primarySku: body.primarySku || 'APP-SRV-STD',
          skuGrid: body.skuGrid || [],
          paymentMethods: body.paymentMethods || [],
          callbackUrl: body.callbackUrl || null,
          journalVoucher: body.journalVoucher || {},
          accessControlType: body.accessControlType || 'STANDARD',
          openfgaSchema: body.openfgaSchema || null,
          servicePath: body.servicePath || null,
          githubCodeowners: body.githubCodeowners || null,
          githubRepoUrl: body.githubRepoUrl || null,
          deploymentTargets: body.deploymentTargets || [],
          gcpProjectId: body.gcpProjectId || null,
          platformServices: body.platformServices || [],
          updatedAt: new Date()
        }
      })
      .returning()

    return {
      success: true,
      data: result[0]
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error // Forward H3 errors
    console.error('[API] Error saving application registration:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Internal Server Error while registering application.'
    })
  }
})
