import Pagination from "./_components/Pagination"
import CourseList from "./_components/CourseList"
import connectDb from "@/lib/db"
import "@/models/Category"
import "@/models/User"
import SearchInput from "./_components/SearchInput"
import Filters from "./_components/filters"

import { getAllCategories } from "@/lib/service/category"
import { getCourses } from "@/lib/service/course"

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

  const categories =await getAllCategories();

  // Fetch courses and total count in parallel
  const { total, courses } = await getCourses({ search, categories: categoriesQuery, price, skip, limit })
  const totalPages = Math.ceil(total / limit)


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Explore Courses</h1>

        {/* Search Input Container - Desktop par 60% width lega */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="w-full md:w-3/5">
            <SearchInput />
          </div>

          <div className="w-full md:w-auto flex items-center gap-2">
            <Filters categories={categories} />
            {/* Optional: Clear filters */}
            {/* <button className="text-sm text-blue-600 hover:underline px-2 whitespace-nowrap">
            Clear all
          </button> */}
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            No courses found.
          </div>
        ) : (
          <>
            <CourseList courses={courses} />

            <Pagination
              page={page}
              totalPages={totalPages}
              search={search}
              category={categoriesQuery}
              price={price}
            />
          </>
        )}
      </div>
      )
}
