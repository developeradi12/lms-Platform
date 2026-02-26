"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Lesson } from "@/types/lesson"
import { getYoutubeId } from "@/lib/getYoutube"
import api from "@/lib/api"
import { PlayCircle } from "lucide-react"

interface Props {
  lesson: Lesson
  onLessonCompleted?: () => void
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: any
  }
}

export default function VideoPlayer({ lesson, onLessonCompleted }: Props) {
  const playerRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<number>(0)

  useEffect(() => {
    if (!lesson?.videoUrl) return

    const videoId = getYoutubeId(lesson.videoUrl)

    const loadYouTubeAPI = () =>
      new Promise<void>((resolve) => {
        if (window.YT && window.YT.Player) {
          resolve()
        } else {
          const existingScript = document.querySelector(
            'script[src="https://www.youtube.com/iframe_api"]'
          )

          if (!existingScript) {
            const tag = document.createElement("script")
            tag.src = "https://www.youtube.com/iframe_api"
            document.body.appendChild(tag)
          }

          window.onYouTubeIframeAPIReady = () => resolve()
        }
      })

    const initPlayer = async () => {
      await loadYouTubeAPI()

      if (playerRef.current) playerRef.current.destroy()

      playerRef.current = new window.YT.Player("youtube-player", {
        videoId,
        playerVars: {
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => startTracking(),
        },
      })
    }

    const startTracking = () => {
      intervalRef.current = setInterval(async () => {
        if (!playerRef.current) return

        const currentTime = playerRef.current.getCurrentTime()
        const duration = playerRef.current.getDuration()
        if (!duration) return

        if (currentTime - lastSavedRef.current >= 10) {
          lastSavedRef.current = currentTime

          try {
            const res = await api.post("/api/progress/update", {
              lessonId: lesson._id,
              watchedSeconds: currentTime,
            })

            if (res.data.lessonCompleted && onLessonCompleted) {
              onLessonCompleted()
            }
          } catch {
            console.log("Progress save failed")
          }
        }
      }, 5000)
    }

    initPlayer()

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (playerRef.current?.destroy) playerRef.current.destroy()
    }
  }, [lesson])

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* 🎬 Video Container */}
      <div className="relative group">
        
        {/* Glow Border */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/40 via-purple-500/30 to-primary/40 blur-xl opacity-40 group-hover:opacity-70 transition duration-500" />

        <div className="relative aspect-video w-full overflow-hidden rounded-3xl shadow-2xl border bg-black">
          {lesson?.videoUrl ? (
            <div
              id="youtube-player"
              className="w-full h-full scale-[1.01]"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3 bg-muted/40 backdrop-blur-md">
              <PlayCircle className="h-14 w-14 opacity-30" />
              <p className="text-sm">Video not available</p>
            </div>
          )}
        </div>
      </div>

      {/* 📘 Lesson Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-1"
      >
        <h1 className="text-3xl font-semibold tracking-tight">
          {lesson.title}
        </h1>

        <p className="text-sm text-muted-foreground mt-2">
          Your progress is automatically tracked as you watch.
        </p>
      </motion.div>
    </motion.div>
  )
}