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
import type { Course } from "@/types/course"
import { Lesson } from "@/types/lesson"
import { toast } from "sonner"
import api from "@/lib/api"
import Link from "next/link"
import { reviews } from "@/lib/data/reviews"
import Reveal from "@/components/animations/Reveal"

interface Props {
  course: Course
  isEnrolled?: boolean
  isWishlisted?: boolean
  isLoggedIn?: boolean
}

export default function CourseDetailsClient({ course, isEnrolled = false, isWishlisted = false, isLoggedIn = false }: Props) {
  const router = useRouter()
  const isFree = course.price === 0

  const [open, setOpen] = useState(false)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [isInWishlist, setIsInWishlist] = useState(isWishlisted)
  const [loading, setLoading] = useState(false)


  const instructorName =
    course.instructor?.name ||
    `${course.instructor?.firstName || ""} ${course.instructor?.lastName || ""}`.trim() ||
    "Instructor"

  const totalChapters = course.chapters?.length || 0
  const totalLessons = course.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0
  const totalDuration =
    course.chapters?.reduce((acc, ch) => acc + (ch.lessons?.reduce((a, l) => a + (l.duration || 0), 0) || 0), 0) || 0

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
              <span>👥 {course.enrolledCount || 0}</span>
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
                  if (!isLoggedIn) {
                    router.push(`/login?redirect=/courses/${course.slug}`)
                    return
                  }

                  if (isEnrolled) {
                    router.push(`/courses/${course.slug}/learn`)
                  } else {
                    router.push(`/checkout/${course.slug}`)
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
      </section>

      {/* CURRICULUM */}
      <Reveal delay={100}>
        <section className={"max-w-7xl mx-auto px-6 py-16"}>
          <h2 className="text-2xl font-bold mb-8">Course Content</h2>
          <p className="text-sm text-muted-foreground mb-8"> {totalChapters} chapters • {totalLessons} lessons </p>
          <div className="space-y-4">
            {course.chapters.map((chapter, ci) => (
              <Accordion type="single" collapsible key={chapter._id}>
                <AccordionItem value={chapter._id}>
                  <AccordionTrigger>{ci + 1}. {chapter.title}</AccordionTrigger>
                  <AccordionContent>
                    {chapter.lessons.map((lesson, li) => {
                      const canAccess = isFree || isEnrolled || lesson.isFreePreview
                      return (
                        <div key={lesson._id} className="flex justify-between bg-muted/40 rounded-lg px-4 py-3 mb-2">
                          <p>{ci + 1}.{li + 1} {lesson.title}</p>
                          {canAccess ? (
                            <Button size="sm" onClick={() => handleWatch(lesson)}>
                              <PlayCircle className="w-4 h-4 mr-1" /> Watch
                            </Button>
                          ) : <Lock className="w-4 h-4" />}
                        </div>
                      )
                    })}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </section>
      </Reveal>

      {/* INSTRUCTOR */}
      <Reveal delay={100}>
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
      </Reveal>
      {/* REVIEWS */}
      <Reveal delay={100}>
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
      </Reveal>
    </div>
  )
}