"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", }); router.push("/login"); router.refresh(); // clears cached data
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>

        <nav>
          <ul className="space-y-3">
            <li>
              <Link
                href="/dashboard"
                className="block rounded-lg px-3 py-2 hover:bg-gray-800 transition"
              >
                Progress
              </Link>
            </li>

            <li>
              <Link
                href="/dashboard/courses"
                className="block rounded-lg px-3 py-2 hover:bg-gray-800 transition"
              >
                Enrolled Courses
              </Link>
            </li>

            <li>
              <Link
                href="/dashboard/payments"
                className="block rounded-lg px-3 py-2 hover:bg-gray-800 transition"
              >
                Payments
              </Link>
            </li>

            <li>
              <Link
                href="/dashboard/wishlist"
                className="block rounded-lg px-3 py-2 hover:bg-gray-800 transition"
              >
                Wishlist
              </Link>
            </li>

            <li>
              <Link
                href="/dashboard/profile"
                className="block rounded-lg px-3 py-2 hover:bg-gray-800 transition"
              >
                Profile
              </Link>
            </li>

            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left rounded-lg px-3 py-2 hover:bg-gray-800 transition"
              >
                Logout
              </button>
            </li>

          </ul>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 bg-gray-100">
        {children}
      </main>
    </div>
  );
}
