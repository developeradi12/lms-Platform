"use client"

import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type UserType = {
  firstName: string
  lastName: string
  role: "ADMIN" | "instructor" | "STUDENT"
}

export const Navbar = () => {

  const goToDashboard = () => {
    if (!user) return
   
    if (user.role === "ADMIN") return router.push("/admin/dashboard")
    if (user.role === "instructor") return router.push("/instructor")
    return router.push("/dashboard") // student
  }

  const router = useRouter()

  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = async () => {
    try {
      setLoading(true)
      const res = await axios.get("/api/auth/refresh-token", { withCredentials: true, })
      console.log("res", res);
      setUser(res.data?.user || null)
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMe()
  }, [])

  const initials =
    (user?.firstName?.[0] || "").toUpperCase() +
    (user?.lastName?.[0] || "").toUpperCase()

  return (
    <nav className="mt-6 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
        <h1 className="text-base font-bold md:text-xl">Skill Platform</h1>
      </div>

      {/* Right Side */}
      {!loading && !user && (
        <Link
          href="/login"
          className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-200"
        >
          Login
        </Link>
      )}

      {!loading && user && (
        <button
          onClick={goToDashboard}
          className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 transition hover:bg-white/15"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
            {initials}
          </div>

          <span className="hidden sm:block text-sm font-medium text-white">
            {user.firstName}
          </span>
        </button>
      )}
    </nav>
  )
}
