"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CheckCircle, PlayCircle, Menu, X } from "lucide-react"
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
  const [isOpen, setIsOpen] = useState(false)

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
    <>
      {/* ================= MOBILE TOGGLE BUTTON ================= */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-lg p-2 rounded-xl hover:scale-105 transition"
      >
        <Menu size={20} />
      </button>

      {/* ================= OVERLAY ================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ================= SIDEBAR ================= */}
      <motion.div
        initial={{ x: -350 }}
        animate={{ x: isOpen || typeof window !== "undefined" && window.innerWidth >= 768 ? 0 : -350 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="fixed md:static z-50 h-screen w-[320px] bg-white shadow-2xl md:shadow-lg rounded-r-3xl md:rounded-none flex flex-col"
      >
        {/* ===== Close Button (Mobile) ===== */}
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= HEADER ================= */}
        <div className="px-6 pb-6">
          <h2 className="text-xl font-bold tracking-tight mb-4">
            Course Content
          </h2>

          <Progress
            value={progress}
            className="h-2 rounded-full shadow-inner"
          />

          <p className="text-sm text-gray-500 mt-2">
            {completedCount} / {allLessons.length} completed ({progress}%)
          </p>
        </div>

        {/* ================= CHAPTERS ================= */}
        <ScrollArea className="flex-1 px-4 pb-6">
          <Accordion
            type="multiple"
            defaultValue={defaultOpenChapters}
            className="space-y-4"
          >
            {chapters.map((chapter) => {
              const chapterLessons = chapter.lessons ?? []
              const chapterCompleted = chapterLessons.filter(
                (l) => l.isCompleted
              ).length

              return (
                <AccordionItem
                  key={chapter._id}
                  value={chapter._id}
                  className="rounded-2xl bg-gray-50 shadow-md hover:shadow-lg transition-all px-4"
                >
                  <AccordionTrigger className="py-4 text-sm font-semibold hover:no-underline">
                    <div className="flex justify-between w-full">
                      <span>{chapter.title}</span>
                      <span className="text-xs text-gray-500">
                        {chapterCompleted}/{chapterLessons.length}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="space-y-2 pb-4">
                      {chapterLessons.map((lesson) => {
                        const isActive =
                          lesson._id === currentLessonId

                        return (
                          <motion.button
                            key={lesson._id}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              onSelectLesson(lesson)
                              setIsOpen(false)
                            }}
                            className={clsx(
                              "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                              isActive
                                ? "bg-indigo-100 shadow-md"
                                : "hover:bg-white hover:shadow-sm"
                            )}
                          >
                            {lesson.isCompleted ? (
                              <CheckCircle
                                className="text-green-500"
                                size={18}
                              />
                            ) : (
                              <PlayCircle
                                className="text-gray-400"
                                size={18}
                              />
                            )}

                            <span
                              className={clsx(
                                "text-sm font-medium",
                                isActive && "text-indigo-600"
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
              )
            })}
          </Accordion>
        </ScrollArea>
      </motion.div>
    </>
  )
}