import connectDb from "@/lib/db"
import { Course } from "@/models/Course"
import { notFound } from "next/navigation"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Lock } from "lucide-react"
import { CourseSerialized } from "@/types/course"

interface Props {
  params: Promise<{
    courseId: string
  }>
}

export default async function CourseDetails({ params }: Props) {
  await connectDb()

  const resolvedParams = await params
  const slug = resolvedParams.courseId
  console.log("slug", slug);
  const courseDoc = await Course.findOne({ slug })
    .populate({
      path: "chapters",
      populate: {
        path: "lessons",
      },
    })
    .populate("category")
    .populate("instructor")
    .lean()

  if (!courseDoc) return notFound()
  // Convert to fully serializable object (once)
  const course: CourseSerialized = JSON.parse(JSON.stringify(courseDoc))

  if (!course) return notFound()

  const isFree = course.price === 0
  const instructorName =
    course.instructor?.name ||
    `${course.instructor?.firstName || ""} ${course.instructor?.lastName || ""
      }`.trim() ||
    "Instructor"

  return (
    <div className="max-w-7xl  mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {course.category?.name && (
                <Badge variant="outline" className="rounded-xl">
                  {course.category.name}
                </Badge>
              )}

              {isFree ? (
                <Badge className="rounded-xl">Free Course</Badge>
              ) : (
                <Badge variant="secondary" className="rounded-xl">
                  Paid Course
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">

            </h1>

            <p className="text-muted-foreground mt-3 text-sm sm:text-base">
              {course.description}
            </p>

            <p className="mt-4 text-sm text-muted-foreground">
              Created by <span className="font-medium">{instructorName}</span>
            </p>
          </div>

          {/* Chapters */}

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Course Content</CardTitle>
              <p className="text-sm text-muted-foreground">
                {course.chapters?.length || 0} chapters
              </p>
            </CardHeader>

            <CardContent>
              {course.chapters?.length === 0 ? (
                <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
                  No chapters added yet.
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {course.chapters.map((chapter, chapterIndex) => (
                    <AccordionItem
                      key={chapter._id}
                      value={chapter._id}
                      className="border-b"
                    >
                      <AccordionTrigger className="text-left">
                        <div className="flex w-full items-center justify-between gap-4">
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {chapterIndex + 1}. {chapter.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {chapter.lessons?.length || 0} lessons
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {chapter.description || ""} description
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {chapter.lessons?.length === 0 ? (
                            <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                              No lessons in this chapter.
                            </div>
                          ) : (
                            chapter.lessons.map((lesson, lessonIndex) => {
                              const canAccess = isFree // later: enrolled check

                              return (
                                <div
                                  key={lesson._id}
                                  className="flex items-center justify-between gap-4 rounded-xl border p-3"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="text-sm font-medium text-muted-foreground pt-0.5">
                                      {chapterIndex + 1}.{lessonIndex + 1}
                                    </div>

                                    <div>
                                      <p className="font-medium">{lesson.title}</p>

                                      <p className="text-xs text-muted-foreground">
                                        {lesson.duration
                                          ? `Duration: ${lesson.duration} min`
                                          : "Lesson"}
                                      </p>
                                    </div>
                                  </div>

                                  {canAccess ? (
                                    <Button size="sm" className="rounded-xl">
                                      Watch
                                    </Button>
                                  ) : (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Lock className="h-4 w-4" />
                                      Locked
                                    </div>
                                  )}
                                </div>
                              )
                            })
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right */}
        < div className="lg:col-span-1" >
          <div className="lg:sticky lg:top-24">
            <Card className="rounded-2xl overflow-hidden">
              <div className="relative w-full h-52 bg-muted">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold">
                    {isFree ? "Free" : `₹${course.price}`}
                  </p>
                </div>

                {isFree ? (
                  <Button className="w-full rounded-xl">
                    Start Learning
                  </Button>
                ) : (
                  <Button className="w-full rounded-xl">
                    Pay & Enroll
                  </Button>
                )}

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isFree
                    ? "This course is free. You can access all lessons."
                    : "This is a paid course. You need to enroll first to unlock lessons."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
