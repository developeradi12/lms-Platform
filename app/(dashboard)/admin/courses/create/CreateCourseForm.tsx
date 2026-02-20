"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import api from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { z } from "zod"
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
import { levelOptions, prerequisiteOptions, tagOptions } from "@/lib/course-option"
import { CourseCreateInput, CourseCreateSchema } from "@/schemas/courseSchema"

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
    resolver: zodResolver(CourseCreateSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      thumbnail: undefined,
      categories: [],
      tags: [],
      prerequisites: [],
      level: 'BEGINNER',
      price: 0,
      duration: 0,
      isPublished: false,
    }
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

      console.log("🟢 Raw Form Values:", values)

      const formData = new FormData()

      Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          console.log(`⏭ Skipping ${key} (null/undefined)`)
          return
        }

        if (Array.isArray(value)) {
          console.log(`📦 ${key} is Array:`, value)

          value.forEach((v) => {
            console.log(`   ➜ Appending ${key}:`, v)
            formData.append(key, String(v))
          })
        }
        else if (value instanceof File) {
          console.log(`🖼 ${key} is File:`, value.name, value.size, "bytes")

          formData.append(key, value)
        }
        else {
          console.log(`✏️ Appending ${key}:`, value)

          formData.append(key, String(value))
        }
      })

      // 🔥 Check final FormData content
      console.log("📤 Final FormData entries:")
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1])
      }

      const response = await api.post("/api/admin/courses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      console.log("✅ API Response:", response.data)

      toast.success("Course created successfully")
      router.push("/admin/courses")
    } catch (error: any) {
      console.error("❌ API Error:", error?.response?.data || error)
      toast.error(error?.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  /* ------------------ UI ------------------ */

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
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
            onSubmit={form.handleSubmit(onSubmit,
              (errors) => {
                console.log("❌ Validation Errors:", errors)
              })}
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
              <Controller
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <MultiSelect
                    options={tagOptions}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select tags..."
                  />
                )}
              />
            </div>

            {/* Prerequisites */}
            <div className="space-y-2">
              <Label>Prerequisites</Label>
              <Controller
                control={form.control}
                name="prerequisites"
                render={({ field }) => (
                  <MultiSelect
                    options={prerequisiteOptions}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select prerequisites..."
                  />
                )}
              />
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
              <Label>Thumbnail</Label>
              <Controller
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <ThumbnailUpload
                    value={field.value}
                    onChange={(file) =>
                      field.onChange(file)
                    }
                  />
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
