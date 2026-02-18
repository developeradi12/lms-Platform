"use client"
import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import api from "@/lib/api";
import { UpdateCategoryform, updateCategorySchema } from "@/schemas/categorySchema";
import ThumbnailUpload from "@/components/Upload";

export default function EditCategoryPage() {
    const router = useRouter()
    const params = useParams<{ slug: string }>()
    const slug = params.slug
    console.log("check", slug);
    const [loading, setLoading] = useState(true)

    const form = useForm<UpdateCategoryform>({
        resolver: zodResolver(updateCategorySchema),
        defaultValues: {
            name: "",
            description: "",
            imageUrl: "",
            imageFile: undefined,
            metaTitle: "",
            metaDescription: "",
        }
    })

    const isSubmitting = form.formState.isSubmitting
    const imageUrl = form.watch("imageUrl")

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/admin/categories/${slug}`);
            console.log("res", res);
            const category = res.data?.category

            if (!category) {
                toast.error("Category not found")
                router.replace("/admin/categories")
                return
            }
            form.reset({
                name: category.name ?? "",
                description: category.description ?? "",
                imageUrl: category.image ?? "",
                imageFile: undefined, // always empty initially
                metaTitle: category.metaTitle ?? "",
                metaDescription: category.metaDescription ?? "",
            })
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to load category")
            router.push("/admin/categories")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (slug) fetchCategory();
    }, [slug]);

    const onSubmit = async (values: UpdateCategoryform) => {
        // console.log("SUBMIT TRIGGERED")
        console.log("FORM VALUES:", values)
        try {
           setLoading(true)
            const formData = new FormData();
            if (values.name) formData.append("name", values.name)
            if (values.description) formData.append("description", values.description)
            if (values.metaTitle) formData.append("metaTitle", values.metaTitle)
            if (values.metaDescription) formData.append("metaDescription", values.metaDescription)
            if (values.imageFile) formData.append("image", values.imageFile)
            await api.put(`/api/admin/categories/${slug}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Category updated successfully")
            router.push("/admin/categories")
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Update failed")
        } finally {
            setLoading(false)
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        {/* OLD IMAGE PREVIEW */}
                        <div className="space-y-2">
                            <Label>Current Image</Label>

                            {imageUrl ? (
                                <div className="overflow-hidden rounded-2xl border">
                                    <img
                                        src={imageUrl}
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

                        {/* NEW IMAGE UPLOAD */}
                        <div className="space-y-2">
                            <Label>Upload New Image (Optional)</Label>

                            <Controller
                                control={form.control}
                                name="imageFile"
                                render={({ field }) => (
                                    <ThumbnailUpload
                                        value={field.value}
                                        onChange={(file) => field.onChange(file)}
                                    />
                                )}
                            />

                            {form.formState.errors.imageFile && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.imageFile.message as string}
                                </p>
                            )}
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
                                className="rounded-xl cursor-pointer"
                                disabled={isSubmitting}
                                onClick={() => router.push("/admin/categories")}
                            >
                                Cancel
                            </Button>

                            <Button type="submit"
                                className="rounded-xl cursor-pointer"
                                disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Update Category"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card >
        </div >
    )
}