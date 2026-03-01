"use client"

import React, { useEffect, useState } from "react"
import api from "@/lib/api"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import ThumbnailUpload from "@/components/Upload"
import { CourseUpdateInput, CourseUpdateSchema } from "@/schemas/courseSchema"
import { categoryService } from "@/lib/service/category"
import { courseService } from "@/lib/service/course"
import { MultiSelect } from "@/components/multiSelect"
import { levelOptions } from "@/lib/course-option"
import { CourseSlug, LeanCategory, LeanCourse } from "@/types"

export default function EditCoursePage() {
  const params = useParams<CourseSlug>()
  const slug = params.slug
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<LeanCategory[]>([])
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)

  const form = useForm<CourseUpdateInput>({
    resolver: zodResolver(CourseUpdateSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnailUrl: "",
      thumbnailFile: undefined,
      categories: [],
      price: 0,
      duration: 0,
      level: "BEGINNER",
      isPublished: false,
      tags: [],
      prerequisites: []
    },
  })

  // ✅ Fetch Categories (must load first)
  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll()
      setCategories(res)
      console.log("res",res);
      setCategoriesLoaded(true)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load categories")
      setCategoriesLoaded(true) // Continue anyway
    }
  }

  // ✅ Generate category options after categories are loaded
  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat._id,
  }))

  const thumbnailUrl = form.watch("thumbnailUrl");
  // ✅ Fetch Course Detail & Prefill Form
  const fetchCourse = async () => {
    try {
      const res = await courseService.getBySlug(slug)
      console.log("course",res);
      if (!res) {
        toast.error("Course not found")
        router.push("/admin/courses")
        return
      }

      // ✅ Reset form with all course data
      form.reset({
        title: res.title || "",
        description: res.description || "",
        thumbnailUrl: res.thumbnail ??"", // Shows existing thumbnail
        thumbnailFile: undefined,
        // ✅ Categories: Map to IDs for MultiSelect
        categories: res.categories?.map((cat: any) => cat._id) || [],

        price: res.price ?? 0,
        duration: res.duration ?? 0,
        isPublished: res.isPublished ?? false,

        // ✅ Tags array - will display as chips
        tags: res.tags || [],

        // ✅ Prerequisites array - will display as chips
        prerequisites: res.prerequisites || [],

        level: res.level || "BEGINNER",
      })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load course")
      router.push("/admin/courses")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Load categories first, then course data
  useEffect(() => {
    if (!slug) return

    const loadInitialData = async () => {
      await fetchCategories()
    }

    loadInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  // ✅ Load course data once categories are ready
  useEffect(() => {
    if (!categoriesLoaded || !slug) return

    fetchCourse()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesLoaded, slug])

  // ✅ Submit Handler
  const onSubmit = async (values: CourseUpdateInput) => {
    try {
      setSaving(true)

      const formData = new FormData()

      // ✅ Handle all form fields
      Object.entries(values).forEach(([key, value]) => {
        // Handle Arrays (categories, tags, prerequisites)
        if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(key, item)
          })
        }
        // Handle File objects (new thumbnail uploads)
        else if (value instanceof File) {
          formData.append(key, value)
        }
        // Handle other values
        else if (value !== null && value !== undefined) {
          formData.append(key, String(value))
        }
      })

      // ✅ Send update request
      await api.put(`/api/admin/courses/${slug}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

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
      <div className="p-6 space-y-6 max-w-full">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-[520px] w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-full">
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

            {/* Level + Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Level *</Label>
                <Controller
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <MultiSelect
                      options={levelOptions}
                      value={field.value ? [field.value] : []}
                      onValueChange={(val) => field.onChange(val[0] || "BEGINNER")}
                      closeOnSelect
                      maxCount={1}
                      placeholder="Select level..."
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Categories {(form.watch("categories")?.length ?? 0) > 0 && <span className="text-xs text-muted-foreground">({form.watch("categories")?.length ?? 0})</span>}</Label>
                <p className="text-xs text-muted-foreground">Select one or more categories</p>
                <Controller
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <MultiSelect
                      options={categoryOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select categories..."
                    />
                  )}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags {(form.watch("tags")?.length ?? 0) > 0 && <span className="text-xs text-muted-foreground">({form.watch("tags")?.length ?? 0})</span>}</Label>
              <p className="text-xs text-muted-foreground">
                Add tags to help students find your course. Type and press Enter.
              </p>

              <div className="flex flex-wrap gap-2 border rounded-lg p-3 bg-slate-50">
                {/* Display existing tags */}
                {(form.watch("tags")?.length ?? 0) > 0 ? (
                  (form.watch("tags") ?? []).map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (form.getValues("tags") ?? [])
                            .filter((_, i) => i !== index)
                          form.setValue("tags", updated)
                        }}
                        className="text-blue-600 hover:text-red-600 font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-2">No tags added yet</p>
                )}

                {/* Input for new tags */}
                <Input
                  type="text"
                  placeholder="Add a tag..."
                  className="border-none focus-visible:ring-0 shadow-none px-2 py-1 flex-1 min-w-[150px] bg-transparent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      const value = e.currentTarget.value.trim()

                      if (!value) return

                      const existing = form.getValues("tags") ?? []

                      if (!existing.includes(value)) {
                        form.setValue("tags", [...existing, value])
                      }

                      e.currentTarget.value = ""
                    }
                  }}
                />
              </div>
            </div>
            {/* Prerequisites */}
            <div className="space-y-2">
              <Label>Prerequisites {(form.watch("prerequisites")?.length ?? 0) > 0 && <span className="text-xs text-muted-foreground">({form.watch("prerequisites")?.length ?? 0})</span>}</Label>
              <p className="text-xs text-muted-foreground">
                List requirements students should have before taking this course. Type and press Enter.
              </p>

              <div className="flex flex-wrap gap-2 border rounded-lg p-3 bg-slate-50">
                {/* Display existing prerequisites */}
                {(form.watch("prerequisites")?.length ?? 0) > 0 ? (
                  (form.watch("prerequisites") ?? []).map((item, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (form.getValues("prerequisites") ?? [])
                            .filter((_, i) => i !== index)
                          form.setValue("prerequisites", updated)
                        }}
                        className="text-amber-600 hover:text-red-600 font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-2">No prerequisites set</p>
                )}

                {/* Input for new prerequisites */}
                <Input
                  type="text"
                  placeholder="Add a prerequisite..."
                  className="border-none focus-visible:ring-0 shadow-none px-2 py-1 flex-1 min-w-[150px] bg-transparent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      const value = e.currentTarget.value.trim()

                      if (!value) return

                      const existing = form.getValues("prerequisites") ?? []

                      if (!existing.includes(value)) {
                        form.setValue("prerequisites", [...existing, value])
                      }

                      e.currentTarget.value = ""
                    }
                  }}
                />
              </div>
            </div>

            {/* Price + Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  {...form.register("price", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  {...form.register("duration", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* OLD IMAGE PREVIEW */}
            <div className="space-y-2">
              <Label>Current Image</Label>

              {thumbnailUrl ? (
                <div className="overflow-hidden rounded-2xl border">
                  <img
                    src={thumbnailUrl}
                    alt="Current category"
                    className="w-full h-52 object-cover"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No image uploaded yet.
                </p>
              )}
            </div>
            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>Upload New Thumbnail (Optional)</Label>

              <Controller
                control={form.control}
                name="thumbnailFile"
                render={({ field }) => (
                  <ThumbnailUpload
                    value={field.value}
                    onChange={(file) => field.onChange(file)}
                  />
                )}
              />
              {form.formState.errors.thumbnailFile && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.thumbnailFile.message as string}
                </p>
              )}
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
    </div >
  )
}
