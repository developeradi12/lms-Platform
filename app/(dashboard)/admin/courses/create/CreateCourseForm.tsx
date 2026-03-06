"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import ThumbnailUpload from "@/components/Upload"
import { MultiSelect } from "@/components/multiSelect"
import { levelOptions } from "@/lib/course-option"
import { CourseCreateInput, CourseCreateSchema } from "@/schemas/courseSchema"
import api from "@/lib/api"

type CategoryOption = {
  _id: string
  name: string
  slug: string
}

interface Props {
  categories: CategoryOption[]
}

export default function CreateCourseForm({ categories }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<CourseCreateInput>({
    resolver: zodResolver(CourseCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      categories: [],
      tags: [],
      prerequisites: [],
      level: "BEGINNER",
      price: 0,
      duration: 0,
      isPublished: false,
    },
  })

  /* ------------------ OPTIONS ------------------ */

  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        label: cat.name,
        value: cat._id,
      })),
    [categories]
  )

  /* ------------------ SUBMIT ------------------ */

  const onSubmit = async (values: CourseCreateInput) => {
    try {
      setLoading(true)
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return
        }
        if (Array.isArray(value)) {
          value.forEach((v) => {
            formData.append(key, String(v))
          })
        }
        else if (value instanceof File) {
          formData.append(key, value)
        }
        else {
          formData.append(key, String(value))
        }
      })
      await api.post("api/admin/courses",formData);

      toast.success("Course created successfully")
      router.push("/admin/courses")

    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  /* ------------------ UI ------------------ */

  return (
    <div className=" space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Course</h1>
          <p className="text-muted-foreground">
            Add a new course to your LMS platform.
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href="/admin/courses">Back</Link>
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Fill in the information carefully before publishing.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {/* Title */}
            <div className="space-y-2">
              <Label>Course Title *</Label>
              <Input
                placeholder="Enter course title..."
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
                className="min-h-[120px]"
                placeholder="Write course description..."
                {...form.register("description")}
              />
            </div>

            {/* Category + Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Level *</Label>
                <Controller
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <MultiSelect
                      options={levelOptions}
                      defaultValue={[field.value]}
                      onValueChange={(val) =>
                        field.onChange(val[0])
                      }
                      closeOnSelect
                      maxCount={1}
                      placeholder="Select level..."
                    />
                  )}
                />
              </div>
              {/* Additional Categories */}
              <div className="space-y-2">
                <Label>Categories</Label>
                <Controller
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <MultiSelect
                      options={categoryOptions}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select additional categories..."
                    />
                  )}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>

              <div className="flex flex-wrap gap-2 border rounded-md p-2">
                {form.watch("tags").map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = form
                          .getValues("tags")
                          .filter((_, i) => i !== index)
                        form.setValue("tags", updated)
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </span>
                ))}

                <Input
                  type="text"
                  placeholder="Type and press Enter..."
                  className="border-none focus-visible:ring-0 shadow-none w-auto flex-1 min-w-[150px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      const value = e.currentTarget.value.trim()

                      if (!value) return

                      const existing = form.getValues("tags")

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
              <Label>Prerequisites</Label>

              <div className="flex flex-wrap gap-2 border rounded-md p-2">
                {form.watch("prerequisites").map((item, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-md text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = form
                          .getValues("prerequisites")
                          .filter((_, i) => i !== index)
                        form.setValue("prerequisites", updated)
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </span>
                ))}

                <Input
                  type="text"
                  placeholder="Type and press Enter..."
                  className="border-none focus-visible:ring-0 shadow-none w-auto flex-1 min-w-[150px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      const value = e.currentTarget.value.trim()

                      if (!value) return

                      const existing = form.getValues("prerequisites")

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

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Thumbnail *</Label>

              <Controller
                control={form.control}
                name="thumbnail"
                rules={{ required: "Thumbnail is required" }}
                render={({ field }) => (
                  <>
                    <ThumbnailUpload
                      value={field.value}
                      onChange={(file) => {
                        field.onChange(file)
                      }}
                    />

                    {form.formState.errors.thumbnail && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.thumbnail.message as string}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Publish Switch */}
            <div className="flex items-center justify-between border rounded-xl p-4">
              <div>
                <p className="font-medium">Publish Course</p>
                <p className="text-sm text-muted-foreground">
                  If enabled, students can see this course.
                </p>
              </div>

              <Switch
                checked={form.watch("isPublished")}
                onCheckedChange={(val) =>
                  form.setValue("isPublished", val)
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Course"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
