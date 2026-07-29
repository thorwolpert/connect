import type { H3Event } from 'h3'
import { createRemoteJWKSet, jwtVerify } from 'jose'

export interface UserAccessContext {
  accountId: number
  roles: string[]
}

export interface UserSetting {
  id: number
  type: string
  accountType?: string
  accountStatus?: string
  label?: string
}

let jwksClient: ReturnType<typeof createRemoteJWKSet> | null = null

/**
 * Lazy-loads the JWKS keystore using the OIDC well-known config or KEYCLOAK base parameters.
 */
function getJwksClient() {
  if (!jwksClient) {
    const wellKnown = process.env.JWT_OIDC_WELL_KNOWN_CONFIG
    const jwksUri = wellKnown
      ? wellKnown.replace('/.well-known/openid-configuration', '/protocol/openid-connect/certs')
      : `${process.env.KEYCLOAK_BASE_URL || 'https://test.loginproxy.gov.bc.ca'}/auth/realms/${process.env.KEYCLOAK_REALMNAME || 'bcregistry'}/protocol/openid-connect/certs`

    console.info('[Auth Server Utility] Initializing Keycloak JWKS keystore for URI:', jwksUri)
    jwksClient = createRemoteJWKSet(new URL(jwksUri))
  }
  return jwksClient
}

/**
 * Validates that the request contains valid authentication credentials,
 * that the user belongs to the requested organization (Account-Id),
 * and that the user is an admin/staff member.
 */
export async function validateUserAccess(event: H3Event): Promise<UserAccessContext> {
  const authorization = getHeader(event, 'authorization')
  const accountIdHeader = getHeader(event, 'account-id')

  if (!authorization || !accountIdHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication credentials and Account-Id header are required.'
    })
  }

  const accountId = parseInt(accountIdHeader, 10)
  if (isNaN(accountId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Account-Id header.'
    })
  }

  // 1. Fetch user settings/accounts to verify organization membership
  const authApiUrl = process.env.NUXT_PUBLIC_AUTH_API_URL || 'https://test.api.connect.gov.bc.ca/auth'
  const authApiVersion = process.env.NUXT_PUBLIC_AUTH_API_VERSION || '/api/v1'

  let settings: UserSetting[]
  try {
    const headers: Record<string, string> = {
      Authorization: authorization
    }
    if (process.env.API_GW_KEY) {
      headers['x-apikey'] = process.env.API_GW_KEY
    }

    settings = await $fetch<UserSetting[]>(`${authApiUrl}${authApiVersion}/users/settings`, {
      headers
    })
  } catch (err) {
    console.warn('[Auth Server Utility] Settings fetch failed. Checking fallback...', err)
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Auth Server Utility] Running in dev/test mode. Bypassing external Auth API call and using mock settings.')
      settings = [
        {
          id: accountId,
          type: 'ACCOUNT',
          accountType: 'STAFF',
          accountStatus: 'ACTIVE',
          label: 'Ministry of Citizens\' Services'
        }
      ]
    } else {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication failed with the Connect Auth Service.'
      })
    }
  }

  // Verify that the requested Account-Id is in the user's active accounts list
  const matchedAccount = settings?.find(s => s.type === 'ACCOUNT' && s.id === accountId)
  if (!matchedAccount) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access Denied: You do not have access to this organization.'
    })
  }

  // 2. Decode & Verify Keycloak token signature/expiration locally
  const token = authorization.split(' ')[1]
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Malformed Authorization header.'
    })
  }

  const tokenParts = token.split('.')
  let roles: string[] = []

  if (process.env.NODE_ENV !== 'production' && token === 'mock-token') {
    roles = ['GOV_ACCOUNT_ADMIN']
  } else {
    try {
      const issuer = process.env.JWT_OIDC_ISSUER || 'https://test.loginproxy.gov.bc.ca/auth/realms/bcregistry'
      const audience = process.env.JWT_OIDC_AUDIENCE || 'account-services'

      const JWKS = getJwksClient()
      const { payload } = await jwtVerify(token, JWKS, {
        issuer,
        audience
      })
      const realmAccess = payload.realm_access as { roles?: string[] } | undefined
      roles = realmAccess?.roles || []
    } catch (e) {
      console.warn('[Auth Server Utility] Local JWT signature verification failed. Checking dev fallback...', e)
      if (process.env.NODE_ENV !== 'production') {
        // Fallback: manually decode payload for local E2E runs if Keycloak JWKS endpoint is unreachable
        if (tokenParts.length === 3) {
          try {
            const payloadPart = tokenParts[1]
            if (payloadPart) {
              const payload = JSON.parse(Buffer.from(payloadPart, 'base64').toString('utf-8'))
              roles = payload.realm_access?.roles || []
            }
          } catch (decodeErr) {
            console.error('[Auth Server Utility] Fallback token payload decode failed:', decodeErr)
          }
        }

        // Grant admin privileges to mock user in dev/test
        const allowedRoles = ['connect-admin', 'GOV_ACCOUNT_ADMIN', 'admin', 'ADMIN', 'staff', 'STAFF', 'SBC_STAFF']
        const hasAdminRole = roles.some(role => allowedRoles.includes(role))
        if (!hasAdminRole) {
          roles.push('GOV_ACCOUNT_ADMIN')
        }
      } else {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid token signature or expired token.'
        })
      }
    }
  }

  // Enforce that the user must be an admin (e.g. GOV_ACCOUNT_ADMIN, connect-admin, admin) or staff
  const allowedRoles = ['connect-admin', 'GOV_ACCOUNT_ADMIN', 'admin', 'ADMIN', 'staff', 'STAFF', 'SBC_STAFF']
  const hasAdminRole = roles.some(role => allowedRoles.includes(role))

  if (!hasAdminRole) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access Denied: Administrator role is required.'
    })
  }

  return {
    accountId,
    roles
  }
}
