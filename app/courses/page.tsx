"use client"

import axios from "axios"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Course = {
  _id: string
  title: string
  price: number
  description: string
  thumbnail: string
  isPublished: boolean
  category?: {
    _id: string
    name: string
  }
  instructor?: {
    _id: string
    name: string
  }
  chaptersCount?: number
  createdAt: string
}

export default function CoursesPage() {
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])

  // UI state
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [priceType, setPriceType] = useState("all") // all | free | paid
  const [sort, setSort] = useState("latest") // latest | low | high | az

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await axios.get("/api/admin/courses")
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

  // slug generator
  const makeSlug = (title: string, id: string) => {
    const slugTitle = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

    return `${slugTitle}-${id}`
  }

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>()
    courses.forEach((c) => {
      if (c.category?.name) set.add(c.category.name)
    })
    return ["all", ...Array.from(set)]
  }, [courses])

  // Filter + Search + Sort
  const filteredCourses = useMemo(() => {
    let list = [...courses]

    // only published (public)
    list = list.filter((c) => c.isPublished)

    // price filter
    if (priceType === "free") list = list.filter((c) => c.price === 0)
    if (priceType === "paid") list = list.filter((c) => c.price > 0)

    // category filter
    if (category !== "all") {
      list = list.filter((c) => c.category?.name === category)
    }

    // search filter
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((c) => {
        const text = [
          c.title,
          c.description,
          c.category?.name,
          c.instructor?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        return text.includes(q)
      })
    }
    
    /* {Note :-
     Default behavior: of list sort function
               list.sort() rearranges elements of the array in place. 
               by default, it converts elements to strings and compares their UTF-16 code units } 
               
          Custom compare function:
                    When you pass (a, b) => ..., JavaScript uses the return value to decide order:

                     If result < 0 → a comes before b
                     If result > 0 → b comes before a
                     If result = 0 → order unchanged
              */

    // sort
    if (sort === "latest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }

    if (sort === "low") {
      list.sort((a, b) => a.price - b.price)
    }

    if (sort === "high") {
      list.sort((a, b) => b.price - a.price)
    }

    if (sort === "az") {
      list.sort((a, b) => a.title.localeCompare(b.title))
    }

    return list
  }, [courses, search, category, priceType, sort])

  return (
    <div>
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Explore Courses
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Search, filter, and pick the best course for you.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        {/* Search */}
        <div className="w-full md:max-w-sm">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="rounded-xl"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
          {/* Category */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price */}
          <Select value={priceType} onValueChange={setPriceType}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="low">Price: Low → High</SelectItem>
              <SelectItem value="high">Price: High → Low</SelectItem>
              <SelectItem value="az">Title: A → Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="rounded-2xl overflow-hidden">
              <Skeleton className="h-44 w-full" />
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-[80%]" />
                <Skeleton className="h-4 w-[60%]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[70%] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filteredCourses.length === 0 && (
        <div className="border rounded-2xl p-10 text-center">
          <h2 className="text-xl font-semibold">No courses found</h2>
          <p className="text-muted-foreground mt-2">
            Try changing search or filters.
          </p>
        </div>
      )}

      {/* Courses */}
      {!loading && filteredCourses.length > 0 && (
        <>
          {/* Count */}
          <p className="text-sm text-muted-foreground mb-4">
            Showing <span className="font-medium">{filteredCourses.length}</span>{" "}
            course(s)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => {
              const slug = makeSlug(course.title, course._id)

              return (
                <Link
                  key={course._id}
                  href={`/courses/${slug}`}
                  className="block"
                >
                  <Card className="rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    {/* Thumbnail */}
                    <div className="relative w-full h-44 bg-muted overflow-hidden">
                      <img
                        src={course.thumbnail || "/placeholder.png"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Free/Paid badge */}
                      <div className="absolute top-3 left-3">
                        {course.price === 0 ? (
                          <Badge className="rounded-xl">Free</Badge>
                        ) : (
                          <Badge variant="secondary" className="rounded-xl">
                            Paid
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-1">
                        {course.title}
                      </CardTitle>

                      <CardDescription className="line-clamp-2">
                        {course.description || "No description available."}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Meta */}
                      <div className="flex flex-wrap gap-2">
                        {course.category?.name && (
                          <Badge variant="outline" className="rounded-xl">
                            {course.category.name}
                          </Badge>
                        )}

                        {course.instructor?.name && (
                          <Badge variant="outline" className="rounded-xl">
                            {course.instructor.name}
                          </Badge>
                        )}

                        {typeof course.chaptersCount === "number" && (
                          <Badge variant="outline" className="rounded-xl">
                            {course.chaptersCount} chapters
                          </Badge>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Price</p>

                        <p className="font-semibold">
                          {course.price === 0 ? "Free" : `₹${course.price}`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
