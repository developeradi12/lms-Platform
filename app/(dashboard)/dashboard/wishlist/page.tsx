"use client"

import api from "@/lib/api"
import { useEffect, useState } from "react"


export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([])

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    const res = await api.get("/api/wishlist")
    setWishlist(res.data.wishlist)
  }

  const toggleWishlist = async (courseId: string) => {
    await api.post("/api/wishlist/toggle", { courseId })
    fetchWishlist()
  }

  return (
    <div className="max-w-7xl mx-auto p-4 gap-6 ">

      <h1 className="text-3xl font-bold mb-10">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-muted/30">
          <p className="text-lg font-medium">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground mt-2">
            Explore courses and add them to your wishlist.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {wishlist.map((course) => {

            const instructorName =
              course.instructor?.name ||
              `${course.instructor?.firstName || ""} ${course.instructor?.lastName || ""}`.trim() ||
              "Instructor"

            const totalLessons =
              course.chapters?.reduce(
                (acc: number, ch: any) => acc + (ch.lessons?.length || 0),
                0
              ) || 0

            return (
              <div
                key={course._id}
                className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition bg-card"
              >

                {/* THUMBNAIL */}
                <div className="relative aspect-video">
                  <img
                    src={course.thumbnail || "/placeholder.png"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-5 space-y-3">

                  <h2 className="font-semibold text-lg line-clamp-2">
                    {course.title}
                  </h2>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>

                  <p className="text-sm">
                    By <span className="font-medium">{instructorName}</span>
                  </p>

                  {/* META */}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>⭐ {course.averageRating || 4.8}</span>
                    <span>📚 {totalLessons} lessons</span>
                  </div>

                  {/* PRICE */}
                  <p className="text-lg font-bold">
                    {course.price === 0 ? "Free" : `₹${course.price}`}
                  </p>

                  {/* ACTIONS */}
                  <div className="flex gap-2 pt-2">

                    <a
                      href={`/courses/${course.slug}`}
                      className="flex-1 text-center bg-primary text-white py-2 rounded-lg text-sm"
                    >
                      View Course
                    </a>

                    <button
                      onClick={() => toggleWishlist(course._id)}
                      className="flex-1 border py-2 rounded-lg text-sm hover:bg-destructive hover:text-white transition"
                    >
                      Remove
                    </button>

                  </div>

                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}