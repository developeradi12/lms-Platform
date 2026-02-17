"use client"

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type DashboardStats = {
  totalCourses: number
  totalStudents: number
  totalCategories: number
  totalRevenue: number
  courseGrowth: number
  studentGrowth: number
  incomeGrowth: number
  categoryGrowth: number
}

export function SectionCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      {/* Total Revenue */}
      <Card>
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold">
            ₹{stats.totalRevenue}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.incomeGrowth >= 0 ? (
                <IconTrendingUp className="size-4 mr-1" />
              ) : (
                <IconTrendingDown className="size-4 mr-1" />
              )}
              {stats.incomeGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>

      {/* Total Students */}
      <Card>
        <CardHeader>
          <CardDescription>Total Students</CardDescription>
          <CardTitle className="text-2xl font-semibold">
            {stats.totalStudents}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Total Courses */}
      <Card>
        <CardHeader>
          <CardDescription>Total Courses</CardDescription>
          <CardTitle className="text-2xl font-semibold">
            {stats.totalCourses}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardDescription>Total Categories</CardDescription>
          <CardTitle className="text-2xl font-semibold">
            {stats.totalCategories}
          </CardTitle>
        </CardHeader>
      </Card>

    </div>
  )
}
