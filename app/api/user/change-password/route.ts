import { NextResponse } from "next/server"
import User from "@/models/User"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import connectDb from "@/lib/db"

//pending h abhi password change karne ka logic work nahi kar rha
export async function PUT(req: Request) {
  try {
    await connectDb()
    // console.log("---- CHANGE PASSWORD API HIT ----")
    const token = (await cookies()).get("refreshToken")?.value
    // console.log("refreshToken exists?", !!token)
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!)
    // console.log("decoded:", decoded)

    const body = await req.json()
    const { currentPassword, newPassword } = body
    // console.log("body received:", {
    //   currentPasswordLength: currentPassword?.length,
    //   newPasswordLength: newPassword?.length,
    // })

    const user = await User.findById(decoded.userId)
    // console.log("user found?", !!user)
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 })
    // console.log("user email:", user.email)
    // console.log("user role:", user.role)
    // console.log("old hash:", user.password)

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    // console.log("currentPassword match?", isMatch)
    if (!isMatch) {
      // console.log("❌ Current password incorrect")
      return NextResponse.json({ message: "Current password is wrong" }, { status: 400 })
    }
    // console.log("---- SETTING NEW PASSWORD (PLAIN) ----")
    // console.log("newPassword length:", newPassword?.length)
    // console.log(
    //   "newPassword preview:",
    //   `${newPassword?.slice(0, 1)}***${newPassword?.slice(-1)}`
    // )
    // const hashed = await bcrypt.hash(newPassword, 10)
    // console.log("new hash:", hashed)

    //just set plain password (hook will hash it)
    user.password = newPassword
    // console.log("before save (still plain in memory):", user.password)

    await user.save()

    // 🔥 Verify immediately after save
    // const updatedUser = await User.findById(decoded.userId).select("+password")
    // console.log("saved hash in DB:", updatedUser?.password)

    // 🔥 Test compare after save
    // const testCompare = await bcrypt.compare(newPassword, updatedUser!.password)
    // console.log("compare newPassword with saved hash?", testCompare)

    // console.log("✅ PASSWORD UPDATED SUCCESSFULLY")

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}