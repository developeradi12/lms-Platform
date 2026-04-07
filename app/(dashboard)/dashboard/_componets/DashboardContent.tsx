"use client"

import {
  BookOpen,
  CheckCircle,
  Clock,
  Flame,
  TrendingUp,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import Link from "next/link"
import { UserSerialize } from "@/types/user"
import { Enrollments } from "@/types/enrollment"

/* ---------- TYPES ---------- */

interface Order {
  _id: string
  amount: number
  createdAt: string
  course: {
    title: string
  }
}

interface Props {
  user: UserSerialize
  enrollments: Enrollments[]
  stats: {
    enrolledCourses: number
    completedCourses: number
    totalHours: number
    totalSpent: number
  }
  weeklyActivity: {
    month: string
    amount: number
  }[]
  orders: Order[]
}

/* ---------- COMPONENT ---------- */

export default function DashboardContent({
  user,
  stats,
  weeklyActivity,
  orders,
}: Props) {

  const {
    enrolledCourses = 0,
    completedCourses = 0,
    totalHours = 0,
    totalSpent = 0,
  } = stats || {}

  const topOrders = orders?.slice(0, 2)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">

      {/* Welcome */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Welcome back, {user?.name || "User"}
          </h2>
          <p className="text-muted-foreground">
            Keep learning and growing 🚀
          </p>
        </div>

        <Link href="/courses">
          <Button>Browse Courses</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          icon={<BookOpen className="size-5" />}
          label="Enrolled Courses"
          value={enrolledCourses}
        />

        <StatCard
          icon={<CheckCircle className="size-5" />}
          label="Completed"
          value={completedCourses}
        />

        <StatCard
          icon={<Clock className="size-5" />}
          label="Hours Studied"
          value={`${totalHours}h`}
        />

        <StatCard
          icon={<Flame className="size-5" />}
          label="Total Spent"
          value={formatCurrency(totalSpent)}
        />

      </div>

      {/* Chart + Orders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              Monthly Spending
            </CardTitle>
          </CardHeader>

          <CardContent>
            {weeklyActivity?.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                No spending data yet 📊
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Spent",
                    ]}
                  />
                  <Bar
                    dataKey="amount"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {topOrders?.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No orders yet
              </p>
            ) : (
              topOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex justify-between items-center border-b pb-2 last:border-none"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {order.course?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="font-semibold text-green-600">
                    {formatCurrency(order.amount)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  )
}

/* ---------- STAT CARD ---------- */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <Card className="hover:shadow-md transition">
      <CardContent className="p-6 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{label}</p>
          {icon}
        </div>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

/* ---------- UTIL ---------- */

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}