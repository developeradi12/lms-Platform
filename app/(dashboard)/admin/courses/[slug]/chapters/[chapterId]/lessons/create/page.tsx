"use client"

import Link from "next/link"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getYoutubeId } from "@/lib/getYoutube"
import api from "@/lib/api"
import { Textarea } from "@/components/ui/textarea"
import { formSchema, LessonFormValues } from "@/schemas/lessonSchema"
import { uploadFile } from "@/utils/uploadFile"

type ResourceType = "NOTE" | "ASSIGNMENT";

export default function CreateLessonPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const chapterId = params.chapterId as string

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      duration: 0,
      isFreePreview: false,
    },
  })

  const isSubmitting = form.formState.isSubmitting
  const videoUrl = form.watch("videoUrl")
  const youtubeId = getYoutubeId(videoUrl)

  const onSubmit = async (values: LessonFormValues) => {
    try {
      const formData = new FormData();

      // normal fields
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      formData.append("videoUrl", values.videoUrl || "");
      formData.append("duration", String(values.duration));
      formData.append("isFreePreview", String(values.isFreePreview));

      // files
      values.resources?.forEach((item) => {
        formData.append("files", item.file);
        formData.append("types", item.type);
      });

      const res = await api.post(
        `/api/admin/courses/${slug}/chapters/${chapterId}/lessons`,
        formData
      )

      toast.success(res.data?.message || "Lesson created")
      router.push(`/admin/courses/${slug}/chapters/${chapterId}/lessons`)
      router.refresh()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create lesson")
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Lesson</h1>
          <p className="text-sm text-muted-foreground">
            Upload a video and create a lesson.
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-xl">
          <Link href={`/admin/courses/${slug}/chapters/${chapterId}/lessons`}>
            Back
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl max-w-5xl">
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
          <CardDescription>Fill details and upload video URL.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                placeholder="Example: What is React?"
                className="rounded-xl"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/*description */}
            <div className="space-y-2">
              <Label>Lesson Description</Label>
              <Textarea
                placeholder="Example: What is React?"
                className="rounded-xl"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input
                placeholder="https://youtube.com/..."
                className="rounded-xl"
                {...form.register("videoUrl")}
              />
              {form.formState.errors.videoUrl && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.videoUrl.message}
                </p>
              )}
            </div>

            {/* Video Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              {!videoUrl?.trim() ? (
                <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
                  Paste a YouTube URL to see preview.
                </div>
              ) : youtubeId ? (
                <div className="rounded-2xl border overflow-hidden">
                  <iframe
                    className="w-full aspect-video"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="YouTube Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="rounded-2xl border p-6 text-sm text-red-500">
                  Invalid YouTube URL.
                </div>
              )}
            </div>

            {/* Resources Upload */}
            <div className="space-y-3">
              <Label>Resources (Notes / Assignment)</Label>

              <Input
                type="file"
                multiple
                className="rounded-xl"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const existing = form.getValues("resources") || [];
                  const newFiles: { file: File; type: ResourceType }[] = files.map((file) => ({
                    file,
                    type: "NOTE",
                  }));
                  form.setValue("resources", [...existing, ...newFiles]);
                  e.target.value = "";
                }}
              />

              {/* File List */}
              {form.watch("resources")?.map((res, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 border p-3 rounded-xl"
                >
                  {/* File Info */}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{res.file?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(res.file?.size / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* NOTE */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...(form.getValues("resources") || [])];
                        updated[index].type = "NOTE";
                        form.setValue("resources", updated);
                      }}
                      className={`px-2 py-1 text-xs rounded ${res.type === "NOTE"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                        }`}
                    >
                      Note
                    </button>

                    {/* ASSIGNMENT */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...(form.getValues("resources") || [])];
                        updated[index].type = "ASSIGNMENT";
                        form.setValue("resources", updated);
                      }}
                      className={`px-2 py-1 text-xs rounded ${res.type === "ASSIGNMENT"
                        ? "bg-green-500 text-white"
                        : "bg-gray-200"
                        }`}
                    >
                      Assignment
                    </button>

                    {/* ❌ REMOVE BUTTON */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (form.getValues("resources") || []).filter(
                          (_, i) => i !== index
                        );
                        form.setValue("resources", updated);
                      }}
                      className="px-2 py-1 text-xs rounded bg-red-500 text-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                className="rounded-xl"
                {...form.register("duration", { valueAsNumber: true })}
              />
              {form.formState.errors.duration && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.duration.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Please fill video duration
              </p>
            </div>

            {/* Free Preview */}
            <div className="flex items-center gap-3">
              <Controller
                control={form.control}
                name="isFreePreview"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label className="cursor-pointer">Free Preview</Label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                className="rounded-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Uploading..." : "Create Lesson"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() =>
                  router.push(
                    `/admin/courses/${slug}/chapters/${chapterId}/lessons`
                  )
                }
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
