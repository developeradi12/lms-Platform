import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { verifyAccessToken } from "./jwt"

export type AdminPayload = {
  userId: string
  email?: string
  role: string
}

export async function requireAdmin(): Promise<
  { payload: AdminPayload; error: null } |
  { payload: null; error: NextResponse }
> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return {
        payload: null,
        error: NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        ),
      }
    }

    const payload = await verifyAccessToken(accessToken)

    if (payload.role !== "admin") {
      return {
        payload: null,
        error: NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 }
        ),
      }
    }

    return { payload, error: null }
  } catch {
    return {
      payload: null,
      error: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    }
  }
}