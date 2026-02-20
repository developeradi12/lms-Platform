"use client"

import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CheckCircle, PlayCircle } from "lucide-react"
import clsx from "clsx"
import { Chapter } from "@/types/chapter"
import { Lesson } from "@/types/lesson"

interface Props {
  chapters: Chapter[]
  currentLessonId?: string
  onSelectLesson: (lesson: Lesson) => void
}

export default function CourseSidebar({
  chapters = [],
  currentLessonId,
  onSelectLesson,
}: Props) {
  const allLessons = useMemo(() => {
    return chapters.flatMap((ch) => ch.lessons ?? [])
  }, [chapters])

  const completedCount = useMemo(() => {
    return allLessons.filter((l) => l.isCompleted).length
  }, [allLessons])

  const progress = allLessons.length
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0

  const defaultOpenChapters = useMemo(() => {
    if (!currentLessonId) return []
    const found = chapters.find((ch) =>
      (ch.lessons ?? []).some((l) => l._id === currentLessonId)
    )
    return found ? [found._id] : []
  }, [chapters, currentLessonId])

  return (
    <div className="h-screen flex flex-col bg-background border-r">
      {/* ===== Header ===== */}
      <div className="p-6 border-b backdrop-blur bg-background/80 sticky top-0 z-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Course Content
        </h2>

        <div className="mt-4 space-y-2">
          <Progress value={progress} className="h-2" />

          <AnimatePresence mode="wait">
            <motion.p
              key={progress}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-muted-foreground"
            >
              {completedCount} / {allLessons.length} completed ({progress}%)
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* ===== Chapters ===== */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {chapters.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No chapters available.
            </p>
          ) : (
            <Accordion
              type="multiple"
              defaultValue={defaultOpenChapters}
              className="space-y-3"
            >
              {chapters.map((chapter) => (
                <AccordionItem
                  key={chapter._id}
                  value={chapter._id}
                  className="border rounded-2xl px-3 bg-muted/30"
                >
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                    {chapter.title}
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="space-y-2 pt-2 pb-3">
                      {(chapter.lessons ?? []).map((lesson) => {
                        const isActive =
                          lesson._id === currentLessonId

                        return (
                          <motion.button
                            key={lesson._id}
                            layout
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectLesson(lesson)}
                            className={clsx(
                              "relative w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                              isActive
                                ? "bg-primary/10 border border-primary shadow-sm"
                                : "hover:bg-muted"
                            )}
                          >
                            {/* Animated Active Indicator */}
                            {isActive && (
                              <motion.div
                                layoutId="activeLesson"
                                className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                              />
                            )}

                            {lesson.isCompleted ? (
                              <CheckCircle
                                className="text-green-500 shrink-0"
                                size={18}
                              />
                            ) : (
                              <PlayCircle
                                className="shrink-0 text-muted-foreground"
                                size={18}
                              />
                            )}

                            <span
                              className={clsx(
                                "text-sm font-medium",
                                isActive && "text-primary"
                              )}
                            >
                              {lesson.title}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}