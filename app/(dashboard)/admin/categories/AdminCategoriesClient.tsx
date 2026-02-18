"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Pencil, Plus, Search, Trash2 } from "lucide-react"

import api from "@/lib/api"
import { Category } from "@/schemas/categorySchema"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebounce } from "@/hooks/useDebounce"
import Pagination from "@/components/common/Pagination"
import { useQueryParams } from "@/hooks/useQueryParams"


type Props = {
  page: number
  search: string
  sort: string

}

export default function AdminCategoriesClient({ page, search, sort }: Props) {
  const limit = 10
  const [items, setItems] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { setParams } = useQueryParams()
  // UI search state
  const [query, setQuery] = useState(search)
  const [sortValue, setSortValue] = useState(sort)
  const userTypedRef = useRef(false)
  // keep UI in sync when URL changes
  useEffect(() => {
    setQuery(search)
    setSortValue(sort)
    userTypedRef.current = false
  }, [search, sort])


  const debouncedQuery = useDebounce(query, 500)

  // IMPORTANT: prevent resetting page to 1 on first mount
  const firstRun = useRef(true)

  // whenever search/sort changes => reset to page 1 (but not on first mount)
  useEffect(() => {
    if (!userTypedRef.current) return
    setParams(
      {
        page: 1,
        search: debouncedQuery,
        sort: sortValue,
      },
      { replace: true }
    )
  }, [debouncedQuery, sortValue, setParams])

  // when sort changes (user action)
  useEffect(() => {
    setParams({ page: 1, search: query, sort: sortValue })
  }, [sortValue])

  const fetchCategories = async () => {
    try {
      setLoading(true)

      const res = await api.get("/api/admin/categories", {
        params: {
          page,
          limit,
          search,
          sort,
        },
      })
      setItems(res.data?.categories || [])
      setTotal(res.data?.total || 0)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [page, search, sort])


  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / limit))
  }, [total])

  const goToPage = (p: number) => {
    setParams({ page: p, search, sort })
  }

  const handleDelete = async (slug: string) => {
    try {
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
          <CardTitle className="text-base">Search & Filter</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 rounded-xl"
                placeholder="Search by name, slug, meta title..."
                value={query}
                onChange={(e) => {
                  userTypedRef.current = true
                  setQuery(e.target.value)
                }}
              />
            </div>

            {/* Sort */}
            <Select value={sortValue} onValueChange={setSortValue}>
              <SelectTrigger className="w-full sm:w-[220px] rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name_asc">Name A-Z</SelectItem>
                <SelectItem value="name_desc">Name Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            All Categories
            <Badge variant="secondary" className="rounded-xl">
              {total}
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
          ) : items.length === 0 ? (
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
                      <TableHead className="px-4 py-3 hidden md:table-cell">
                        Meta Title
                      </TableHead>
                      <TableHead className="px-4 py-3 hidden md:table-cell">
                        Created
                      </TableHead>
                      <TableHead className="px-4 py-3">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {items.map((cat) => (
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
                          <Badge variant="outline" className="rounded-xl">
                            {cat.slug}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {cat.description?.trim().slice(0, 30)}
                        </TableCell>

                        <TableCell className="hidden md:table-cell">
                          {cat.metaTitle || "-"}
                        </TableCell>

                        <TableCell className="hidden md:table-cell">
                          {new Date(cat.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="py-3 px-4 align-middle">
                          <div className="flex gap-2 justify-end">
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
                                    This action cannot be undone.
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

          {/* Pagination */}
          {/* {!loading && totalPages > 1 && ( */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
          {/* )} */}
        </CardContent>
      </Card>
    </div>
  )
}