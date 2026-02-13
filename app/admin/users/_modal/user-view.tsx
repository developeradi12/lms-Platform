"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"

type User = {
  _id: string
  name: string
  email: string
  role: "INSTRUCTOR" | "STUDENT"
  enrolledCourses?: number
  createdAt: string
  wishlist?: string[]
  review?: string[]
  order?: string[]
}

interface Props {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function UserViewModal({
  user,
  open,
  onOpenChange,
}: Props) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-3xl max-w-xl p-8"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">
            User Profile
          </DialogTitle>
        </DialogHeader>

        {/* PROFILE SECTION */}
        <div className="flex flex-col items-center gap-4 mt-6">

          <Avatar className="h-24 w-24 shadow-md">
            <AvatarFallback className="text-3xl bg-primary/10 text-primary">
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
            <h2 className="text-2xl font-semibold">
              {user.name}
            </h2>

            <Badge
              variant={user.role === "INSTRUCTOR" ? "default" : "secondary"}
              className="rounded-xl px-3 py-1 mt-1"
            >
              {user.role.toUpperCase()}
            </Badge>
          </div>
        </div>

        <Separator className="my-6" />

        {/* STATS CARDS */}
        <div className="grid grid-cols-3 gap-3 mb-6">

          <Card className="p-4 text-center rounded-2xl shadow-sm">
            <p className="text-xl font-bold">
              {user.enrolledCourses ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">
              Courses
            </p>
          </Card>

          <Card className="p-4 text-center rounded-2xl shadow-sm">
            <p className="text-xl font-bold">
              {user.order?.length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">
              Orders
            </p>
          </Card>

          <Card className="p-4 text-center rounded-2xl shadow-sm">
            <p className="text-xl font-bold">
              {user.review?.length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">
              Reviews
            </p>
          </Card>

        </div>

        <Separator className="my-4" />

        {/* DETAILS GRID */}
        <div className="space-y-4 text-sm">

          <div className="grid grid-cols-2 gap-4">
            <span className="text-muted-foreground">
              User ID
            </span>
            <span className="font-medium text-right text-xs break-all">
              {user._id}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <span className="text-muted-foreground">
              Email
            </span>
            <span className="font-medium text-right break-all">
              {user.email}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <span className="text-muted-foreground">
              Joined
            </span>
            <span className="font-medium text-right">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
