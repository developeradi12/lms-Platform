"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import api from "@/lib/api"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

import ThumbnailUpload from "@/components/Upload"
import { MultiSelect } from "@/components/multiSelect"

import { CourseUpdateInput, CourseUpdateSchema } from "@/schemas/courseSchema"
import { levelOptions } from "@/lib/course-option"
import { CategorySerialized } from "@/types/category"
import { CourseSerialized } from "@/types/course"

interface Props {
    course: CourseSerialized
    categories: CategorySerialized[]
}

export default function EditCourseForm({ course, categories }: Props) {

    const router = useRouter()
    const [saving, setSaving] = useState(false)

    const form = useForm<CourseUpdateInput>({
        resolver: zodResolver(CourseUpdateSchema),
        defaultValues: {
            title: course?.title ?? "",
            description: course?.description ?? "",
            thumbnailUrl: course?.thumbnail ?? "",
            thumbnailFile: undefined,
            categories: course?.categories?.map((c: any) => typeof c === "string" ? c : c._id?.toString()) ?? [],
            price: course?.price ?? 0,
            duration: course?.duration ?? 0,
            level: course?.level ?? "BEGINNER",
            isPublished: course?.isPublished ?? false,
            tags: course?.tags ?? [],
            prerequisites: course?.prerequisites ?? [],
            metaTitle: course?.metaTitle,
            metaDescription: course.metaDescription,
        },
    })
    /* -------------------------
       Category Options
    ------------------------- */

    const categoryOptions = useMemo(() => {

        if (!Array.isArray(categories)) return []

        return categories.map((cat) => ({
            label: cat.name,
            value: cat._id.toString(),
        }))

    }, [categories])

    /* -------------------------
       Submit
    ------------------------- */

    const onSubmit = async (values: CourseUpdateInput) => {

        try {

            setSaving(true)

            const formData = new FormData()

            Object.entries(values).forEach(([key, value]) => {

                if (key === "thumbnailFile" && value instanceof File) {
                    formData.append("thumbnail", value)
                    return
                }

                if (Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value))
                }

                else if (value !== undefined && value !== null) {
                    formData.append(key, String(value))
                }

            })

            await api.put(`/api/admin/courses/${course.slug}`, formData)

            toast.success("Course updated successfully")

            router.push("/admin/courses")

        } catch (error: any) {

            toast.error(error?.response?.data?.message || "Update failed")

        } finally {

            setSaving(false)

        }

    }

    return (
        <div className=" space-y-6  max-w-7xl ">

            {/* Header */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold">Edit Course</h1>
                    <p className="text-sm text-muted-foreground">
                        Update your course details
                    </p>
                </div>

                <Button variant="outline" asChild className="rounded-xl w-fit">
                    <Link href="/admin/courses">Back</Link>
                </Button>

            </div>

            {/* Form */}

            <Card className="rounded-2xl">

                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Course Form</CardTitle>
                </CardHeader>

                <CardContent>

                    <form
                        onSubmit={form.handleSubmit(onSubmit, (errors) => {
                            // console.log("Form Errors:", errors)
                        })}
                        className="space-y-6"
                    >

                        {/* Title */}

                        <div className="space-y-2">

                            <Label>Course Title *</Label>

                            <Input
                                placeholder="e.g. Web Development"
                                {...form.register("title")}
                            />

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
                                            onValueChange={(val) =>
                                                field.onChange(val[0] || "BEGINNER")
                                            }
                                            maxCount={1}
                                            closeOnSelect
                                        />
                                    )}
                                />

                            </div>

                            <div className="space-y-2">

                                <Label>Categories</Label>


                                <Controller
                                    control={form.control}
                                    name="categories"
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={categoryOptions}
                                            value={field.value ?? []}
                                            onValueChange={field.onChange}
                                        />
                                    )}
                                />

                            </div>

                        </div>

                        {/* Price + Duration */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

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

                        {/* SEO Fields */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="space-y-2">

                                <Label>Meta Title</Label>

                                <Input
                                    placeholder="SEO title"
                                    {...form.register("metaTitle")}
                                />

                            </div>

                            <div className="space-y-2">

                                <Label>Meta Description</Label>

                                <Textarea
                                    placeholder="SEO description"
                                    {...form.register("metaDescription")}
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
                                    <Input
                                        placeholder="react, nextjs, nodejs"
                                        value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value
                                                    .split(",")
                                                    .map((t) => t.trim())
                                                    .filter(Boolean)
                                            )
                                        }
                                    />
                                )}
                            />

                            <p className="text-xs text-muted-foreground">
                                Separate tags using commas
                            </p>

                        </div>

                        {/* Prerequisites */}

                        <div className="space-y-2">

                            <Label>Prerequisites</Label>

                            <Controller
                                control={form.control}
                                name="prerequisites"
                                render={({ field }) => (
                                    <Textarea
                                        placeholder="HTML, CSS basics"
                                        value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value
                                                    .split(",")
                                                    .map((p) => p.trim())
                                                    .filter(Boolean)
                                            )
                                        }
                                    />
                                )}
                            />

                        </div>

                        {/* Previous Thumbnail */}

                        {course.thumbnail && (

                            <div className="space-y-2">

                                <Label>Current Thumbnail</Label>

                                <div className="overflow-hidden rounded-xl border">
                                    <img
                                        src={course.thumbnail}
                                        alt="Course Thumbnail"
                                        className="w-full h-44 sm:h-56 object-cover"
                                    />
                                </div>

                            </div>

                        )}

                        {/* Upload Thumbnail */}

                        <div className="space-y-2">

                            <Label>Upload New Thumbnail</Label>

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

                        </div>

                        {/* Publish */}

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border p-4">

                            <div>

                                <p className="font-medium">Publish Course</p>

                                <p className="text-sm text-muted-foreground">
                                    If enabled, course will be visible to students.
                                </p>

                            </div>

                            <div className="flex items-center gap-3">

                                <Badge
                                    variant={
                                        form.watch("isPublished") ? "default" : "outline"
                                    }
                                >
                                    {form.watch("isPublished") ? "Published" : "Draft"}
                                </Badge>

                                <Switch
                                    checked={form.watch("isPublished")}
                                    onCheckedChange={(v) =>
                                        form.setValue("isPublished", v)
                                    }
                                />

                            </div>

                        </div>

                        {/* Buttons */}

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => router.push("/admin/courses")}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto"
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