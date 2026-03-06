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

import { CourseDetailsSerialized } from "@/types/course"
import { LessonSerialized } from "@/types/lesson"

import CourseSidebar from "../../courses/_components/CourseSidebar"
import VideoPlayer from "../../courses/_components/VideoPlayer"

interface Props {
  course: CourseDetailsSerialized
}

export default function LearnClient({ course }: Props) {

  /* ---------------- FIND INITIAL LESSON ---------------- */

  const findInitialLesson = (): LessonSerialized | null => {

    const allLessons = course.chapters.flatMap(c => c.lessons)

    if (course.progress?.lastAccessedLesson) {

      const found = allLessons.find(
        l => l._id === course.progress?.lastAccessedLesson
      )

      if (found) return found
    }

    return allLessons[0] ?? null
  }

  /* ---------------- STATE ---------------- */

  const [localCourse, setLocalCourse] =
    useState<CourseDetailsSerialized>(course)

  const [currentLesson, setCurrentLesson] =
    useState<LessonSerialized | null>(findInitialLesson())

  const [loading, setLoading] = useState(false)

  /* ---------------- PROGRESS STATS ---------------- */

  const stats = useMemo(() => {

    const allLessons = localCourse.chapters.flatMap(c => c.lessons)

    const completed = allLessons.filter(l => l.isComplete).length

    const total = allLessons.length

    const percentage =
      total ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      percentage
    }

  }, [localCourse])

  /* ---------------- OPTIMISTIC COMPLETE ---------------- */

  const markLessonCompleted = (lessonId: string) => {

    setLocalCourse(prev => ({
      ...prev,
      chapters: prev.chapters.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(l =>
          l._id === lessonId
            ? { ...l, isComplete: true }
            : l
        )
      }))
    }))
  }

  /* ---------------- SELECT LESSON ---------------- */

  const handleSelectLesson = async (lesson: LessonSerialized) => {

    setCurrentLesson(lesson)

    try {

      await api.post("/api/user/progress", {
        courseId: localCourse._id,
        lessonId: lesson._id,
        isCompleted: false
      })

    } catch (error) {

      console.error("Failed updating last accessed lesson")

    }

  }

  /* ---------------- MARK COMPLETE ---------------- */

  const handleManualComplete = async () => {

    if (!currentLesson || currentLesson.isComplete) return

    try {

      setLoading(true)

      markLessonCompleted(currentLesson._id)

      await api.post("/api/user/progress", {
        courseId: localCourse._id,
        lessonId: currentLesson._id,
        isCompleted: true
      })

      toast.success("Lesson completed 🎉")

    } catch (error) {

      toast.error("Failed to update progress")

    } finally {

      setLoading(false)

    }

  }

  /* ---------------- UI ---------------- */

  return (

    <div className="min-h-screen flex flex-col bg-background">

      {/* HEADER */}

      <header className="sticky top-0 z-30 bg-background border-b border-border px-4 sm:px-6 py-4 mx-10">

        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">

          <div>

            <h1 className="text-lg sm:text-2xl font-semibold">
              {localCourse.title}
            </h1>

            <p className="text-sm text-muted-foreground">
              {stats.completed} of {stats.total} lessons completed
            </p>

          </div>

          <div className="flex items-center gap-4">

            <div className="w-56 hidden sm:block">
              <Progress value={stats.percentage} className="h-2" />
            </div>

            <div className="px-4 py-1 rounded-full bg-primary/10 text-primary text-sm">
              {stats.percentage}% Complete
            </div>

          </div>

        </div>

      </header>

      {/* LAYOUT */}

      <div className="flex flex-1 overflow-hidden mx-10">

        {/* SIDEBAR */}

        <div className="w-[320px] border-r border-border hidden lg:block">

          <CourseSidebar
            chapters={localCourse.chapters}
            currentLessonId={currentLesson?._id}
            onSelectLesson={handleSelectLesson}
          />

        </div>

        {/* MAIN CONTENT */}

        <main className="flex-1 overflow-y-auto px-6 py-8">

          <div className="max-w-5xl mx-auto space-y-8">

            <AnimatePresence mode="wait">

              <motion.div
                key={currentLesson?._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >

                <VideoPlayer lesson={currentLesson} />

                {currentLesson && (

                  <Card className="mt-6">

                    <CardContent className="p-6 space-y-5">

                      <div className="flex items-center gap-3">

                        {currentLesson.isComplete
                          ? <CheckCircle2 className="text-green-500" />
                          : <PlayCircle className="text-primary" />}

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
                        disabled={currentLesson.isComplete || loading}
                        variant="secondary"
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

  )

}