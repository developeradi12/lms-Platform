import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Clock, BookOpen } from "lucide-react"

interface Props {
  courses: any[]
}

export default function CourseList({ courses }: Props) {
  return (
    <>
      {courses.map((course) => {
        const instructorName =
          course.instructor?.name ||
          `${course.instructor?.firstName || ""} ${course.instructor?.lastName || ""}`.trim()

        return (
          <Link key={course._id} href={`/courses/${course.slug}`}>
            <Card className="group overflow-hidden p-0 rounded-2xl border hover:shadow-xl transition-all h-full flex flex-col">

              {/* Image */}
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={course.thumbnail || "/placeholder.jpg"}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Level Badge */}
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                  {course.level}
                </Badge>

                {course.price === 0 && (
                  <Badge className="absolute top-3 right-3 bg-green-600 text-white">
                    Free
                  </Badge>
                )}
              </div>

              <CardContent className="p-5 flex flex-col gap-3 flex-1">

                {/* Categories */}
                <div className="flex flex-wrap gap-1">
                  {course.categories?.slice(0, 2).map((cat: any) => (
                    <span
                      key={cat._id}
                      className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>

                {/* Instructor */}
                <p className="text-sm text-muted-foreground">
                  By <span className="font-medium text-foreground">{instructorName}</span>
                </p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-auto pt-3 border-t">

                  <span className="flex items-center gap-1">
                    <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                    {course.averageRating?.toFixed(1) || "0.0"}
                    ({course.totalReviews})
                  </span>

                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" />
                    {course.totalEnrollments}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {course.duration} min
                  </span>

                  <span className="flex items-center gap-1">
                    <BookOpen className="size-3.5" />
                    {course.totalLessons} lessons
                  </span>
                </div>

                {/* Price */}
                <div className="pt-3">
                  {course.price === 0 ? (
                    <span className="text-green-600 font-semibold">
                      Free
                    </span>
                  ) : (
                    <span className="font-semibold text-lg">
                      ₹{course.price}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {course.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {course.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

              </CardContent>
            </Card>
          </Link>
        )
      })}
    </>
  )
}