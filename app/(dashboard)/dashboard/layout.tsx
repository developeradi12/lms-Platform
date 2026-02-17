import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { SiteHeader } from "../_components/site-header";
import { AppSidebar } from "../_components/app-sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar role="user" variant="inset" />
      <SidebarInset className="bg-gray-50 min-h-screen" >
       <SiteHeader role="student" />
        <main className="w-full">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>

      </SidebarInset>
    </SidebarProvider>
  );
}
