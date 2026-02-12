"use client"

import React, { useEffect, useState } from "react"
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
import { Controller } from "react-hook-form";
import ThumbnailUpload from "@/components/Upload"

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  image: z.instanceof(File, { message: "Thumbnail is required" }),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),

})

type FormValues = z.input<typeof formSchema>

export default function CreateCategoryPage() {


  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      image: undefined, //Empty string will fail validation in some cases that why write undefined

      metaTitle: "",
      metaDescription: "",
    },
  })
  // const name = form.watch("name");
  // const description = form.watch("description");
  // const metaTitle = form.watch("metaTitle");
  // const metaDescription = form.watch("metaDescription");



  const onSubmit = async (values: FormValues) => {
    console.log("FORM VALUES:", values)
    try {
      setLoading(true)
      console.log("values", values);
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === "image" && value) {
          formData.append("image", value);
        } else if (value !== undefined && value !== "") {
          formData.append(key, String(value));
        }
      });
      await axios.post(`/api/admin/categories`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Category uploaded successfully")
      router.push("/admin/categories")
    } catch (error: any) {
      console.log(error.response?.data);
      alert(error.response?.data?.message); 
      toast.error(error?.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // useEffect(() => {

  //   // Fill metaTitle ONLY if empty
  //   if (!metaTitle && name) {
  //     form.setValue("metaTitle", name);
  //   }

  //   // Fill metaDescription ONLY if empty
  //   if (!metaDescription && description) {
  //     form.setValue("metaDescription", description);
  //   }

  // }, [name, description]);


  return (
    <div className=" max-w-full space-y-6">
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
            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <Controller
                control={form.control}
                name="image"
                render={({ field }) => (
                  <ThumbnailUpload
                    value={field.value}
                    onChange={(file) => field.onChange(file)}
                  />
                )}
              />


            </div>

            {/* Meta Title */}
            <div className="space-y-2">
              <Label>Meta Title (Optional)</Label>

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