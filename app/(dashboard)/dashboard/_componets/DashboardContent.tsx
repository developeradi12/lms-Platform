"use client"

import {
  Award,
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
import { Progress } from "@/components/ui/progress"

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

interface Props {
  user: any
  enrollments: any[]
  // weeklyActivity: { day: string; hours: number }[]
  // streak?: number
}

export default function DashboardContent({
  user,
  enrollments,
  // weeklyActivity,
  // streak = 0,
}: Props) {
  const streak = 7

  const weeklyActivity = [
    { day: "Mon", hours: 1 },
    { day: "Tue", hours: 2 },
    { day: "Wed", hours: 0 },
    { day: "Thu", hours: 3 },
    { day: "Fri", hours: 2 },
    { day: "Sat", hours: 4 },
    { day: "Sun", hours: 1 },
  ]
  const enrolledCourses = enrollments.length

  const completedCourses = enrollments.filter(
    (e) => e.progress === 100
  ).length

  const totalHours = Math.round(
    enrollments.reduce(
      (acc, e) => acc + (e.totalDuration || 0),
      0
    ) / 60
  )

  const overallProgress = enrolledCourses
    ? Math.round(
      enrollments.reduce(
        (acc, e) => acc + (e.progress || 0),
        0
      ) / enrolledCourses
    )
    : 0

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">

      {/* Welcome Section */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Welcome back, {user.name}
          </h2>
          <p className="text-muted-foreground">
            You're on a {streak}-day learning streak 🔥 Keep going!
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
          label="Day Streak"
          value={streak}
          subtext="Keep consistency!"
        />

      </div>

      {/* Charts + Achievements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Weekly Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              Weekly Activity
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis unit="h" />
                <Tooltip
                  formatter={(value: number) => [`${value}h`, "Study Time"]}
                />
                <Bar
                  dataKey="hours"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-5 text-accent" />
              Achievements
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">

            <AchievementItem
              icon={<Flame />}
              title="Hot Streak"
              subtitle={`${streak} days in a row`}
            />

            <AchievementItem
              icon={<CheckCircle />}
              title="Course Finisher"
              subtitle={`${completedCourses} courses completed`}
            />

            <AchievementItem
              icon={<TrendingUp />}
              title="Progress Master"
              subtitle={`${overallProgress}% average progress`}
            />

          </CardContent>
        </Card>

      </div>


    </div>
  )
}

/* --- Small Reusable Components --- */

function StatCard({ icon, label, value, subtext }: any) {
  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{label}</p>
          {icon}
        </div>
        <p className="text-3xl font-bold">{value}</p>
        {subtext && (
          <p className="text-xs text-muted-foreground">{subtext}</p>
        )}
      </CardContent>
    </Card>
  )
}

function AchievementItem({ icon, title, subtitle }: any) {
  return (
    <div className="flex items-center gap-3 bg-secondary p-3 rounded-lg">
      <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}