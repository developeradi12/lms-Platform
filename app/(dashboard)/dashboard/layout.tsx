import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { SiteHeader } from "../_components/site-header"
import { AppSidebar } from "../_components/app-sidebar"
import { getAuthUser } from "@/lib/getAuthUser"
export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {

  const user = await getAuthUser()


  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        role={user?.role}
        userName={user?.name}
      />

      <SidebarInset>
        {/* Header always visible */}
        <SiteHeader
          role={user?.role}
          userName={user?.name}
          notificationCount={0}
        />

        {/*  Only  changes */}
        <div className="p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}