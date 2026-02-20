"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toYoutubeEmbed } from "@/lib/getYoutube"
import { Lesson } from "@/types/lesson"
import { useMemo, useEffect } from "react"
import { CheckCircle, PlayCircle } from "lucide-react"

interface Props {
  lesson: Lesson
}

export default function VideoPlayer({ lesson }: Props) {
  const embedUrl = useMemo(() => {
    if (!lesson?.videoUrl) return null;
    return toYoutubeEmbed(lesson.videoUrl);
  }, [lesson?.videoUrl])

  return (
    <div className="space-y-6">
        <div className="relative aspect-video w-full">
          {embedUrl ? (
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={lesson?.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full border-0"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <PlayCircle className="h-12 w-12 opacity-20" />
              <p>Video not available</p>
            </div>
          )}
        </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">Playing from YouTube</p>
        </div>
      </div>
    </div>
  )
}