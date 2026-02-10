"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

import { z } from "zod"

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  order: z.coerce.number().min(0).optional(),
  videoUrl: z.string().url("Enter a valid video URL"),
  duration: z.coerce.number().min(0).optional(),
  isFreePreview: z.boolean().optional(),
})

type FormValues = z.input<typeof formSchema>

export default function EditLessonPage() {
  const params = useParams()
  const router = useRouter()

  const { courseId, chapterId, lessonId } = params as {
    courseId: string
    chapterId: string
    lessonId: string
  }

  const [loading, setLoading] = useState(true)

  //want strict typing 
  const form = useForm<FormValues>({
   resolver: zodResolver(formSchema),
   })

  //good practice resolver input the type automatically.
  //Never fight the resolver's types. use this 
  // const form = useForm({
  //   resolver: zodResolver(formSchema)
  // })


  // ✅ Fetch lesson
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await axios.get(
          `/api/admin/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`
        )

        form.reset(res.data.lesson)
      } catch (err) {
        toast.error("Failed to load lesson")
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()
  }, [lessonId])

  // ✅ Update lesson
  const onSubmit = async (values: FormValues) => {
    try {
      await axios.patch(
        `/api/admin/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
        values
      )

      toast.success("Lesson updated successfully 🚀")

      router.push(
        `/admin/courses/${courseId}/chapters/${chapterId}/lessons`
      )
      router.refresh()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Update failed")
    }
  }

  if (loading) return <p className="p-6">Loading lesson...</p>

  return (
    <div className="p-6 max-w-2xl">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Edit Lesson</CardTitle>
          <CardDescription>
            Update your lesson details.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Title */}
            <div>
              <Label>Title</Label>
              <Input {...form.register("title")} />
            </div>

            {/* Video URL */}
            <div>
              <Label>Video URL</Label>
              <Input {...form.register("videoUrl")} />
            </div>

            {/* Duration */}
            <div>
              <Label>Duration</Label>
              <Input type="number" {...form.register("duration")} />
            </div>

            {/* Order */}
            <div>
              <Label>Order</Label>
              <Input type="number" {...form.register("order")} />
            </div>

            {/* Free Preview */}
            <div className="flex items-center gap-2">
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
              <Label>Free Preview</Label>
            </div>

            <Button type="submit" className="rounded-xl w-full">
              Update Lesson
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
