import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { SiteHeader } from "../_components/site-header";
import { AppSidebar } from "../_components/app-sidebar";
import { getAuthUser } from "@/lib/getAuthUser";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  type Role = "ADMIN" | "STUDENT"
  const user = await getAuthUser()
  console.log(user);
  const name = user?.name
  const userRole = (user?.role === "ADMIN" ? "ADMIN" : "STUDENT") as Role;
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar role={userRole} userName={name} />
      <SidebarInset >
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
