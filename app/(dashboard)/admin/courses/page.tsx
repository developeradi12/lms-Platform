"use client"

import Link from "next/link"
import React, { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { BookOpen } from "lucide-react"

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
import { Pencil, Plus, Search, Trash2 } from "lucide-react"
import slugify from "slugify"
import api from "@/lib/api"


type Course = {
  slug: string
  _id: string
  title: string
  price: number
  isPublished: boolean
  category?: {
    _id: string
    name: string
  }
  chaptersCount?: number
  createdAt: string
}

export default function AdminCoursesPage() {
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)


  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/admin/courses")

      setCourses(res.data?.courses || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase().trim()

    return courses.filter((c) => {
      return (
        c.title.toLowerCase().includes(q) ||
        (c.category?.name || "").toLowerCase().includes(q)
      )
    })
  }, [courses, search])

  const handleDelete = async (slug: string) => {
    try {
      setDeletingId(slug)
      await api.delete(`/api/admin/courses/${slug}`)
      toast.success("Course deleted")
      fetchCourses()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Delete failed")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Courses</h1>
          <p className="text-sm text-muted-foreground">
            Manage all your courses from here.
          </p>
        </div>

        <Button asChild className="rounded-xl">
          <Link href="/admin/courses/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card className="rounded-2xl ">
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>
            Search, view, edit or delete your courses.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="pl-9 rounded-xl"
            />
          </div>

          {/* Table */}
          <div className="rounded-xl border overflow-hidden">
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-3">Title</TableHead>
                    <TableHead className="px-4 py-3">Price</TableHead>
                    <TableHead className="px-4 py-3">Status</TableHead>

                    <TableHead className="px-4 py-3 hidden md:table-cell">Created</TableHead>
                    <TableHead className="px-4 py-3 hidden md:table-cell">Total Chapter</TableHead>
                    <TableHead className="px-4 py-3 hidden md:table-cell">Curriculum</TableHead>
                    <TableHead className="px-4 py-3">Actions</TableHead>
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
                  ) : filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 ">
                        No courses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((course) => (
                      <TableRow key={course._id} className="">
                        <TableCell className="py-3 px-4 align-middle">
                          {course.title.trim().slice(0, 20)}
                        </TableCell>

                        <TableCell className="py-3 px-4 align-middle">
                          {course.price === 0 ? "Free" : `₹${course.price}`}
                        </TableCell>

                        <TableCell className="py-3 px-4 align-middle">
                          <Badge
                            className="rounded-xl"
                            variant={course.isPublished ? "default" : "outline"}
                          >
                            {course.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-sm py-3 px-4 text-muted-foreground hidden md:table-cell">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="py-3 px-4 align-middle hidden md:table-cell">
                          <Badge variant="secondary" className="rounded-xl">
                            {course.chaptersCount ?? 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle hidden md:table-cell">
                          <Button asChild variant="secondary" className="rounded-xl">
                            <Link href={`/admin/courses/${course.slug}/chapters`}>
                              <BookOpen className="mr-2 h-4 w-4" />
                              Chapters
                            </Link>
                          </Button>
                        </TableCell>


                        <TableCell className="py-3 px-4 align-middle">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
                            {/* Edit */}
                            <Button
                              asChild
                              size="icon"
                              variant="outline"
                              className="rounded-xl"
                            >
                              <Link href={`/admin/courses/${course.slug}/edit`}>
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
                                    Delete Category?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the category.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="rounded-xl"
                                    onClick={() => handleDelete(course.slug)}
                                    disabled={deletingId === course.slug}
                                  >
                                    {deletingId === course.slug
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
