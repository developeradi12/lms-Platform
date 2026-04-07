type Enrollment = {
  _id: string
  user: {
    name: string
    email: string
  }
  course: {
    title: string
  }
  enrolledAt: string
}

export function RecentEnrollments({
  data,
}: {
  data: Enrollment[]
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold">
          Recent Enrollments
        </h2>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {data?.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No enrollments yet 🚀
          </div>
        ) : (
          data.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
            >
              {/* Left */}
              <div className="flex items-center gap-3">
                
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                  {item.user?.name?.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div>
                  <p className="font-medium text-sm">
                    {item.user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.course?.title}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">
                  Enrolled
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.enrolledAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}