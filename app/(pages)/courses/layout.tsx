import { PublicFooter } from "@/components/public-footer";
import { PublicNav } from "@/components/public-nav";
import connectDb from "@/lib/db";
import { getSession } from "@/utils/session";




export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await connectDb();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <PublicNav />

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  )
}