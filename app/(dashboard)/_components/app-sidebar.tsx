"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  IconInnerShadowTop,
  IconBook,
  IconCategory,
  IconUsers,
  IconHeart,
  IconCreditCard,
  IconUserCircle,
  IconChartBar,
} from "@tabler/icons-react"

import { NavDocuments } from "./nav-documents"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  role: "admin" | "user"
}

const sidebarData = {
  admin: [
    {
      title: "Courses",
      url: "/admin/courses",
      icon: IconBook,
    },
    {
      title: "Category",
      url: "/admin/categories",
      icon: IconCategory,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
    },
  ],

  user: [
    {
      title: "Progress",
      url: "/dashboard",
      icon: IconChartBar,
    },
    {
      title: "Enrolled Courses",
      url: "/dashboard/courses",
      icon: IconBook,
    },
    {
      title: "Payments",
      url: "/dashboard/payments",
      icon: IconCreditCard,
    },
    {
      title: "Wishlist",
      url: "/dashboard/wishlist",
      icon: IconHeart,
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: IconUserCircle,
    },
  ],
}

export function AppSidebar({ role, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: sidebarData[role],
    documents: [],
    navSecondary: [],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href={role === "admin" ? "/admin" : "/dashboard"}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  LMS PLATFORM
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}