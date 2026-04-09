"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { toast } from "sonner"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

export const assignmentSchema = z.object({
  courseId: z.string(),
  lessonTitle: z.string().optional(),
  description: z.string().optional(),
  file: z
    .any()
    .refine((file) => !file || file instanceof File, "Invalid file")
    .optional(),
})

export type AssignmentFormData = z.infer<typeof assignmentSchema>

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      courseId: "",
      lessonTitle: "",
      description: "",
      file: undefined,
    },
  })

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/api/user/submission")
      setAssignments(res.data.assignments || [])
    } catch {
      toast.error("Failed to load assignments")
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await api.get("/api/admin/courses")
      setCourses(res.data.courses || [])
    } catch {
      toast.error("Failed to load courses")
    }
  }

  useEffect(() => {
    fetchAssignments()
    fetchCourses()
  }, [])

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      setLoading(true)

      const formData = new FormData()

      if (data.file) formData.append("file", data.file)
      if (data.courseId) formData.append("courseId", data.courseId)
      if (data.lessonTitle)
        formData.append("lessonTitle", data.lessonTitle)
      if (data.description)
        formData.append("description", data.description)

      await api.post("/api/user/submission", formData)

      toast.success("Assignment submitted")

      form.reset()
      setOpen(false)
      fetchAssignments()
    } catch {
      toast.error("Submission failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Assignments</h1>

        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
        >
          Upload Assignment
        </button>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Course</th>
              <th className="p-3 text-left">Lesson</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">File</th>
            </tr>
          </thead>

          <tbody>
            {assignments.map((item) => (
              <tr key={item._id} className="border-t">

                <td className="p-3">{item.courseTitle || "-"}</td>
                <td className="p-3">{item.lessonTitle || "-"}</td>

                <td className="p-3">
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                    {item.status || "PENDING"}
                  </span>
                </td>

                <td className="p-3">
                  {item.fileUrl ? (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      className="underline text-xs"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No file
                    </span>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-5">

            <h2 className="text-lg font-semibold">
              Upload Assignment
            </h2>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >

              {/* Course Dropdown */}
              <div>
                <label className="text-sm">Course</label>
                <select
                  {...form.register("courseId")}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select course (optional)</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson Title */}
              <div>
                <label className="text-sm">Lesson Title</label>
                <input
                  {...form.register("lessonTitle")}
                  placeholder="Type lesson name"
                  className="w-full border p-2 rounded"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm">Description</label>
                <textarea
                  {...form.register("description")}
                  placeholder="Write your thoughts..."
                  className="w-full border p-2 rounded"
                />
              </div>

              {/* File */}
              <div>
                <label className="text-sm">File</label>
                <input
                  type="file"
                  className="flex flex-col"
                  onChange={(e) =>
                    form.setValue("file", e.target.files?.[0])
                  }
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-white rounded"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

