"use client"

import { useMemo, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CheckCircle, PlayCircle, X, MenuIcon } from "lucide-react"
import clsx from "clsx"
import { ChapterSerialized } from "@/types/chapter"
import { LessonSerialized } from "@/types/lesson"

interface Props {
  chapters: ChapterSerialized[]
  currentLessonId?: string
  onSelectLesson: (lesson: LessonSerialized) => void
}

export default function CourseSidebar({
  chapters = [],
  currentLessonId,
  onSelectLesson,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const allLessons = useMemo(() => {
    return chapters.flatMap((ch) => ch.lessons ?? [])
  }, [chapters])

  const completedCount = useMemo(() => {
    return allLessons.filter((l) => l.isComplete).length
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
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-30 left-4 z-[50] bg-background border border-border p-2 rounded-xl shadow-md"
      >
        <MenuIcon size={20} />
      </button>

      {/* OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50]  md:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className={clsx(
          `
          fixed md:static
          top-0 left-0
          z-[1000]
          h-dvh
          bg-background
          flex flex-col
          pt-4
          shadow-lg md:shadow-none
        `,
       "w-[85%] sm:w-[300px] md:w-[300px] lg:w-full ",
          !isOpen && "translate-x-[-100%] md:translate-x-0"
        )}
      >
        {/* CLOSE BUTTON (MOBILE) */}
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-muted transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* HEADER */}
        <div className="px-6 pb-6 border-b border-border">
          <h2 className="text-lg font-semibold mb-3">
            Course Content
          </h2>

          <Progress
            value={progress}
            className="h-1 [&>div]:bg-primary"
          />

          <p className="text-sm mt-2 text-muted-foreground">
            {completedCount} / {allLessons.length} completed ({progress}%)
          </p>
        </div>

        {/* CHAPTERS */}
        <ScrollArea className="flex-1 px-4 py-6">
          <Accordion
            type="multiple"
            defaultValue={defaultOpenChapters}
            className="space-y-4"
          >
            {chapters.map((chapter) => {
              const chapterLessons = chapter.lessons ?? []
              const chapterCompleted = chapterLessons.filter(
                (l) => l.isComplete
              ).length

              const chapterProgress = chapterLessons.length
                ? (chapterCompleted / chapterLessons.length) * 100
                : 0

              return (
                <AccordionItem
                  key={chapter._id}
                  value={chapter._id}
                  className="rounded-2xl bg-muted/40 hover:bg-muted transition px-4"
                >
                  <AccordionTrigger className="py-4 text-sm font-semibold hover:no-underline">
                    <div className="flex flex-col w-full">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        CHAPTER {chapter.order || 1}
                      </span>

                      <div className="flex justify-between items-center">
                        <span>{chapter.title}</span>

                        <span className="text-xs text-muted-foreground">
                          {chapterCompleted}/{chapterLessons.length}
                        </span>
                      </div>

                      <div className="w-full h-1 bg-muted rounded mt-2 overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${chapterProgress}%`,
                          }}
                        />
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="space-y-2 pb-4">
                      {chapterLessons.map((lesson, index) => {
                        const isActive = lesson._id === currentLessonId

                        return (
                          <button
                            key={lesson._id}
                            onClick={() => {
                              onSelectLesson(lesson)
                              setIsOpen(false)
                            }}
                            className={clsx(
                              "relative w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition",
                              isActive
                                ? "bg-muted"
                                : "hover:bg-muted/50"
                            )}
                          >
                            {isActive && (
                              <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary" />
                            )}

                            {lesson.isComplete ? (
                              <CheckCircle
                                className="text-primary"
                                size={20}
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                            )}

                            <div className="flex flex-col">
                              <span
                                className={clsx(
                                  "text-sm",
                                  isActive
                                    ? "font-semibold"
                                    : "text-muted-foreground"
                                )}
                              >
                                {lesson.title}
                              </span>

                              {lesson.duration && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <PlayCircle size={12} />
                                  {lesson.duration}
                                </span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </ScrollArea>
      </motion.div>
    </>
  )
}