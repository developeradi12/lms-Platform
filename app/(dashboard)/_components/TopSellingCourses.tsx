type TopCourse = {
  _id: string
  totalSales: number
  revenue: number
  course: {
    title: string
  }
}

export function TopSellingCourses({
  data,
}: {
  data: TopCourse[]
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold">
          Top Selling Courses
        </h2>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {data?.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No sales data yet 📊
          </div>
        ) : (
          data.map((item, index) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
            >
              {/* Left */}
              <div className="flex items-center gap-3">
                
                {/* Rank Badge */}
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-sm font-semibold">
                  #{index + 1}
                </div>

                {/* Course Info */}
                <div>
                  <p className="font-medium text-sm">
                    {item.course?.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.totalSales} students
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">
                  ₹{item.revenue}
                </p>
                <p className="text-xs text-muted-foreground">
                  Revenue
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}