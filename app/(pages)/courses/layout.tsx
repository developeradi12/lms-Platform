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
  const session = await getSession();
  const role = session?.role || null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <PublicNav role={role} />

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  )
}