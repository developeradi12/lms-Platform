"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

type UserType = {
  name: string
  email: string
  role: "ADMIN" | "instructor" | "STUDENT"
}

export const Navbar = () => {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)

  // get initials from full name
  const getInitials = (name?: string) => {
    if (!name) return "U"
    const parts = name.trim().split(" ").filter(Boolean)
    const first = parts[0]?.[0] || ""
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : ""
    return (first + last).toUpperCase()
  }

  const goToDashboard = () => {
    if (!user) return

    if (user.role === "ADMIN") return router.push("/admin/dashboard")
    if (user.role === "instructor") return router.push("/instructor")
    return router.push("/dashboard") // student
  }

  const fetchMe = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/auth/me", { withCredentials: true, })

      console.log("ME API OK:", res.data)
      const me = res.data?.user || null
      setUser(me)

      //store in localStorage
      if (me) {
        localStorage.setItem("skill_user", JSON.stringify(me))
        console.log("saved to localstorage:", me)
      } else localStorage.removeItem("skill_user")
    } catch (err) {
      console.log("ME API ERROR:", err)
      setUser(null)
      localStorage.removeItem("skill_user")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem("skill_user")
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        localStorage.removeItem("skill_user")
      }
    }
    fetchMe()
  }, [])

  const initials = getInitials(user?.name)

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
            {user.name}
          </span>
        </button>
      )}
    </nav>
  )
}
