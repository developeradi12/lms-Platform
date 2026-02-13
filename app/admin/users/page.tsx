"use client"
import React, { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { toast } from "sonner"

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
import { Eye, Pencil, Search } from "lucide-react"
import UserViewModal from "./_modal/user-view"
import Link from "next/link"


type User = {
  _id: string
  name: string
  email: string,
  role:"STUDENT",
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
      const res = await axios.get("/api/admin/users")
      setUsers(res.data?.users || [])
      console.log(res.data)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])


  // ✅ search filter
  const filteredUsers = useMemo(() => {
    if (!search) return users

    const q = search.toLowerCase()

    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [users, search])

  // const handleDelete = async (id: string) => {
  //   const prevUsers = users // backup for rollback

  //   try {
  //     setDeletingId(id)

  //     // ✅ Optimistic UI
  //     setUsers((prev) => prev.filter((u) => u._id !== id))

  //     // ✅ API call
  //     await axios.delete(`/api/admin/users/${id}`)

  //     toast.success("Student deleted")
  //   } catch (error: any) {
  //     // rollback
  //     setUsers(prevUsers)

  //     toast.error(error?.response?.data?.message || "Delete failed")
  //   } finally {
  //     setDeletingId(null)
  //   }
  // }

  return (
    <div className="p-6 w-full">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            Manage registered students and view details.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-9 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Total */}
          <div className="mb-4">
            <Card className="rounded-2xl">
              <CardContent className="p-4 flex justify-between items-center">
                <p className="text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-3">Name</TableHead>
                  <TableHead className="px-6 py-3">Email</TableHead>
                  <TableHead className="px-6 py-3">Role</TableHead>
                  <TableHead className="px-6 py-3">Joined</TableHead>
                  <TableHead className="px-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-10 w-full rounded-xl" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell className="py-3 px-4 align-middle" colSpan={5}>
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="px-6 py-4 font-medium">
                        {user.name}
                      </TableCell>

                      <TableCell className="px-6 py-4 font-medium">
                        {user.email}
                      </TableCell>

                      <TableCell className="px-6 py-4 font-medium">
                        {/* <Badge variant="default" className="rounded-xl">
                          {user.role}
                        </Badge> */}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-muted-foreground text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="py-3 px-4 align-middle">
                        <div className="flex justify-end gap-2">
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

                          {/*edit*/}
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

          {/* Modal */}
          <UserViewModal user={selectedUser} open={open} onOpenChange={setOpen} />
        </CardContent>
      </Card>
    </div>
  )
}