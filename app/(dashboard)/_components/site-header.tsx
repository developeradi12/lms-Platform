"use client"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, ShieldCheck, User, GraduationCap } from "lucide-react"
import { useEffect, useState } from "react"

type Role = "ADMIN" | "instructor" | "STUDENT"

type StoredUser = {
  name: string
  email: string
  role: Role
}

export function SiteHeader() {
  const [user, setUser] = useState<StoredUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("localstorage all:", localStorage)
    const saved = localStorage.getItem("skill_user")
    console.log(localStorage.getItem("skill_user"));
    console.log("saved user in header", saved);
    if (!saved) return

    try {
      setUser(JSON.parse(saved))
    } catch {
      localStorage.removeItem("skill_user")
    }
    setLoading(false)
  }, [])

  console.log("user in header", user);

  const roleConfig: Record<Role, any> = {
    ADMIN: {
      title: "Admin Panel",
      icon: <ShieldCheck className="h-4 w-4" />,
      badge: "ADMIN",
      badgeClass: "bg-red-600 text-white",
    },
    instructor: {
      title: "Instructor Dashboard",
      icon: <User className="h-4 w-4" />,
      badge: "INSTRUCTOR",
      badgeClass: "bg-blue-600 text-white",
    },
    STUDENT: {
      title: "Student Dashboard",
      icon: <GraduationCap className="h-4 w-4" />,
      badge: "STUDENT",
      badgeClass: "bg-green-600 text-white",
    },
  }
  const current = !loading && user?.role ? roleConfig[user.role] : null
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/60 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1" />

        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-5"
        />

        {/* Left Title */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {current?.icon}
            <h1 className="text-base font-semibold tracking-tight">
              {current?.title||""}
            </h1>
          </div>

          <Badge className={`rounded-xl px-2 py-0.5 text-xs ${current?.badgeClass}`}>
            {current?.badge}
          </Badge>
        </div>

        {/* Right Side */}
        <div className="ml-auto flex items-center gap-2">
          <p className="hidden md:block text-sm text-muted-foreground">
            Welcome, 
          </p>
          <span className="font-medium text-foreground">
            {user?.name || "User"}
          </span>

          <Button variant="ghost" size="icon" className="rounded-xl">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}