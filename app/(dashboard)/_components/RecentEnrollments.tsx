export function RecentEnrollments
  ({ data }: { data: any[] }) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow">
      <h2 className="text-lg font-semibold mb-4">Recent Enrollments</h2>
      <div className="space-y-4">
        {data?.length === 0 ? (
          <p className="text-muted-foreground">No enrollments found</p>
        ) : (
          data.map((item, index) => (
            <div key={index}
              className="flex justify-between">
              <div>
                <p className="font-medium">
                  {item.studentName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.courseTitle}
                </p>
              </div>
              <p className="font-semibold">
                ₹{item.amount}
              </p>
            </div>
          )))}
      </div>
    </div>
  )
}