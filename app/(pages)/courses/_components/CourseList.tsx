import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface Props {
  courses: any[]
}

export default function CourseList({ courses }: Props) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course) => (
        <Link 
           key={course._id} 
           href={`/courses/${course.slug}`}>
          <Card
            key={course._id}
            className="rounded-2xl overflow-hidden hover:shadow-xl transition group"
          >
            {/* Course Image */}
            <div className="relative w-full h-48 overflow-hidden">
              <Image
                src={course?.thumbnail || "/placeholder.jpg"}
                alt={course.title}
                fill
                className="object-cover group-hover:scale-105 transition duration-300"
              />
            </div>

            <CardContent className="p-6 space-y-3">
              {/* Title */}
              <h3 className="font-semibold text-lg line-clamp-1">
                {course.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>

              {/* Price */}
              <p className="text-sm font-semibold">
                {course.price === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  <span>₹{course.price}</span>
                )}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
