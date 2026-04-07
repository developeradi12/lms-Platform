import DashboardContent from "./_componets/DashboardContent"
import { cookies } from "next/headers"

export default async function DashboardPage() {

  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user/dashboard`,
    {
      cache: "no-store",
      headers: {
        cookie: cookieHeader,
      },
    }
  )


  if (!res.ok) {
    throw new Error("Failed to fetch dashboard data")
  }

  const data = await res.json()

  // console.log("data", data)
  return (
    <DashboardContent
      user={data.user}
      enrollments={data.enrollments}
      stats={data.stats}
      weeklyActivity={data.spendingChart}
      orders={data.orders}
    />
  )

}