"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Library,
  Users,
  Heart,
  UserCircle,
  BarChart3,
  CreditCard,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AppSidebarProps {
  role?: "ADMIN" | "STUDENT"
  userName?: string
}

const navConfig = {
  ADMIN: [
    { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Manage Courses", href: "/admin/courses", icon: Library },
    { title: "Categories", href: "/admin/categories", icon: BookOpen },
    { title: "Users", href: "/admin/users", icon: Users },
  ],
  STUDENT: [
    { title: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { title: "My Learning", href: "/dashboard/my-learning", icon: BookOpen },
  ],
}

const accountNav = {
  ADMIN: [
    // { title: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
    // { title: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { title: "Profile", href: "/dashboard/profile", icon: UserCircle },
  ],
  STUDENT: [
    { title: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
    { title: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { title: "Profile", href: "/dashboard/profile", icon: UserCircle },
  ]
}

export function AppSidebar({
  role = "STUDENT",
  userName = "User",
}: AppSidebarProps) {

  const pathname = usePathname()
  const mainNav = navConfig[role] ?? navConfig.STUDENT
  const secNav = accountNav[role]??accountNav.STUDENT
  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/admin") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="
        transition-[width]
        duration-300
        ease-in-out
      "
    >

      {/* HEADER */}
      <SidebarHeader className="p-4">
        <Link
          href={role === "ADMIN" ? "/admin" : "/dashboard"}
          className="flex items-center gap-2"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <GraduationCap className="size-5 text-sidebar-primary-foreground transition-transform duration-200 group-data-[collapsible=icon]:scale-110" />
          </div>

          <span
            className="
              text-lg font-bold tracking-tight text-sidebar-foreground
              transition-all duration-200
              group-data-[collapsible=icon]:opacity-0
              group-data-[collapsible=icon]:w-0
              group-data-[collapsible=icon]:overflow-hidden
            "
          >
            LearnHub
          </span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>

        {/* MAIN NAV */}
        <SidebarGroup>
          <SidebarGroupLabel
            className="
              capitalize
              transition-all duration-200
              group-data-[collapsible=icon]:opacity-0
            "
          >
            {role.toLowerCase()} Menu
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                    className="transition-all duration-200"
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4 shrink-0" />
                      <span
                        className="
                          transition-all duration-200
                          group-data-[collapsible=icon]:opacity-0
                          group-data-[collapsible=icon]:w-0
                          group-data-[collapsible=icon]:overflow-hidden
                        "
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ACCOUNT NAV */}
        <SidebarGroup>
          <SidebarGroupLabel
            className="
              transition-all duration-200
              group-data-[collapsible=icon]:opacity-0
            "
          >
            Account
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {secNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.title}
                    className="transition-all duration-200"
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4 shrink-0" />
                      <span
                        className="
                          transition-all duration-200
                          group-data-[collapsible=icon]:opacity-0
                          group-data-[collapsible=icon]:w-0
                          group-data-[collapsible=icon]:overflow-hidden
                        "
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center transition-all duration-200">

          <Avatar className="size-8 shrink-0">
            <AvatarImage src="/images/avatar.jpg" />
            <AvatarFallback className="text-xs">
              {userName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div
            className="
              flex flex-col overflow-hidden
              transition-all duration-200
              group-data-[collapsible=icon]:opacity-0
              group-data-[collapsible=icon]:w-0
            "
          >
            <span className="text-sm font-medium truncate">
              {userName}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {role.toLowerCase()}
            </span>
          </div>

        </div>
      </SidebarFooter>

    </Sidebar>
  )
}