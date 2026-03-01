import Pagination from "./_components/Pagination"
import CourseList from "./_components/CourseList"
import connectDb from "@/lib/db"
import "@/models/Category"
import "@/models/User"
import SearchInput from "./_components/SearchInput"
import Filters from "./_components/filters"

import { categoryService } from "@/lib/service/category"
import { getCourses } from "@/lib/service/course"
import Category from "@/models/Category"
import { PublicCategory } from "@/types"
import { CategoryDocument } from "@/types/db"

interface Props {
  searchParams: Promise<{
    page?: string
    search?: string
    categories?: string
    price?: string
  }>
}

export default async function CoursesPage({ searchParams }: Props) {
  await connectDb()

  // Parse query params
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = 10
  const skip = (page - 1) * limit
  const search = params.search || ""
  const categoriesQuery = params.categories || ""
  const price = params.price || ""

const categories: PublicCategory[] = (
  await Category.find().lean<CategoryDocument[]>()
).map(cat => ({
  _id: String(cat._id),
  name: cat.name,
  description: cat.description,
  image: cat.image,
  slug: cat.slug,
  createdAt: cat.createdAt.toISOString(),
  updatedAt: cat.updatedAt.toISOString(),
}))

  // Fetch courses and total count in parallel
  const { total, courses } = await getCourses({ search, categories: categoriesQuery, price, skip, limit })
  const totalPages = Math.ceil(total / limit)


  return (
    <>

      <div className="min-h-screen bg-background">

        {/* ---------------- HEADER SECTION ---------------- */}
        <section className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-6 py-12">

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Course Catalog
            </h1>

            <p className="mt-3 text-muted-foreground max-w-2xl">
              Browse our full library of expert-led courses. Find the perfect
              course to advance your skills and career.
            </p>

            {/* Search + Filters */}
            <div className="mt-8 flex flex-col md:flex-row items-center gap-4">

              {/* Search */}
              <div className="w-full md:flex-1">
                <SearchInput />
              </div>

              {/* Filters */}
              <div className="w-full md:w-auto">
                <Filters categories={categories} />
              </div>

            </div>
          </div>
        </section>

        {/* ---------------- MAIN CONTENT ---------------- */}
        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {courses.length}
              </span>{" "}
              course{courses.length !== 1 ? "s" : ""}
            </p>

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                search={search}
                category={categoriesQuery}
                price={price}
              />
            )}
          </div>

          {/* Course Grid */}
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
                <span className="text-muted-foreground text-xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold">
                No courses found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <CourseList courses={courses} />
            </div>
          )}

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <Pagination
                page={page}
                totalPages={totalPages}
                search={search}
                category={categoriesQuery}
                price={price}
              />
            </div>
          )}

        </div>
      </div>

    </>
  )
}
