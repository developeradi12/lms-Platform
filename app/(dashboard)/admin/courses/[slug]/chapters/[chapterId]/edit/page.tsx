"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
})

type FormValues = z.input<typeof formSchema>

export default function EditChapterPage() {
  const router = useRouter()
  const params = useParams()

  const slug = params.slug
  const chapterId = params.chapterId

  // console.log("slug", slug)
  // console.log("chapterId", chapterId)

  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const { handleSubmit, reset, register, formState } = form
  const { isSubmitting, errors } = formState

  // ✅ Load chapter
  useEffect(() => {
    if (!chapterId) return

    const fetchChapter = async () => {
      try {
        const res = await api.get(`/api/admin/courses/${slug}/chapters/${chapterId}`)
        const chapter = res.data?.chapter

        if (!chapter) {
          toast.error("Chapter not found")
          router.push(`/admin/courses/${slug}/chapters`)
          return
        }

        form.reset({
          title: chapter.title || "",
          description: chapter.description || "",
        })
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load chapter")
      } finally {
        setIsLoading(false)
      }
    }

    fetchChapter()
  }, [chapterId, slug, router, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await api.patch(`/api/admin/courses/${slug}/chapters/${chapterId}`, values)

      toast.success(res.data?.message || "Chapter updated")

      router.push(`/admin/courses/${slug}/chapters`)
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
          <Link href={`/admin/courses/${slug}/chapters`}>Back</Link>
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

              {/* Description */}
              <div className="space-y-2">
                <Label>Chapter Description</Label>
                <Textarea
                  placeholder="Enter description..."
                  className="rounded-xl"
                  {...register("description")}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button type="submit" className="rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => router.push(`/admin/courses/${slug}/chapters`)}
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
