import { getAuthUser } from "@/lib/getAuthUser"
import { PublicNav } from "@/components/public-nav"
import { PublicFooter } from "@/components/public-footer"

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser().catch(() => null)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <PublicNav user={user} />

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  )
}