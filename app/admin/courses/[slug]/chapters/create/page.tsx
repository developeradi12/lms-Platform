"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { toast } from "sonner"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"

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

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
})

type FormValues = z.input<typeof formSchema>

export default function CreateChapterPage() {
  const router = useRouter()
  const {slug} = useParams();
  console.log("slug issue",slug)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await axios.post(
        `/api/admin/courses/${slug}/chapters`,
        values
      )

      toast.success(res.data?.message || "Chapter created")

      router.push(`/admin/courses/${slug}/chapters`)
      router.refresh()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create chapter")
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Chapter</h1>
          <p className="text-sm text-muted-foreground">
            Add a new chapter to this course.
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-xl">
          <Link href={`/admin/courses/${slug}/chapters`}>Back</Link>
        </Button>
      </div>

      {/* Form */}
      <Card className="rounded-2xl max-w-2xl">
        <CardHeader>
          <CardTitle>Chapter Details</CardTitle>
          <CardDescription>
            Fill the chapter title and description (optional).
          </CardDescription>
        </CardHeader>

        <CardContent>
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


            <div className="space-y-2">
              <Label>Chapter Description</Label>
              <Textarea
                placeholder="Example: In this chapter we will cover basics..."
                className="rounded-xl min-h-[120px]"
                {...form.register("description")}
              />

            </div>


            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                className="rounded-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Chapter"}
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
        </CardContent>
      </Card>
    </div>
  )
}
