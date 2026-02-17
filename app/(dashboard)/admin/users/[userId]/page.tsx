"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type User = {
  _id: string
  name: string
  email: string
  role: "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT"
}

export default function EditUserPage() {
  const params = useParams<{ userId: string }>()
  const slug = params?.userId
 const id = slug?.split("-").pop()
  console.log("from frontend",id);

  const router = useRouter()

  const [user, setUser] = useState<User>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  //  Fetch User
  const fetchUser = async () => {
    try {
      const res = await api.get(`/api/admin/users/${id}`)
      setUser(res.data.user)
    } catch (err: any) {
      toast.error("Failed to load user")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    fetchUser()
  }, [id])

  //Handle form change
  const handleChange = (field: keyof User, value: string) => {
    setUser(prev => prev ? { ...prev, [field]: value } : prev)
  }

  // PATCH CALL
  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)

      await api.patch(`/api/admin/users/${id}`, {
        name: user.name,
        email: user.email,
        role: user.role,
      })

      toast.success("User updated successfully 🚀")

      setTimeout(() => {
        router.push("/admin/users")
      }, 800)

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed")
    } finally {
      setSaving(false)
    }
  }

  //  Skeleton
  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Edit User</CardTitle>
          <CardDescription>
            Admin can modify user details and role.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Name */}
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={user.name}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              className="rounded-xl"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={user.email}
              onChange={(e) =>
                handleChange("email", e.target.value)
              }
              className="rounded-xl"
            />
          </div>

          {/* Role — SHADCN */}
          <div className="space-y-2">
            <Label>Role</Label>

            <Select
              value={user.role}
              onValueChange={(value) =>
                handleChange("role", value)
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="SUPER_ADMIN">
                  SUPER_ADMIN
                </SelectItem>
                <SelectItem value="ADMIN">
                  ADMIN
                </SelectItem>
                <SelectItem value="INSTRUCTOR">
                  INSTRUCTOR
                </SelectItem>
                <SelectItem value="STUDENT">
                  STUDENT
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.back()}
              className="rounded-xl"
            >
              Cancel
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
