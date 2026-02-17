"use client"
import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation";
import { z } from "zod"
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

const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    description: z.string().optional(),
    image:z.string(),
    metaTitle: z.string().min(2, "Meta title is required"),
    metaDescription: z.string().optional(),
    slug: z.string().optional()
})

type FormValues = z.input<typeof formSchema>

export default function EditCategoryPage() {

    const params = useParams()
    const router = useRouter()
    const { slug } = useParams()
    console.log("check", slug);
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            image: undefined,
            metaTitle: "",
            metaDescription: "",
        },
    })

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/admin/categories/${slug}`);
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
                slug: category.slug
            })
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to load category")
            // router.push("/admin/categories")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (slug) fetchCategory();
    }, [slug]);

    const onSubmit = async (values: FormValues) => {
        console.log("SUBMIT TRIGGERED")
        console.log("FORM VALUES:", values)
        try {
            setSaving(true);
            console.log("values", values);
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (key === "image" && value) {
                    formData.append("image", value);
                } else {
                    formData.append(key, String(value));
                }
            });

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

                        <div className="space-y-2">
                            <Label>Image</Label>
                            <Input
                                className="rounded-xl"
                                placeholder="Paste image url..."
                                {...form.register("image")}
                            />

                            {form.watch("image")?.trim() ? (
                                <div className="mt-3 overflow-hidden rounded-2xl border">
                                    <img
                                        src={form.watch("image")}
                                        alt="image preview"
                                        className="w-full h-52 object-cover"
                                    />
                                </div>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                                className="rounded-xl"
                                placeholder="slug"
                                {...form.register("slug")}
                            />
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
            </Card >
        </div >
    )
}