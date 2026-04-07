"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CircleUser, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/AuthProvider"
import Image from "next/image"

const navLinks = [
  { label: "Home", href: "https://abbieeducation.world/" },
  { label: "About Us", href: "https://abbieeducation.world/about-us/" },
  { label: "IB", href: "https://abbieeducation.world/ib/" },
  { label: "Cambridge", href: "https://abbieeducation.world/cambridge/" },
  { label: "Career Counselling", href: "https://abbieeducation.world/career-counselling/" },
  { label: "School Consultants", href: "https://abbieeducation.world/school-consultants/" },
  { label: "Subjects", href: "https://abbieeducation.world/school-consultants/#" },
  { label: "Pathways And Vocational Courses", href: "https://abbieeducation.world/pathways-and-vocational-courses/" },
]

export function PublicNav() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const dashboardRoute = useMemo(() => {
    if (!user) return "/login"

    switch (user?.role) {
      case "ADMIN":
        return "/admin/dashboard"
      case "INSTRUCTOR":
        return "/instructor/dashboard"
      default:
        return "/dashboard"
    }
  }, [user?.role])

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b">
      <div className="mx-auto max-w-8xl flex items-center justify-between px-4 py-5">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="logo"
            width={160}
            height={50}
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-5">

          {user ? (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-blue-50"
              asChild
            >
              <Link href={dashboardRoute}>
                <CircleUser className="size-5 text-gray-700" />
              </Link>
            </Button>
          ) : (
            <>
              {/* Login */}
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Login
              </Link>

              {/* Signup */}
              {/* <Link
                href="/sign_up"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Sign up
              </Link> */}
            </>
          )}

          {/* Contact Button */}
          <Button
            className="rounded-full px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white"
            asChild
          >
            <Link href="/contact">Contact Us</Link>
          </Button>

        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-6 py-4 space-y-4">

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-gray-700 hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-4 border-t flex flex-col gap-3">

            {user ? (
              <Link
                href={dashboardRoute}
                className="text-sm font-medium"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login">Login</Link>
                <Link href="/sign_up">Sign up</Link>
              </>
            )}

            <Button
              className="rounded-full bg-blue-600 text-white"
              asChild
            >
              <Link href="/contact">Contact Us</Link>
            </Button>

          </div>
        </div>
      )}
    </header>
  )
}