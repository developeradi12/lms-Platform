"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
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

import { toast } from "sonner"
import api from "@/lib/api"
import Link from "next/link"
import { reviews } from "@/lib/data/reviews"
import Reveal from "@/components/animations/Reveal"
import { CourseDetailsSerialized, LessonSerialized } from "@/types"


interface Props {
  course: CourseDetailsSerialized
  isEnrolled?: boolean
  isWishlisted?: boolean
  isLoggedIn?: boolean
}

export default function CourseDetailsClient({ course, isEnrolled = false, isWishlisted = false, isLoggedIn = false }: Props) {
  const router = useRouter()
  const isFree = course.price === 0

  const [open, setOpen] = useState(false)
  const [activeLesson, setActiveLesson] = useState<LessonSerialized | null>(null)
  const [isInWishlist, setIsInWishlist] = useState(isWishlisted)
  const [loading, setLoading] = useState(false)


  const instructorName =
    course.instructor?.name ||
    "Instructor"

  const totalChapters = course.chapters?.length || 0
  const totalLessons = course.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0
  const totalDuration =
    course.chapters?.reduce((acc, ch) => acc + (ch.lessons?.reduce((a, l) => a + (l.duration || 0), 0) || 0), 0) || 0

  const embedUrl = useMemo(() => {
    if (!activeLesson?.videoUrl) return null
    return toYoutubeEmbed(activeLesson.videoUrl)
  }, [activeLesson])

  function handleWatch(lesson: LessonSerialized) {
    const canAccess = isFree || isEnrolled || lesson.isFreePreview
    if (!canAccess) return
    setActiveLesson(lesson)
    setOpen(true)
  }

  const handleWishlist = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/courses/${course.slug}`)
      return
    }
    try {
      setLoading(true)
      const res = await api.post("/api/wishlist/toggle", { courseId: course._id })
      setIsInWishlist(res.data.added)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/courses/${course.slug}`)
      return
    }

    // FREE COURSE → Direct enroll
    if (isFree) {
      try {
        setLoading(true)

        await api.post("/api/user/enroll", {
          slug: course.slug
        })

        toast.success("Enrolled successfully 🎉")

        router.push(`/cou`)
      } catch (err) {
        toast.error("Enrollment failed")
      } finally {
        setLoading(false)
      }

      return
    }

    // PAID COURSE → Checkout
    router.push(`/checkout/${course.slug}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">

      {/* HERO */}
      <section className={"border-b bg-background"}>
        <div className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-3 gap-12">

          <div className="lg:col-span-2 space-y-6">
            <Button variant="ghost" asChild className="pl-0">
              <Link href="/courses">← Back to Courses</Link>
            </Button>

            <div className="flex flex-wrap gap-2">
              {course.categories?.map(cat => (
                <Badge key={cat.slug} variant="secondary">{cat.name}</Badge>
              ))}
              <Badge variant="outline">{course.level}</Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold">{course.title}</h1>
            <p className="text-lg text-muted-foreground">{course.description}</p>

            <div className="flex gap-6 text-sm text-muted-foreground">
              <span>⭐ {course.averageRating || 4.8}</span>
              <span>👥 {course.totalEnrollments || 0}</span>
              <span>📚 {totalLessons}</span>
              <span>⏱ {totalDuration} min</span>
            </div>

            <p className="text-sm text-muted-foreground">
              Created by <span className="font-medium text-foreground">{instructorName}</span>
            </p>
          </div>

          <Card className="sticky p-0 top-24 overflow-hidden shadow-2xl">
            <div className="relative aspect-video">
              <Image src={course.thumbnail || "/placeholder.png"} alt={course.title} fill className="object-cover" />
            </div>

            <CardContent className="p-6 space-y-5">
              <p className="text-3xl font-bold text-center">
                {isFree ? "Free" : `₹${course.price}`}
              </p>

              <Button
                size="lg"
                className="w-full"

                onClick={() => {
                  if (isEnrolled) {
                    router.push(`/learn/${course.slug}`)
                  } else {
                    handleEnroll()
                  }

                }}
              >
                {!isLoggedIn
                  ? "Login to Enroll"
                  : isEnrolled
                    ? "Continue Learning"
                    : isFree
                      ? "Enroll Now"
                      : "Buy Now"}
              </Button>

              <Button
                variant={isInWishlist ? "destructive" : "outline"}
                className="w-full"
                disabled={loading}
                onClick={handleWishlist}
              >
                {isInWishlist ? "Remove Wishlist" : "Add to Wishlist"}
              </Button>
              <div className="text-sm space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>
                    Instructor
                  </span>
                  <span className="font-medium">
                    {instructorName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Lessons
                  </span>
                  <span>
                    {totalLessons}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Chapters
                  </span>
                  <span>
                    {totalChapters}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Certificate
                  </span>
                  <span className="text-green-600 font-medium">
                    Yes
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section >

      {/* CURRICULUM */}
      < Reveal delay={100} >
        <section className={"max-w-7xl mx-auto px-6 py-16"}>
          <h2 className="text-2xl font-bold mb-8">Course Content</h2>
          <p className="text-sm text-muted-foreground mb-8"> {totalChapters} chapters • {totalLessons} lessons </p>
          <div className="space-y-4">
            {course.chapters.map((chapter, ci) => (
              <Accordion key={chapter._id} type="single" collapsible>

                <AccordionItem
                  value={chapter._id}
                  className="border rounded-2xl bg-background shadow-sm transition-all duration-300 hover:shadow-md"
                >

                  {/* HEADER */}
                  <AccordionTrigger className="px-6 py-5 hover:no-underline">
                    <div className="flex items-center gap-4 w-full">

                      {/* Number Circle */}
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-primary font-semibold">
                        {ci + 1}
                      </div>

                      {/* Title + Meta */}
                      <div className="flex flex-col text-left flex-1">
                        <span className="font-medium text-base">
                          {chapter.title}
                        </span>

                        <span className="text-sm text-muted-foreground">
                          {chapter.lessons.length} lessons •{" "}
                          {chapter.lessons.reduce((a, l) => a + l.duration, 0)}m total
                        </span>
                      </div>

                    </div>
                  </AccordionTrigger>

                  {/* CONTENT */}
                  <AccordionContent className="px-6 pb-6 animate-fadeIn">
                    <div className="space-y-3 pt-2">

                      {chapter.lessons.map((lesson, li) => {
                        const canAccess = isFree || isEnrolled || lesson.isFreePreview

                        return (
                          <div
                            key={lesson._id}
                            className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3 transition hover:bg-muted"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {ci + 1}.{li + 1} {lesson.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {lesson.duration} min
                              </p>
                            </div>

                            {canAccess ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleWatch(lesson)}
                              >
                                <PlayCircle className="w-4 h-4 mr-1" />
                                Watch
                              </Button>
                            ) : (
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        )
                      })}

                    </div>
                  </AccordionContent>

                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </section>
      </Reveal >

      {/* INSTRUCTOR */}
      < Reveal delay={100} >
        <section className={`max-w-7xl mx-auto px-6 py-16 border-t }`}>
          <h2 className="text-2xl font-bold mb-6">Instructor</h2>
          <div className="flex items-start gap-4">
            <div>
              <h3 className="font-semibold text-lg">
                {instructorName}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                {course.instructor?.bio || "Experienced instructor passionate about teaching real-world skills."}
              </p>
            </div>
          </div>
        </section>
      </Reveal >
      {/* REVIEWS */}
      < Reveal delay={100} >
        <section className={"max-w-7xl mx-auto px-6 py-20 border-t"}>
          <h2 className="text-2xl font-bold mb-10">Student Reviews</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map((r, i) => (
              <Card
                key={i}
                className={`transition-all duration-700 "
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    {r.name}
                    <span className="text-yellow-500 text-sm"> {
                      "★".repeat(r.rating)}
                    </span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {r.role}
                  </p>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {r.comment}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </Reveal >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{activeLesson?.title}</DialogTitle>
          </DialogHeader>

          {embedUrl ? (
            <div className="aspect-video">
              <iframe
                src={embedUrl}
                title={activeLesson?.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="p-10 text-center text-muted-foreground">
              No video available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div >
  )
}