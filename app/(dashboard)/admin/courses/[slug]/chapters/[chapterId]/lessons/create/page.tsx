"use client"

import Link from "next/link"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getYoutubeId } from "@/lib/getYoutube"
import api from "@/lib/api"

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  videoUrl: z.string().url("Enter a valid video URL"),
  duration: z.coerce.number().min(0, "Duration must be at least 0").optional(),
  order: z.coerce.number().min(0).optional(),
  isFreePreview: z.boolean().optional(),
})

type FormValues = z.input<typeof formSchema>

export default function CreateLessonPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const chapterId = params.chapterId as string
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      videoUrl: "",
      duration: 0,
      isFreePreview: false,
    },
  })

  const isSubmitting = form.formState.isSubmitting
  const videoUrl = form.watch("videoUrl")
  const youtubeId = getYoutubeId(videoUrl)

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        title: values.title,
        videoUrl: values.videoUrl,
        duration: values.duration || 0,
        isFreePreview: values.isFreePreview || false,
      }

      const res = await api.post(
        `/api/admin/courses/${slug}/chapters/${chapterId}/lessons`,
        payload
      )

      toast.success(res.data?.message || "Lesson created")
      router.push(`/admin/courses/${slug}/chapters/${chapterId}/lessons`)
      router.refresh()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create lesson")
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Lesson</h1>
          <p className="text-sm text-muted-foreground">
            Upload a video and create a lesson.
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-xl">
          <Link href={`/admin/courses/${slug}/chapters/${chapterId}/lessons`}>
            Back
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl max-w-2xl">
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
          <CardDescription>Fill details and upload video URL.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                placeholder="Example: What is React?"
                className="rounded-xl"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input
                placeholder="https://youtube.com/..."
                className="rounded-xl"
                {...form.register("videoUrl")}
              />
              {form.formState.errors.videoUrl && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.videoUrl.message}
                </p>
              )}
            </div>

            {/* Video Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              {!videoUrl?.trim() ? (
                <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
                  Paste a YouTube URL to see preview.
                </div>
              ) : youtubeId ? (
                <div className="rounded-2xl border overflow-hidden">
                  <iframe
                    className="w-full aspect-video"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="YouTube Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="rounded-2xl border p-6 text-sm text-red-500">
                  Invalid YouTube URL.
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                className="rounded-xl"
                {...form.register("duration", { valueAsNumber: true })}
              />
              {form.formState.errors.duration && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.duration.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Please fill video duration
              </p>
            </div>

            {/* Free Preview */}
            <div className="flex items-center gap-3">
              <Controller
                control={form.control}
                name="isFreePreview"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label className="cursor-pointer">Free Preview</Label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                className="rounded-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Uploading..." : "Create Lesson"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() =>
                  router.push(
                    `/admin/courses/${slug}/chapters/${chapterId}/lessons`
                  )
                }
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
