"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import axios from "axios"
import { toast } from "sonner"


const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  image: z.string().min(1, "Image is required"),
  metaTitle: z.string().min(2, "Meta title is required"),
  metaDescription: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateCategoryPage() {


  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      metaTitle: "",
      metaDescription: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    console.log("FORM VALUES:", values)
    try {
      setLoading(true)

      await axios.post(`/api/admin/categories`, values)
      toast.success("Category uploaded successfully")
      router.push("/admin/categories")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="p-6 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Category</h1>
          <p className="text-sm text-muted-foreground">
            Add a new category for your courses.
          </p>
        </div>

        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/admin/categories">Back</Link>
        </Button>
      </div>

      {/* Form Card */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>
            Category name should be unique and meaningful.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label>Category Name *</Label>
              <Input
                className="rounded-xl"
                placeholder="Eg: Frontend, Backend, DSA..."
                disabled={loading}
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                className="rounded-xl"
                placeholder="Optional description..."
                disabled={loading}
                {...form.register("description")}
              />
            </div>

            {/* Image */}
            <div className="space-y-2">
              <Label>Image URL *</Label>
              <Input
                className="rounded-xl"
                placeholder="https://..."
                disabled={loading}
                {...form.register("image")}
              />
              {form.formState.errors.image && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.image.message}
                </p>
              )}

              {/* Preview */}
              {form.watch("image")?.trim() ? (
                <div className="mt-3 overflow-hidden rounded-2xl border">
                  <img
                    src={form.watch("image")}
                    alt="preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              ) : null}
            </div>

            {/* Meta Title */}
            <div className="space-y-2">
              <Label>Meta Title *</Label>
              <Input
                className="rounded-xl"
                placeholder="SEO title..."
                disabled={loading}
                {...form.register("metaTitle")}
              />
              {form.formState.errors.metaTitle && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.metaTitle.message}
                </p>
              )}
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Input
                className="rounded-xl"
                placeholder="SEO description..."
                disabled={loading}
                {...form.register("metaDescription")}
              />
            </div>

            {/* Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl"
            >
              {loading ? "Creating..." : "Create Category"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}