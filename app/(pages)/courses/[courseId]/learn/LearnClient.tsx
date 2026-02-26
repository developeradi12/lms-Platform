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
import { Separator } from "@/components/ui/separator"

import { PlayCircle, CheckCircle2 } from "lucide-react"
import api from "@/lib/api"


export default function LearnClient({ course }: { course: any }) {
  const [currentLesson, setCurrentLesson] = useState(
    course.chapters?.[0]?.lessons?.[0] || null
  )

  const [localCourse, setLocalCourse] = useState(course)
  const [loading, setLoading] = useState(false)

  // 🔢 Server Progress Based Calculation
  const stats = useMemo(() => {
    const allLessons = localCourse.chapters.flatMap((c: any) => c.lessons)

    const total = allLessons.length
    const completed = allLessons.filter((l: any) => l.isCompleted).length

    return {
      total,
      completed,
      percentage: total
        ? Math.round((completed / total) * 100)
        : 0,
    }
  }, [localCourse])

  // ⚡ Smooth Optimistic Update
  const markLessonCompleted = (lessonId: string) => {
    setLocalCourse((prev: any) => ({
      ...prev,
      chapters: prev.chapters.map((ch: any) => ({
        ...ch,
        lessons: ch.lessons.map((l: any) =>
          String(l._id) === String(lessonId)
            ? { ...l, isCompleted: true }
            : l
        ),
      })),
    }))
  }

  // 🖱 Manual Mark Complete
  const handleManualComplete = async () => {
    if (!currentLesson || currentLesson.isCompleted) return

    try {
      setLoading(true)
      // Optimistic first
      markLessonCompleted(currentLesson._id)

      await api.post("/api/user/progress", {
        lessonId: currentLesson._id,
        watchedSeconds: currentLesson.duration * 60,
      })
      toast.success("Lesson completed 🎉")
    } catch {
      toast.error("Failed to update progress")
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),transparent_60%)] bg-background">

      {/* ===== Premium Header ===== */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-white/10 shadow-sm px-10 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {localCourse.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {stats.completed} of {stats.total} lessons completed
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="w-56 hidden md:block">
            <Progress value={stats.percentage} className="h-2 bg-muted" />
          </div>

          <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            {stats.percentage}% Complete
          </div>
        </div>
      </header>

      {/* ===== Layout ===== */}
      <div className="grid lg:grid-cols-4">

        {/* Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 h-[calc(100vh-90px)]">
          <CourseSidebar
            chapters={localCourse.chapters}
            currentLessonId={currentLesson?._id}
            onSelectLesson={setCurrentLesson}
          />
        </aside>

        {/* Main */}
        <main className="lg:col-span-3 p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLesson?._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <VideoPlayer lesson={currentLesson} />

              {currentLesson && (
                <Card className="rounded-3xl border border-white/10 bg-background/70 backdrop-blur-xl shadow-xl hover:shadow-2xl transition duration-500">
                  <CardContent className="p-8 space-y-6">

                    <div className="flex items-center gap-3">
                      {currentLesson.isCompleted ? (
                        <CheckCircle2 className="text-green-500" />
                      ) : (
                        <PlayCircle className="text-primary" />
                      )}
                      <h2 className="text-xl font-semibold">
                        {currentLesson.title}
                      </h2>
                    </div>

                    <Separator />

                    <p className="text-sm text-muted-foreground">
                      Duration: {currentLesson.duration || 0} mins
                    </p>

                    <Button
                      onClick={handleManualComplete}
                      disabled={currentLesson.isCompleted || loading}
                      className="rounded-xl px-6 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
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