export function TopSellingCourses({ data }: { data: any[] }) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow">
      <h2 className="text-lg font-semibold mb-4">Top Selling Courses</h2>

      <div className="space-y-4">
        {data.map((course, index) => (
          <div key={index} className="flex justify-between">
            <p className="font-medium">{course._id}</p>
            <div className="text-right">
              <p>{course.enrollments} students</p>
              <p className="text-sm text-muted-foreground">
                ₹{course.revenue}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
