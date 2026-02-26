"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CircleUser, GraduationCap, LayoutDashboard, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

type User = {
  _id: string
  name: string
  email: string
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT"
}
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/about" },
  { label: "Contact-us", href: "/contact" }
]

export function PublicNav() {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get<User>("/api/auth/me")
        setUser(res.data)
      } catch {
        setUser(null)
      }
    }

    fetchUser()
  }, [])

  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const dashboardRoute = useMemo(() => {
    if (!user) return "/login"

    switch (user.role) {
      case "ADMIN":
        return "/admin/dashboard"
      case "INSTRUCTOR":
        return "/instructor/dashboard"
      default:
        return "/dashboard"
    }
  }, [user])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="size-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground font-[family-name:var(--font-heading)]">
            LearnHub
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-primary/10 transition"
              asChild
            >
              <Link href={dashboardRoute}>
                <CircleUser className="size-5 text-foreground" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/sign_up">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex size-10 items-center justify-center rounded-lg text-foreground md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 pb-6 md:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium transition-colors ${isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href={dashboardRoute}>
                  {user ? (
                    <LayoutDashboard className="size-5" />
                  ) : (
                    "Log in"
                  )}
                </Link>
              </Button>

              {!user && (
                <Button variant="outline" asChild>
                  <Link href="/sign_up">Sign up</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
