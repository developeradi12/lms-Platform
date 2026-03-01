import { SignJWT, jwtVerify } from "jose"

const accessSecret = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET!
)

const refreshSecret = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET!
)

export type JWTPayload = {
  userId: string
  email?: string
  role: string
}

/**
 * 🔐 Sign Access Token
 */
export async function signAccessToken(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(accessSecret)
}

/**
 * 🔐 Sign Refresh Token
 */
export async function signRefreshToken(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(refreshSecret)
}

/**
 * 🔍 Verify Access Token
 */
export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, accessSecret)
  return payload as JWTPayload
}

/**
 * 🔍 Verify Refresh Token
 */
export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, refreshSecret)
  return payload as JWTPayload
}