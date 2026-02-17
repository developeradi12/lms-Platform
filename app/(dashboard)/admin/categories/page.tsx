"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import api from "@/lib/api"

type Category = {
  _id: string
  name: string
  slug: string
  description?: string
  image: string
  metaTitle: string
  metaDescription?: string
  createdAt: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const q = search.toLowerCase()
      return (
        cat.name.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        (cat.metaTitle || "").toLowerCase().includes(q)
      )
    })
  }, [categories, search])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/admin/categories")
      console.log(res);
      setCategories(res.data?.categories || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDelete = async (slug: string) => {
    try {
      console.log("slug", slug);
      setDeletingId(slug)
      await api.delete(`/api/admin/categories/${slug}`)
      toast.success("Category deleted")
      fetchCategories()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Delete failed")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage all course categories here.
          </p>
        </div>

        <Button asChild className="rounded-xl">
          <Link href="/admin/categories/create">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative  w-full sm:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 rounded-xl"
              placeholder="Search by name, slug, meta title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            All Categories{" "}
            <Badge variant="secondary" className="ml-2 rounded-xl">
              {filteredCategories.length}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No categories found.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4 py-3">Image</TableHead>
                      <TableHead className="px-4 py-3">Name</TableHead>
                      <TableHead className="px-4 py-3">Slug</TableHead>
                      <TableHead className="px-4 py-3">Description</TableHead>
                      <TableHead className="px-4 py-3 hidden md:table-cell">Meta Title</TableHead>
                      <TableHead className="px-4 py-3 hidden md:table-cell">Meta Description</TableHead>
                      <TableHead className="px-4 py-3 hidden md:table-cell">Created</TableHead>
                      <TableHead className="px-4 py-3">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredCategories.map((cat) => (
                      <TableRow key={cat._id}>
                        <TableCell>
                          <div className="w-12 h-12 relative rounded-xl overflow-hidden border">
                            {cat.image ? (
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                No Image
                              </div>
                            )}

                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4 align-middle">
                          {cat.name}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="py-3 px-4 align-middle">
                            {cat.slug}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary" >
                            {cat.description?.trim().slice(0, 30)}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3 px-4 align-middle">
                          {cat.metaTitle}
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary" className="py-3 px-4 align-middle">
                            {cat.metaDescription?.trim().slice(0, 30)}
                          </Badge>
                        </TableCell>


                        <TableCell className="py-3 px-4 align-middle">
                          {new Date(cat.createdAt).toLocaleDateString()}
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
                              <Link href={`/admin/categories/${cat.slug}/edit`}>
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
                                    onClick={() => handleDelete(cat.slug)}
                                    disabled={deletingId === cat.slug}
                                  >
                                    {deletingId === cat.slug
                                      ? "Deleting..."
                                      : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
