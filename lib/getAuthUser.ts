import { redirect } from "next/navigation"

import User from "@/models/User"
import connectDb from "@/lib/db"
import { getSession } from "@/utils/session"
import { userSerialized } from "./serializers"

export async function getAuthUser() {
  await connectDb()

  const session = await getSession()

  if (!session) redirect("/login")

  const user = await User.findById(session?.userId)
    .select("-password -refreshToken")
    .lean()

  const serializedData = userSerialized(user)

  return serializedData;
}