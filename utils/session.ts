
import { cookies } from "next/headers";
import { verifyAccessToken, verifyRefreshToken, signAccessToken } from "./jwt";

export async function getSession() {

  const cookieStore = await cookies();

  const access = cookieStore.get("accessToken")?.value;
  const refresh = cookieStore.get("refreshToken")?.value;

  if (!refresh) return null;

  try {
    // Try normal access
    const payload = await verifyAccessToken(access!);
    return {
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
    }
  } catch {

    try {
      // Access expired → try refresh
      const refreshPayload = await verifyRefreshToken(refresh);

      const newAccess = await signAccessToken({
        userId: refreshPayload.userId,
        email: refreshPayload.email,
        role: refreshPayload.role
      });

      cookieStore.set("accessToken", newAccess, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 15
      });

      return {
        userId: refreshPayload.userId,
        role: refreshPayload.role,
        email: refreshPayload.email,
      }

    } catch {
      // Refresh also expired
      return null;
    }
  }
}