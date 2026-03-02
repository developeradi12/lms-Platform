"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"


import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PlayCircle, CheckCircle2 } from "lucide-react"
import api from "@/lib/api"
import { CourseDetailsSerialized, LessonSerialized } from "@/types"
import CourseSidebar from "../../courses/_components/CourseSidebar"
import VideoPlayer from "../../courses/_components/VideoPlayer"

interface Props {
  course: CourseDetailsSerialized
}

export default function LearnClient({ course }: Props) {
  const [currentLesson, setCurrentLesson] = useState<LessonSerialized | null>(
    course.chapters?.[0]?.lessons?.[0] ?? null
  )

  const [localCourse, setLocalCourse] = useState<CourseDetailsSerialized>(course)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // 🔢 Server Progress Based Calculation
  const stats = useMemo(() => {
    const allLessons = localCourse.chapters.flatMap(c => c.lessons)
    const completed = allLessons.filter(l => l.isComplete).length
    const total = allLessons.length

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
    setLocalCourse((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => ({
        ...ch,
        lessons: ch.lessons.map((l) =>
          l._id === lessonId
            ? { ...l, isComplete: true }
            : l
        ),
      })),
    }))
  }

  // 🖱 Manual Mark Complete
  const handleManualComplete = async () => {
    if (!currentLesson || currentLesson.isComplete) return

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
    <>
      {/* ===== Page Wrapper ===== */}
      <div className="min-h-screen flex flex-col bg-background">

        {/* ===== Header ===== */}
        <header className="sticky top-0 z-30 bg-background border-b border-border px-4 sm:px-6 py-4 mx-10">
          <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            {/* Left */}
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold tracking-tight">
                {localCourse.title}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {stats.completed} of {stats.total} lessons completed
              </p>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-32 sm:w-56 hidden sm:block">
                <Progress value={stats.percentage} className="h-2 bg-muted" />
              </div>

              <div className="px-3 sm:px-4 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium border border-primary/20">
                {stats.percentage}% Complete
              </div>
            </div>

          </div>
        </header>

        {/* ===== Main Layout ===== */}
        <div className="flex flex-1 overflow-hidden relative mx-10">

          {/* Desktop Sidebar */}
          <div className="w-0 lg:w-[300px] xl:w-[340px]  border-r border-border">
            <CourseSidebar
              chapters={localCourse.chapters}
              currentLessonId={currentLesson?._id}
              onSelectLesson={setCurrentLesson}
            />
          </div>

          {/* Content */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
            <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">

              {/* ANIMATION */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentLesson?._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <VideoPlayer lesson={currentLesson} />

                  {currentLesson && (
                    <Card className="rounded-2xl border border-border bg-card">
                      <CardContent className="p-5 sm:p-8 space-y-5">

                        <div className="flex items-center gap-3">
                          {currentLesson.isComplete ? (
                            <CheckCircle2 className="text-green-500" />
                          ) : (
                            <PlayCircle className="text-primary" />
                          )}

                          <h2 className="text-lg sm:text-xl font-semibold">
                            {currentLesson.title}
                          </h2>
                        </div>

                        <Separator />

                        <p className="text-sm text-muted-foreground">
                          Duration: {currentLesson.duration || 0} mins
                        </p>

                        <Button
                          onClick={handleManualComplete}
                          disabled={currentLesson.isComplete || loading}
                          variant="secondary"
                          className="rounded-lg w-full sm:w-auto"
                        >
                          {currentLesson.isComplete
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

            </div>
          </main>
        </div>
      </div>
    </>
  )
}