"use client"

import Link from "next/link"
import React, { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { BookOpen, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useParams } from "next/navigation"

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

type Chapter = {
  _id: string
  title: string
  course?: {
    _id: string
    title?: string
    name?: string
  }
  order: number
  createdAt: string
  lessonsCount?: number
}

export default function AdminChaptersPage() {
  const params = useParams()
  const id = params.courseId as string
  console.log("cousred", id);
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchChapters = async () => {
    try {
      setLoading(true)

      const res = await axios.get(`/api/admin/courses/${id}/chapters`)
      console.log("fetch", res);
      setChapters(res.data?.chapters || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load chapters")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    fetchChapters()
  }, [id])

  const filteredChapters = useMemo(() => {
    const q = search.toLowerCase().trim()

    return chapters.filter((c) => {
      const courseName = c.course?.title || c.course?.name || ""
      return (
        c.title.toLowerCase().includes(q) || courseName.toLowerCase().includes(q)
      )
    })
  }, [chapters, search])

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)

      //  correct route (lowercase)
      await axios.delete(`/api/admin/courses/${id}/chapters/${id}`)

      toast.success("Chapter deleted")
      fetchChapters()
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
          <h1 className="text-2xl font-semibold">Chapters</h1>
          <p className="text-sm text-muted-foreground">
            Manage all chapters of this course.
          </p>
        </div>

        <Button asChild className="rounded-xl">
          <Link href={`/admin/courses/${id}/chapters/create`}>
            <Plus className="mr-2 h-4 w-4" />
            Create Chapter
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>All Chapters</CardTitle>
          <CardDescription>
            Search, view, edit or delete your chapters.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chapters..."
              className="pl-9 rounded-xl"
            />
          </div>

          {/* Table */}
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chapter Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Total Lessons</TableHead>
                  <TableHead>Chapter Order</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Curriculum</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({ length: 7 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-10 w-full rounded-xl" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredChapters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      No chapters found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredChapters.map((chapter) => (
                    <TableRow key={chapter._id}>
                      <TableCell className="font-medium">
                        {chapter.title}
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className="rounded-xl">
                          {chapter.course?.title ||
                            chapter.course?.name ||
                            "Course"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="rounded-xl">
                          {chapter.lessonsCount ?? 0}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        <Badge variant="secondary" className="rounded-xl">
                          {chapter.order}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(chapter.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <Button
                          asChild
                          variant="secondary"
                          className="rounded-xl"
                        >
                          <Link
                            href={`/admin/courses/${id}/chapters/${chapter._id}/lessons`}
                          >
                            <BookOpen className="mr-2 h-4 w-4" />
                            Lessons
                          </Link>
                        </Button>
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
                              href={`/admin/courses/${id}/chapters/${chapter._id}/edit`}
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
                                  Delete chapter?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will also
                                  delete all lessons inside this chapter.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">
                                  Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction
                                  className="rounded-xl"
                                  onClick={() => handleDelete(chapter._id)}
                                  disabled={deletingId === chapter._id}
                                >
                                  {deletingId === chapter._id
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