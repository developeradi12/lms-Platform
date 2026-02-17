"use client"

import React, { useEffect, useMemo, useState } from "react"
import api from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"
import { Eye, Pencil, Search } from "lucide-react"

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
import { Skeleton } from "@/components/ui/skeleton"

import UserViewModal from "./_modal/user-view"

type User = {
  _id: string
  name: string
  email: string
  role: "STUDENT"
  enrolledCourses: number
  createdAt: string
}

export default function AdminStudentsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/admin/users")
      setUsers(res.data?.users || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase().trim()

    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [users, search])

  return (
    <div className="w-full space-y-6 px-3 sm:px-4 lg:px-0">
      <Card className="rounded-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl sm:text-2xl">All Students</CardTitle>
          <CardDescription>
            Manage registered students and view details.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Search + Total */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-9 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Total */}
            <Card className="rounded-2xl w-full lg:w-[280px]">
              <CardContent className="p-4 flex items-center justify-between">
                <p className="text-muted-foreground text-sm">Total Students</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <div className="rounded-xl border overflow-hidden">
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[650px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-3">Name</TableHead>

                    {/* Email hide on mobile */}
                    <TableHead className="px-4 py-3 hidden sm:table-cell">
                      Email
                    </TableHead>

                    {/* Joined hide on small */}
                    <TableHead className="px-4 py-3 hidden md:table-cell">
                      Joined
                    </TableHead>

                    <TableHead className="px-4 py-3 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4}>
                          <Skeleton className="h-10 w-full rounded-xl" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell className="py-10 text-center" colSpan={4}>
                        No students found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="px-4 py-4 font-medium">
                          <div className="flex flex-col">
                            <span className="font-semibold">{user.name}</span>

                            {/* Email show only on mobile (as subtext) */}
                            <span className="text-xs text-muted-foreground sm:hidden">
                              {user.email}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-4 hidden sm:table-cell">
                          {user.email}
                        </TableCell>

                        <TableCell className="px-4 py-4 text-muted-foreground text-sm hidden md:table-cell">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="px-4 py-4">
                          <div className="flex flex-col sm:flex-row justify-end gap-2">
                            {/* View */}
                            <Button
                              size="icon"
                              variant="outline"
                              className="rounded-xl"
                              onClick={() => {
                                setSelectedUser(user)
                                setOpen(true)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            {/* Edit */}
                            <Button
                              asChild
                              size="icon"
                              variant="outline"
                              className="rounded-xl"
                            >
                              <Link href={`/admin/users/${user._id}`}>
                                <Pencil className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Modal */}
          <UserViewModal user={selectedUser} open={open} onOpenChange={setOpen} />
        </CardContent>
      </Card>
    </div>
  )
}