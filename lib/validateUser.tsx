import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { redirect } from "next/navigation"

const ACCESS_SECRET = process.env.JWT_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export async function validateUser() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value
  const refreshToken = cookieStore.get("refreshToken")?.value

  if (!refreshToken) redirect("/login")

  try {
    if (accessToken) {
      const decoded = jwt.verify(accessToken, ACCESS_SECRET)
      return decoded
    }
  } catch (err: any) {
    if (err.name !== "TokenExpiredError") {
      redirect("/login")
    }
  }

  // Access expired → verify refresh
  try {
    const decoded: any = jwt.verify(refreshToken, REFRESH_SECRET)

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    )

    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    })

    return decoded
  } catch {
    redirect("/login")
  }
}
