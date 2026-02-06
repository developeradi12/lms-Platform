import { AppSidebar } from "./_components/app-sidebar"
import { SiteHeader } from "./_components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-gray-50" >
        <SiteHeader />
        <div className="p-6">
          {children}
        </div>

      </SidebarInset>
    </SidebarProvider>
  );
}
