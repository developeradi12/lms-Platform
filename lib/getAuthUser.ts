import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import User from "@/models/User"
import connectDb from "@/lib/db"
import { verifyAccessToken } from "@/utils/jwt"

type AuthUser = {
  _id: string
  name: string
  email: string
  role: string
  avatar?: string
  bio?: string
  status: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export async function getAuthUser(): Promise<AuthUser> {
  await connectDb()

  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value

  if (!accessToken) redirect("/login")

  try {
    const payload = await verifyAccessToken(accessToken)

    const user = await User.findById(payload.userId)
      .select("-password -refreshToken")
      .lean<AuthUser>()

    if (!user) redirect("/login")

    return user
  } catch {
    redirect("/login")
  }
}