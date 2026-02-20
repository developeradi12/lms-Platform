"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

import CourseSidebar from "../../_components/CourseSidebar"
import VideoPlayer from "../../_components/VideoPlayer"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

import {
  Menu,
  PlayCircle,
  CheckCircle2,
} from "lucide-react"
import api from "@/lib/api"

export default function LearnClient({ course }: { course: any }) {
  const [chapters, setChapters] = useState(course.chapters || [])
  const [currentLesson, setCurrentLesson] = useState(
    course.chapters?.[0]?.lessons?.[0] || null
  )
  const [loading, setLoading] = useState(false)

  //  Progress calculation
  const stats = useMemo(() => {
    const total = chapters.reduce(
      (acc: number, ch: any) => acc + ch.lessons.length,
      0
    )
    const completed = chapters.reduce(
      (acc: number, ch: any) =>
        acc + ch.lessons.filter((l: any) => l.isCompleted).length,
      0
    )

    return {
      total,
      completed,
      percentage: total ? Math.round((completed / total) * 100) : 0,
    }
  }, [chapters])

  //  Find next lesson
  const getNextLesson = () => {
    for (let ch of chapters) {
      for (let i = 0; i < ch.lessons.length; i++) {
        if (ch.lessons[i]._id === currentLesson._id) {
          return ch.lessons[i + 1] || null
        }
      }
    }
    return null
  }

  //  Mark lesson complete
  const handleMarkComplete = async () => {
    if (!currentLesson || currentLesson.isCompleted) return

    try {
      setLoading(true)

      // Optimistic update
      setChapters((prev: any) =>
        prev.map((ch: any) => ({
          ...ch,
          lessons: ch.lessons.map((l: any) =>
            l._id === currentLesson._id
              ? { ...l, isCompleted: true }
              : l
          ),
        }))
      )

      setCurrentLesson((prev: any) => ({
        ...prev,
        isCompleted: true,
      }))

      await api.post("/api/user/progress", {
        lessonId: currentLesson._id,
      })

      toast.success("Lesson completed 🎉")

      const nextLesson = getNextLesson()
      if (nextLesson) {
        setCurrentLesson(nextLesson)
      }

    } catch (err) {
      toast.error("Failed to update progress")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-semibold">
            {course.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {stats.completed} of {stats.total} lessons completed
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Progress
            value={stats.percentage}
            className="w-32 hidden md:block"
          />

          <Badge variant="secondary" className="rounded-xl">
            {stats.percentage}%
          </Badge>

          {/*  Mobile Sidebar */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <CourseSidebar
                chapters={chapters}
                currentLessonId={currentLesson?._id}
                onSelectLesson={setCurrentLesson}
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ================= MAIN LAYOUT ================= */}
      <div className="grid lg:grid-cols-4">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 border-r bg-background h-[calc(100vh-72px)] overflow-y-auto">
          <CourseSidebar
            chapters={chapters}
            currentLessonId={currentLesson?._id}
            onSelectLesson={setCurrentLesson}
          />
        </aside>

        {/* ================= CONTENT ================= */}
        <main className="lg:col-span-3 p-6 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLesson?._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/*  Video */}
              <Card className="rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <VideoPlayer lesson={currentLesson} />
                </CardContent>
              </Card>

              {/* Lesson Info */}
              {currentLesson && (
                <Card className="rounded-2xl">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      {currentLesson.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <PlayCircle className="h-5 w-5 text-primary" />
                      )}
                      <h2 className="text-lg font-semibold">
                        {currentLesson.title}
                      </h2>
                    </div>

                    <Separator />

                    <p className="text-sm text-muted-foreground">
                      Duration: {currentLesson.duration || 0} mins
                    </p>

                    <Button
                      onClick={handleMarkComplete}
                      disabled={
                        currentLesson.isCompleted || loading
                      }
                      className="rounded-xl"
                    >
                      {currentLesson.isCompleted
                        ? "Completed"
                        : loading
                        ? "Saving..."
                        : "Mark as Completed"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}