"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Category = {
  _id: string
  name: string
}

type Course = {
  _id: string
  title: string
  description?: string
  thumbnail?: string
  category?: string | { _id: string; name: string }
  price: number
  duration?: number
  isPublished: boolean
}

const formSchema = z.object({
  title: z.string().min(2, "Course title is required"),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  duration: z.coerce.number().min(0, "Duration cannot be negative").optional(),
  isPublished: z.boolean().default(false),
})

type FormValues = z.input<typeof formSchema>

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()

  const id = params?.courseId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnail: "",
      category: "",
      price: 0,
      duration: 0,
      isPublished: false,
    },
  })

 
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/admin/categories")
      setCategories(res.data?.categories || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load categories")
    }
  }

  //  Fetch Course detail
  const fetchCourse = async () => {
    try {
      setLoading(true)
      console.log("heelo");
      const res = await axios.get(`/api/admin/courses/${id}`)
      console.log(res);
      const course: Course = res.data?.course

      if (!course) {
        toast.error("Course not found")
        router.push("/admin/courses")
        return
      }

      const categoryId =
        typeof course.category === "string"
          ? course.category
          : course.category?._id || ""

      form.reset({
        title: course.title || "",
        description: course.description || "",
        thumbnail: course.thumbnail || "",
        category: categoryId,
        price: course.price ?? 0,
        duration: course.duration ?? 0,
        isPublished: course.isPublished ?? false,
      })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load course")
      router.push("/admin/courses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    fetchCategories()
    fetchCourse()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // ✅ Submit
  const onSubmit = async (values: FormValues) => {
    try {
      setSaving(true)

      await axios.put(`/api/admin/courses/${id}`, values)

      toast.success("Course updated successfully")
      router.push("/admin/courses")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Update failed")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-[520px] w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Course</h1>
          <p className="text-sm text-muted-foreground">
            Update your course details
          </p>
        </div>

        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/admin/courses">Back</Link>
        </Button>
      </div>

      {/* Form */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Course Form</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label>Course Title *</Label>
              <Input
                className="rounded-xl"
                placeholder="e.g. Web Development"
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
              <Label>Description</Label>
              <Textarea
                className="rounded-xl min-h-[120px]"
                placeholder="Write course description..."
                {...form.register("description")}
              />
            </div>

            {/* Category + Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>

                <Select
                  value={form.watch("category")}
                  onValueChange={(val) => form.setValue("category", val)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {form.formState.errors.category && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  className="rounded-xl"
                  {...form.register("price")}
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                className="rounded-xl"
                {...form.register("duration")}
              />
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Thumbnail URL</Label>
              <Input
                className="rounded-xl"
                placeholder="Paste image url..."
                {...form.register("thumbnail")}
              />

              {form.watch("thumbnail")?.trim() ? (
                <div className="mt-3 overflow-hidden rounded-2xl border">
                  <img
                    src={form.watch("thumbnail")}
                    alt="thumbnail preview"
                    className="w-full h-52 object-cover"
                  />
                </div>
              ) : null}
            </div>

            {/* Publish */}
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <div>
                <p className="font-medium">Publish Course</p>
                <p className="text-sm text-muted-foreground">
                  If enabled, course will be visible to students.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  className="rounded-xl"
                  variant={form.watch("isPublished") ? "default" : "outline"}
                >
                  {form.watch("isPublished") ? "Published" : "Draft"}
                </Badge>

                <Switch
                  checked={form.watch("isPublished")}
                  onCheckedChange={(val) => form.setValue("isPublished", val)}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => router.push("/admin/courses")}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="rounded-xl"
                disabled={saving}
              >
                {saving ? "Saving..." : "Update Course"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
