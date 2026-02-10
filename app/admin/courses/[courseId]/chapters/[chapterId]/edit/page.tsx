"use client"

import Link from "next/link"
import { useEffect } from "react"
import axios from "axios"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

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
import { Skeleton } from "@/components/ui/skeleton"

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  order: z.coerce.number().min(0).optional(),
})

type FormValues = z.input<typeof formSchema>

export default function EditChapterPage() {
  const router = useRouter()
  const params = useParams()

  const courseId = params.courseId as string
  const chapterId = params.chapterId as string

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      order: 0,
    },
  })

  const isSubmitting = form.formState.isSubmitting
  const isLoading = form.formState.isLoading

  // ✅ Load chapter
  useEffect(() => {
    if (!chapterId) return

    const fetchChapter = async () => {
      try {
        const res = await axios.get(`/api/admin/courses/${courseId}/chapters/${chapterId}`)
        const chapter = res.data?.chapter

        if (!chapter) {
          toast.error("Chapter not found")
          router.push(`/admin/courses/${courseId}/chapters`)
          return
        }

        form.reset({
          title: chapter.title || "",
          order: chapter.order || 0,
        })
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load chapter")
      }
    }

    fetchChapter()
  }, [chapterId, courseId, router, form])

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await axios.patch(`/api/admin/courses/${courseId}/chapters/${chapterId}`, values)

      toast.success(res.data?.message || "Chapter updated")

      router.push(`/admin/courses/${courseId}/chapters`)
      router.refresh()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Update failed")
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Chapter</h1>
          <p className="text-sm text-muted-foreground">
            Update chapter title and order.
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-xl">
          <Link href={`/admin/courses/${courseId}/chapters`}>Back</Link>
        </Button>
      </div>

      <Card className="rounded-2xl max-w-2xl">
        <CardHeader>
          <CardTitle>Chapter Details</CardTitle>
          <CardDescription>Edit chapter information.</CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-40 rounded-xl" />
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <Label>Chapter Title</Label>
                <Input
                  placeholder="Example: Introduction"
                  className="rounded-xl"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* Order */}
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  placeholder="0"
                  className="rounded-xl"
                  {...form.register("order")}
                />
                <p className="text-xs text-muted-foreground">
                  Lower order shows first (1,2,3...).
                </p>
                {form.formState.errors.order && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.order.message}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => router.push(`/admin/courses/${courseId}/chapters`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
