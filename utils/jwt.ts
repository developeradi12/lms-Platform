import { SignJWT } from "jose"

const getSecret = (key: string) => new TextEncoder().encode(key)

export async function signAccessToken(payload: any) {
  const secret = getSecret(process.env.ACCESS_TOKEN_SECRET!)

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret)
}

export async function signRefreshToken(payload: any) {
  const secret = getSecret(process.env.REFRESH_TOKEN_SECRET!)

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}