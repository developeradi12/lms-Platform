"use client"
import React, { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation";
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    description: z.string().optional(),
    image: z.string().min(1, "Image is required"),
    metaTitle: z.string().min(2, "Meta title is required"),
    metaDescription: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function EditCategoryPage() {

    const params = useParams()
    const router = useRouter()
    const id = params?.slug as string
    console.log(id);
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false);

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

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/admin/categories/${id}`);
            console.log("res", res);
            const category = res.data?.category

            if (!category) {
                toast.error("Category not found")
                router.push("/admin/categories")
                return
            }


            form.reset({
                name: category.name || "",
                description: category.description || "",
                image: category.image || "",
                metaTitle: category.metaTitle || "",
                metaDescription: category.metaDescription || "",
            })
        } catch (error:any) {
            toast.error(error?.response?.data?.message || "Failed to load category")
            router.push("/admin/categories")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchCategory();
    }, [id]);

    const onSubmit = async (values: FormValues) => {
        console.log("FORM VALUES:", values)
    try {
      setSaving(true)

      await axios.put(`/api/admin/categories/${id}`, values)

      toast.success("Category updated successfully")
      router.push("/admin/categories")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Update failed")
    } finally {
      setSaving(false)
    }
  }


    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-56 rounded-xl" />
                <Skeleton className="h-[420px] w-full rounded-2xl" />
            </div>
        )
    }
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Edit Category</h1>
                <p className="text-sm text-muted-foreground">
                    Update your category details
                </p>
            </div>

            <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                        Category Form
                    </CardTitle>
                </CardHeader>

                <CardContent >
                    <form  onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input
                                className="rounded-xl"
                                placeholder="e.g. Web Development"
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
                            <Textarea
                                className="rounded-xl min-h-[100px]"
                                placeholder="Optional description..."
                                {...form.register("description")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input
                                className="rounded-xl"
                                placeholder="https://..."
                                {...form.register("image")}
                            />
                            {form.formState.errors.image && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.image.message}
                                </p>
                            )}

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

                        <div className="space-y-2">
                            <Label>Meta Title</Label>
                            <Input
                                className="rounded-xl"
                                placeholder="SEO title..."
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
                            <Textarea
                                className="rounded-xl min-h-[90px]"
                                placeholder="SEO description..."
                                {...form.register("metaDescription")}
                            />
                        </div>  <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => router.push("/admin/categories")}
                            >
                                Cancel
                            </Button>

                            <Button type="submit" className="rounded-xl cursor-pointer" disabled={saving}>
                                {saving ? "Saving..." : "Update Category"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}