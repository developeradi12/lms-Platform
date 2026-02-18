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

type Lesson = {
  _id: string
  title: string
  duration?: number
  isFreePreview?: boolean
  videoUrl?: string
}

type Chapter = {
  _id: string
  title: string
  description?: string
  lessons: Lesson[]
}

type Course = {
  title: string
  slug: string
  description: string
  thumbnail: string
  price: number
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  createdAt: string
  instructor?: { firstName?: string; lastName?: string; name?: string }
  category?: { name: string }
  chapters: Chapter[]
}

function toYoutubeEmbed(url: string) {
  // supports youtu.be + watch?v= + shorts
  const u = url.trim()

  if (u.includes("embed/")) return u

  const short = u.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1]
  const watch = u.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1]
  const shorts = u.match(/shorts\/([a-zA-Z0-9_-]+)/)?.[1]

  const id = short || watch || shorts
  if (!id) return null

  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
}

export default function CourseDetailsClient({ course }: { course: Course }) {
  const [open, setOpen] = useState(false)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)

  const isEnrolled = false // TODO real
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
                title={activeLesson?.title || "Lesson video"}
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
      </Dialog>

      {/* Page UI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
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
                {course.title}
              </h1>

              <p className="text-muted-foreground mt-3 text-sm sm:text-base">
                {course.description}
              </p>

              <p className="mt-4 text-sm text-muted-foreground">
                Created by <span className="font-medium">{instructorName}</span>
              </p>
            </div>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Course Content</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {totalChapters} chapters • {totalLessons} lessons • {totalDuration} min
                </p>
              </CardHeader>

              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {course.chapters.map((chapter, chapterIndex) => (
                    <AccordionItem key={chapter._id} value={chapter._id} className="border-b">
                      <AccordionTrigger className="text-left">
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {chapterIndex + 1}. {chapter.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {chapter.lessons?.length || 0} lessons
                          </span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {chapter.lessons.map((lesson, lessonIndex) => {
                            const canAccess =
                              isFree || isEnrolled || lesson.isFreePreview

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
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium">{lesson.title}</p>

                                      {lesson.isFreePreview && !isFree && !isEnrolled && (
                                        <Badge variant="outline" className="rounded-xl text-xs">
                                          Preview
                                        </Badge>
                                      )}
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                      {lesson.duration
                                        ? `Duration: ${lesson.duration} min`
                                        : "Lesson"}
                                    </p>
                                  </div>
                                </div>

                                {canAccess ? (
                                  <Button
                                    size="sm"
                                    className="rounded-xl gap-2"
                                    onClick={() => handleWatch(lesson)}
                                  >
                                    <PlayCircle className="h-4 w-4" />
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
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Right */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Card className="rounded-2xl overflow-hidden">
                <div className="relative w-full h-52 bg-muted">
                  <Image
                    src={course.thumbnail || "/placeholder.png"}
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

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl border p-3">
                      <p className="text-xs text-muted-foreground">Chapters</p>
                      <p className="font-semibold">{totalChapters}</p>
                    </div>
                    <div className="rounded-xl border p-3">
                      <p className="text-xs text-muted-foreground">Lessons</p>
                      <p className="font-semibold">{totalLessons}</p>
                    </div>
                    <div className="rounded-xl border p-3">
                      <p className="text-xs text-muted-foreground">Minutes</p>
                      <p className="font-semibold">{totalDuration}</p>
                    </div>
                  </div>

                  {isFree || isEnrolled ? (
                    <Button className="w-full rounded-xl">Start Learning</Button>
                  ) : (
                    <Button className="w-full rounded-xl">Pay & Enroll</Button>
                  )}

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isFree
                      ? "This course is free. You can access all lessons."
                      : "This is a paid course. You can still watch preview lessons for free."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}