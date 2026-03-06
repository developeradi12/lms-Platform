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

  /* ---------------- Desktop Auto Open ---------------- */

  useEffect(() => {

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
       setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }

    handleResize()

    window.addEventListener("resize", handleResize)

    return () =>
      window.removeEventListener("resize", handleResize)

  }, [])

  /* ---------------- Lessons ---------------- */

  const allLessons = useMemo(() => {
    return chapters.flatMap((ch) => ch.lessons ?? [])
  }, [chapters])

  const completedCount = useMemo(() => {
    return allLessons.filter((l) => l.isComplete).length
  }, [allLessons])

  const progress = allLessons.length
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0

  /* ---------------- Default Open Chapter ---------------- */

  const defaultOpenChapters = useMemo(() => {

    if (!currentLessonId) return []

    const found = chapters.find((ch) =>
      (ch.lessons ?? []).some((l) => l._id === currentLessonId)
    )

    return found ? [found._id] : []

  }, [chapters, currentLessonId])

  /* ---------------- Lesson Click Handler ---------------- */

  const handleLessonClick = (lesson: LessonSerialized) => {

    onSelectLesson(lesson)

    // Close sidebar only on mobile
    if (window.innerWidth < 1024) {
      setIsOpen(false)
    }

  }

  /* ---------------- UI ---------------- */

  return (
    <>
      {/* MOBILE MENU BUTTON - High Z-index, smaller icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-20 left-4 z-[60] bg-white dark:bg-slate-900 border border-border p-3 rounded-full shadow-xl hover:scale-105 transition-transform"
        >
          <MenuIcon size={24} className="text-primary" />
        </button>
      )}

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR CONTAINER */}
      <motion.div
        initial={false}
        animate={{
          x: (isOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : "-100%"
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={clsx(
          "fixed lg:relative top-0 left-0 h-screen bg-background border-r border-border flex flex-col z-[100] transition-all",
          "w-[280px] sm:w-[320px] lg:w-full"
        )}
      >
        {/* MOBILE CLOSE BUTTON */}
        <div className="lg:hidden flex justify-end p-4 absolute right-0 top-0">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full bg-muted/50 hover:bg-muted transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* SIDEBAR CONTENT */}
        <div className="flex flex-col h-full pt-6">
          {/* HEADER */}
          <div className="px-6 pb-6 border-b border-border">
            <h2 className="text-lg font-bold mb-4">Course Content</h2>
            <Progress value={progress} className="h-2" />
            <p className="text-xs mt-3 text-muted-foreground font-medium">
              {completedCount} / {allLessons.length} LESSONS COMPLETED ({progress}%)
            </p>
          </div>

          {/* CHAPTERS LIST */}
          <ScrollArea className="flex-1 px-4 py-4">
            <Accordion type="multiple" defaultValue={defaultOpenChapters} className="space-y-3">
              {chapters.map((chapter) => {
                const chapterLessons = chapter.lessons ?? []
                const chapterCompleted = chapterLessons.filter((l) => l.isComplete).length
                const chapterProgress = chapterLessons.length ? (chapterCompleted / chapterLessons.length) * 100 : 0

                return (
                  <AccordionItem key={chapter._id} value={chapter._id} className="border-none">
                    <AccordionTrigger className="hover:no-underline p-3 rounded-xl hover:bg-muted/50 transition">
                      <div className="flex flex-col items-start w-full gap-1">
                        <div className="flex justify-between w-full pr-4">
                          <span className="text-xs font-bold text-primary uppercase">Chapter {chapter.order}</span>
                          <span className="text-[10px] text-muted-foreground">{chapterCompleted}/{chapterLessons.length}</span>
                        </div>
                        <span className="text-sm font-semibold text-left">{chapter.title}</span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-2 pb-1 px-1">
                      <div className="flex flex-col gap-1">
                        {chapterLessons.map((lesson, idx) => {
                          const isActive = lesson._id === currentLessonId
                          return (
                            <button
                              key={lesson._id}
                              onClick={() => handleLessonClick(lesson)}
                              className={clsx(
                                "flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                                isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                              )}
                            >
                              {lesson.isComplete ? (
                                <CheckCircle size={18} className="text-green-500 shrink-0" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-[10px] shrink-0">
                                  {idx + 1}
                                </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm truncate leading-tight">{lesson.title}</span>
                                {lesson.duration && (
                                  <span className="text-[10px] opacity-70 flex items-center gap-1 mt-1">
                                    <PlayCircle size={10} /> {lesson.duration}
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
        </div>
      </motion.div>
    </>
  )
}