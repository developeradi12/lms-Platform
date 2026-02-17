import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function UserDashboard() {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track your learning progress and payments.
          </p>
        </div>

        <Badge className="w-fit rounded-xl px-3 py-1 text-sm">
          Student Dashboard
        </Badge>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-muted-foreground mt-1">
              Total active enrollments
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹0</p>
            <p className="text-sm text-muted-foreground mt-1">
              Total spent on courses
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0%</p>
            <p className="text-sm text-muted-foreground mt-1">
              Overall learning completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Extra section */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Quick Tip</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Continue where you left off by opening your enrolled courses.
            Your progress is saved automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}