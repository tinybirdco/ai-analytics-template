import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import * as jose from 'jose'

console.log('MIDDLEWARE FILE LOADED!!!')

export default clerkMiddleware(async (auth) => {
  debugger;
  console.log('🔥🔥🔥 MIDDLEWARE EXECUTING 🔥🔥🔥')
  const authentication = await auth()
  const { userId, sessionId, sessionClaims, orgId, orgRole, orgPermissions } = authentication
  console.log('Auth details:', { userId, sessionId, sessionClaims, orgId, orgRole, orgPermissions })

  // If user is not authenticated, continue without modification
  if (!userId || !sessionId) {
    console.log('No user or session found')
    return NextResponse.next()
  }

  try {
    // const sessionToken = await authentication.getToken({
    //   template: "tinybird-logs-explorer"  // This is key for getting org data
    // })
    const orgName = orgPermissions?.[0]?.split(':').pop()

    // Create Tinybird JWT
    const secret = new TextEncoder().encode(process.env.TINYBIRD_JWT_SECRET)
    const token = await new jose.SignJWT({
      workspace_id: process.env.TINYBIRD_WORKSPACE_ID,
      name: `frontend_jwt_user_${userId}`,
      exp: Math.floor(Date.now() / 1000) + (60 * 15), // 15 minute expiration
      iat: Math.floor(Date.now() / 1000),
      scopes: [
        {
          type: "PIPES:READ",
          resource: "generic_counter",
          fixed_params: { organization: orgName }
        },
        {
          type: "PIPES:READ",
          resource: "llm_messages",
          fixed_params: { organization: orgName }
        },
        {
          type: "PIPES:READ",
          resource: "llm_usage",
          fixed_params: { organization: orgName }
        }
      ], 
      limits: {
        rps: 10
      }
    })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secret)
    debugger;
    console.log('Generated token:', token)

    // Clone the response and add token
    const response = NextResponse.next()
    response.headers.set('x-tinybird-token', token)
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
} 