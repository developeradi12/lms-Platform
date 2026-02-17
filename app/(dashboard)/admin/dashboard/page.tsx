"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { SectionCards } from "../../_components/section-cards"
import { RecentEnrollments } from "../../_components/RecentEnrollments"
import { TopSellingCourses } from "../../_components/TopSellingCourses"
import { RevenueChart } from "../../_components/revenueChart"

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/admin/dashboard")
        console.log("dahsboard data",res.data)
        setData(res.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-6">Loading...</div>

  if (!data) return <div className="p-6">No Data</div>

  return (
    <div className="space-y-8 p-6">

      <SectionCards stats={data.stats} />

      <RevenueChart data={data.revenueChart} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* <RecentEnrollments data={data.recentEnrollments} /> */}
        {/* <TopSellingCourses data={data.topSellingCourses} /> */}
      </div>

    </div>
  )
}
