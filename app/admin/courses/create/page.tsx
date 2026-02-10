"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { z } from "zod"
import { useForm } from "react-hook-form"
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
import { Skeleton } from "@/components/ui/skeleton"
import ThumbnailUpload from "@/components/Upload"
import { Controller } from "react-hook-form";

type Category = {
  _id: string
  name: string
  slug: string
}

const formSchema = z.object({
  title: z.string().min(2, "Course title is required"),
  description: z.string().optional(),
  thumbnail: z
    .any()
    .refine((file) => file instanceof File || file === undefined, {
      message: "Thumbnail is required",
    })
    .optional(),

  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0),
  duration: z.coerce.number().min(0).optional(),
  isPublished: z.boolean().default(false),
});

type FormValues = z.input<typeof formSchema>

export default function CreateCoursePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
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

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const res = await axios.get("/api/admin/categories")
      setCategories(res.data?.categories || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load categories")
    } finally {
      setCategoriesLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true)
      console.log("values", values);
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === "thumbnail" && value) {
          formData.append("thumbnail", value);
        } else {
          formData.append(key, String(value));
        }
      });

      await axios.post("/api/admin/courses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      toast.success("Course created successfully")
      router.push("/admin/courses")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Course</h1>
          <p className="text-sm text-muted-foreground">
            Add a new course for your platform.
          </p>
        </div>

        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/admin/courses">Back</Link>
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Fill all details carefully before publishing.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label>Course Title *</Label>
              <Input
                className="rounded-xl"
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
                className="rounded-xl min-h-[120px]"
                placeholder="Write course description..."
                {...form.register("description")}
              />
            </div>

            {/* Category + Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>

                {categoriesLoading ? (
                  <Skeleton className="h-10 w-full rounded-xl" />
                ) : (
                  <select
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                    {...form.register("category")}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}

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
                  placeholder="0 for Free"
                  {...form.register("price")}
                />
              </div>
            </div>

            {/* Duration + Thumbnail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Duration */}
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  className="rounded-xl"
                  placeholder="Eg: 120"
                  {...form.register("duration")}
                />
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
                      onChange={(file) => field.onChange(file)}
                    />
                  )}
                />


              </div>
            </div>

            {/* Thumbnail Preview
            {form.watch("thumbnail")?.trim() ? (
              <div className="overflow-hidden rounded-2xl border">
                <img
                  src={form.watch("thumbnail")}
                  alt="thumbnail preview"
                  className="w-full h-56 object-cover"
                />
              </div>
            ) : null} */}

            {/* Publish Switch */}
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <p className="font-medium">Publish Course</p>
                <p className="text-sm text-muted-foreground">
                  If enabled, course will be visible to students.
                </p>
              </div>

              <Switch
                checked={form.watch("isPublished")}
                onCheckedChange={(val) => form.setValue("isPublished", val)}
              />
            </div>

            <Button
              className="w-full rounded-xl"
              type="submit"
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
