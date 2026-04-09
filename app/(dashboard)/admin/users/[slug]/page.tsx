"use client"

import React, { useEffect, useState } from "react"
import api from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { createUserSlug } from "@/lib/slug"
import { ChevronDown, ChevronUp } from "lucide-react"

type WishlistItem = {
  _id: string
  title: string
  price: number
  thumbnail?: string
}

type EnrolledCourse = {
  _id: string
  course: {
    title: string
    price: number
    thumbnail?: string
  }
}

type UserDetail = {
  _id: string
  name: string
  email: string
  role: "STUDENT" | "INSTRUCTOR"
  avatar?: string
  bio?: string
  isVerified?: boolean
  status?: string
  enrolledCourses?: EnrolledCourse[]
  reviews?: any[]
  wishlist?: WishlistItem[]
  createdAt: string
  updatedAt: string
}

function AccordionSection({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">{title}</span>
          <span className="px-2.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
            {count}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-6 pt-2 border-t">
          {count === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No items found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ItemCard({
  title,
  price,
  thumbnail,
}: {
  title: string
  price: number
  thumbnail?: string
}) {
  return (
    <div className="border rounded-xl overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow">
      <div className="w-full h-36 bg-muted flex items-center justify-center overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-muted-foreground text-sm">No image</span>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-sm font-medium line-clamp-2">{title}</p>
        <p className="text-sm text-primary font-semibold">₹{price}</p>
      </div>
    </div>
  )
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()

  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
        ? params.slug[0]
        : ""

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    const fetchUser = async () => {
      try {
        setLoading(true)

        const id = slug.split("-").pop()

        if (!id) {
          router.push("/admin/users")
          return
        }

        const res = await api.get(`/api/admin/users/${id}`)
        const fetchedUser = res.data?.user
       console.log("fetchedUser",fetchedUser);
        if (!fetchedUser) {
          router.push("/admin/users")
          return
        }

        const correctSlug = createUserSlug(fetchedUser.name, fetchedUser._id)

        if (slug !== correctSlug) {
          router.replace(`/admin/users/${correctSlug}`)
          return
        }

        setUser(fetchedUser)
      } catch (err) {
        toast.error("Failed to load user")
        router.push("/admin/users")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [slug, router])

  if (loading) return <div className="p-6">Loading...</div>
  if (!user) return null

  return (
    <div className="p-6 space-y-6">

      {/* Profile Header */}
      <div className="bg-card border rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6 shadow-sm">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center text-3xl font-bold">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 space-y-1">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>

          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
              {user.role}
            </span>
            <span className={`px-3 py-1 text-xs rounded-full font-medium ${user.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}>
              {user.status}
            </span>
            {user.isVerified && (
              <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Enrolled Courses</p>
          <p className="text-2xl font-bold">{user.enrolledCourses?.length || 0}</p>
        </div>
        <div className="bg-card border rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Reviews</p>
          <p className="text-2xl font-bold">{user.reviews?.length || 0}</p>
        </div>
        <div className="bg-card border rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Wishlist</p>
          <p className="text-2xl font-bold">{user.wishlist?.length || 0}</p>
        </div>
      </div>

   
      <AccordionSection
        title="Enrolled Courses"
        count={user.enrolledCourses?.length || 0}
      >
        {user.enrolledCourses?.map((enroll) => (
          <ItemCard
            key={enroll._id}
            title={enroll.course.title}
            price={enroll.course.price}
            thumbnail={enroll.course.thumbnail}
          />
        ))}
      </AccordionSection>

      {/* Wishlist Accordion */}
      <AccordionSection title="Wishlist" count={user.wishlist?.length || 0}>
        {user.wishlist?.map((item) => (
          <ItemCard
            key={item._id}
            title={item.title}
            price={item.price}
            thumbnail={item.thumbnail}
          />
        ))}
      </AccordionSection>

      {/* About Section */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold">About</h2>
        <p className="text-sm text-muted-foreground">
          {user.bio || "No bio provided."}
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">User ID</p>
            <p className="font-medium">{user._id}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created At</p>
            <p className="font-medium">{new Date(user.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Updated</p>
            <p className="font-medium">{new Date(user.updatedAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Verification</p>
            <p className="font-medium">{user.isVerified ? "Verified" : "Not Verified"}</p>
          </div>
        </div>
      </div>

    </div >
  )
}