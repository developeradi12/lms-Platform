"use client"

import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Search
} from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"

import { useRouter } from "next/navigation"
import api from "@/lib/api"

export type Role = "ADMIN" | "instructor" | "STUDENT"

interface SiteHeaderProps {
  role?: Role
  userName?: string
  notificationCount?: number
}

export function SiteHeader({
  role = "STUDENT",
  userName = "Guest",
  notificationCount = 0,
}: SiteHeaderProps) {

  const router = useRouter()

  const handleLogout = async () => {
    try {
      const res = await api.post("/api/auth/logout", { withCredentials: true })
      if (res.data?.success) {
        router.push("/login")
        router.refresh()
      }
    } catch (error) {
      console.log("Logout error:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 h-16 flex items-center border-b bg-card px-4 md:px-6">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <h1 className="hidden sm:block text-lg font-semibold">
          {role === "ADMIN"
            ? "Admin Panel"
            : role === "instructor"
            ? "Instructor Dashboard"
            : "Student Dashboard"}
        </h1>

        <Badge variant="outline" className="hidden sm:inline-flex text-xs capitalize">
          {role}
        </Badge>
      </div>

      {/* RIGHT */}
      <div className="ml-auto flex items-center gap-3">

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center text-[10px]">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>No new notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                {userName?.charAt(0).toUpperCase()}
              </div>

              <span className="hidden md:block text-sm font-medium">
                {userName}
              </span>

              <ChevronDown className="size-4 hidden md:block" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  )
}