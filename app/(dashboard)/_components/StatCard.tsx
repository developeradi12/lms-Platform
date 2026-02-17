import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function StatCard({ title, value }: any) {
  return (
    <Card className="rounded-2xl shadow">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  )
}
