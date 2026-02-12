"use client"

import Link from "next/link"
import React, { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { Pencil, Plus, Search, Trash2, Video } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Lesson = {
  _id: string
  title: string
  videoUrl?: string
  duration?: number
  isFreePreview?: boolean
  order: number
  createdAt: string
  slug:string
}

export default function AdminLessonsPage() {
  const params = useParams()

  const courseId = params.slug as string
  const chapterId = params.chapterId as string
  const slug = courseId;
console.log("courseId,chapterId",courseId,chapterId);
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchLessons = async () => {
    try {
      setLoading(true)

      const res = await axios.get(`/api/admin/courses/${slug}/chapters/${chapterId}/lessons`)
      console.log("fetchlessons res",res.data)
      setLessons(res.data?.lessons || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load lessons")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!chapterId) return
    fetchLessons()
  }, [chapterId])

  const filteredLessons = useMemo(() => {
    const q = search.toLowerCase().trim()

    return lessons.filter((l) => {
      const title = (l.title || "").toLowerCase()
      return title.includes(q)
    })
  }, [lessons, search])

  const handleDelete = async (slug: string) => {
    try {
      setDeletingId(slug)

      await axios.delete(`/api/admin/courses/${courseId}/chapters/${chapterId}/lessons/${slug}`)

      toast.success("Lesson deleted")
      fetchLessons()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Delete failed")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Lessons</h1>
          <p className="text-sm text-muted-foreground">
            Manage all lessons inside this chapter.
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={`/admin/courses/${courseId}/chapters`}>
              Back to Chapters
            </Link>
          </Button>

          <Button asChild className="rounded-xl">
            <Link
              href={`/admin/courses/${courseId}/chapters/${chapterId}/lessons/create`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Lesson
            </Link>
          </Button>
        </div>
      </div>

      {/* Search + Table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>All Lessons</CardTitle>
          <CardDescription>
            Search, edit, delete lessons and manage preview status.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lessons..."
                className="pl-9 rounded-xl"
              />
            </div>

            <Badge variant="secondary" className="rounded-xl">
              Total: {lessons.length}
            </Badge>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-10 w-full rounded-xl" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredLessons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      No lessons found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLessons.map((lesson) => (
                    <TableRow key={lesson._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          {lesson.title}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className="rounded-xl"
                          variant={lesson.isFreePreview ? "default" : "outline"}
                        >
                          {lesson.isFreePreview ? "Free" : "Paid"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {lesson.duration ? `${lesson.duration} min` : "—"}
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className="rounded-xl">
                          {lesson.order ?? 0}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(lesson.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit */}
                          <Button
                            asChild
                            size="icon"
                            variant="outline"
                            className="rounded-xl"
                          >
                            <Link
                              href={`/admin/courses/${courseId}/chapters/${chapterId}/lessons/${lesson.slug}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </Button>

                          {/* Delete */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="destructive"
                                className="rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete lesson?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">
                                  Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction
                                  className="rounded-xl"
                                  onClick={() => handleDelete(lesson.slug)}
                                  disabled={deletingId === lesson.slug}
                                >
                                  {deletingId === lesson.slug
                                    ? "Deleting..."
                                    : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


