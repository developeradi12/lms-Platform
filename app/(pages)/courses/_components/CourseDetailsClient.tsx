"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Lock, PlayCircle } from "lucide-react"
import { toYoutubeEmbed } from "@/lib/getYoutube"
import { useRouter } from "next/navigation"
import type { Course } from "@/types/course"
import { Lesson } from "@/types/lesson"
import { toast } from "sonner"
import api from "@/lib/api"

interface Props {
  course: Course
  isEnrolled?: boolean
}


export default function CourseDetailsClient({
  course,
  isEnrolled = false
}: Props) {
  const [open, setOpen] = useState(false)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const router = useRouter();
  const isFree = course.price === 0

  const instructorName =
    course.instructor?.name ||
    `${course.instructor?.firstName || ""} ${course.instructor?.lastName || ""}`.trim() ||
    "Instructor"

  const totalChapters = course.chapters?.length || 0

  const totalLessons =
    course.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0

  const totalDuration =
    course.chapters?.reduce((acc, ch) => {
      const lessonsTotal =
        ch.lessons?.reduce((a, l) => a + (l.duration || 0), 0) || 0
      return acc + lessonsTotal
    }, 0) || 0

  const embedUrl = useMemo(() => {
    if (!activeLesson?.videoUrl) return null
    return toYoutubeEmbed(activeLesson.videoUrl)
  }, [activeLesson])

  function handleWatch(lesson: Lesson) {
    const canAccess = isFree || isEnrolled || lesson.isFreePreview
    if (!canAccess) return

    setActiveLesson(lesson)
    setOpen(true)
  }

  async function handleEnroll() {
    try {
      const res = await api.get("/api/auth/me")
      const user = res.data?.user;
    if (!user) {
      router.push(`/login?redirect=/courses/${course.slug}`);
      return;
    }

      if (isFree) {
        const enrollRes = await api.post("/api/user/enroll", { slug: course.slug })

        if (enrollRes.status === 201 || enrollRes.status === 200) {
         toast.success(enrollRes.data.message || "Enrolled successfully!");
         setTimeout(() => router.refresh(), 500);
          router.refresh() // This triggers the Server Component to re-run
        } else {
          toast.error("Enrollment failed at the API level.")
        }
        return
      }

      toast.info("Paid course detected. Redirecting to checkout.")
      router.push(`/checkout/${course.slug}`)

    } catch (error: any) {
      console.error(error)
      toast.error(`Error: ${error.response?.data?.message || error.message}`)
    }
  }

  return (
    <>
      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-base">
              {activeLesson?.title || "Lesson"}
            </DialogTitle>
          </DialogHeader>

          <div className="relative w-full aspect-video bg-black">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={activeLesson?.title}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
                Video URL missing / invalid
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog >
      {/* Page Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {course.categories && course.categories.map((cat) => (
                  <Badge key={cat.slug} variant="outline" className="rounded-xl">
                    {cat.name}
                  </Badge>
                ))}

                <Badge variant="secondary" className="rounded-xl">
                  {course.level}
                </Badge>

                {isFree ? (
                  <Badge className="rounded-xl">Free Course</Badge>
                ) : (
                  <Badge variant="secondary" className="rounded-xl">
                    Paid Course
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold">
                {course.title}
              </h1>

              <p className="text-muted-foreground mt-3">
                {course.description}
              </p>

              <p className="mt-4 text-sm text-muted-foreground">
                Created by{" "}
                <span className="font-medium">{instructorName}</span>
              </p>


            </div>

            {/* Course Content */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {totalChapters} chapters • {totalLessons} lessons •{" "}
                  {totalDuration} min
                </p>
              </CardHeader>

              <CardContent>
                <Accordion type="single" collapsible>
                  {course.chapters.map((chapter, chapterIndex) => (
                    <AccordionItem key={chapter._id} value={chapter._id}>
                      <AccordionTrigger>
                        {chapterIndex + 1}. {chapter.title}
                      </AccordionTrigger>

                      <AccordionContent>
                        {chapter.lessons.map((lesson, lessonIndex) => {
                          const canAccess =
                            isFree || isEnrolled || lesson.isFreePreview

                          return (
                            <div
                              key={lesson._id}
                              className="flex items-center justify-between border rounded-xl p-3 mb-2"
                            >
                              <div>
                                <p className="font-medium">
                                  {chapterIndex + 1}.{lessonIndex + 1}{" "}
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {lesson.duration
                                    ? `${lesson.duration} min`
                                    : ""}
                                </p>
                              </div>

                              {canAccess ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleWatch(lesson)}
                                >
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Watch
                                </Button>
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          )
                        })}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-1">
            <Card className="rounded-2xl overflow-hidden">
              <div className="relative w-full h-52">
                <Image
                  src={course.thumbnail || "/placeholder.png"}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span>Price</span>
                  <span className="text-2xl font-bold">
                    {isFree ? "Free" : `₹${course.price}`}
                  </span>
                </div>

                <Button
                  className="w-full rounded-xl"
                  onClick={() => {
                    if (isEnrolled) {
                      router.push(`/courses/${course.slug}/learn`)
                    } else {
                      handleEnroll()
                    }
                  }}
                >
                  {isEnrolled
                    ? "Continue Watching"
                    : isFree
                      ? "Enroll Now"
                      : "Pay & Enroll"}
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>

        <div className="">
          {/* Prerequisites */}
          {course.prerequisites?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Prerequisites</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {course.prerequisites.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {course.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {course.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="rounded-xl">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  )
}
