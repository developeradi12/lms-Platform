import Pagination from "./_components/Pagination"
import CourseList from "./_components/CourseList"
import connectDb from "@/lib/db"
import { Course } from "@/models/Course"
import "@/models/Category"
import "@/models/User"
import SearchInput from "./_components/SearchInput"
import Filters from "./_components/filters"
import Category from "@/models/Category"
import { Category as CategoryType, CourseSerialized } from "@/types/course"

interface Props {
  searchParams: Promise<{
    page?: string
    search?: string
    category?: string
    price?: string
  }>
}

export default async function CoursesPage({ searchParams }: Props) {
  await connectDb()

  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = 10
  const skip = (page - 1) * limit

  const search = params.search || ""
  const category = params.category || ""
  const price = params.price || ""
  const categoriesRaw = await Category.find()
    .select("name slug")
    .lean<CategoryType[]>()
  const categories = categoriesRaw.map((cat) => ({
    _id: cat._id.toString(),
    name: cat.name,
    slug: cat.slug,
  }))
  const query: any = { isPublished: true }
  if (search) {
    query.title = { $regex: search, $options: "i" }
  }
  /*{Note}
   * $regex: search
          Regex ka matlab hai Regular Expression.
            Normal search mein agar aap "Javascript" dhundenge, toh wo exact match dhundega.
      $regex ke saath, agar user sirf "Java" likhega,toh bhi 
      use "Javascript" aur "Java for Beginners" dono mil jayenge. Yeh "pattern matching" karta hai.

    *  $options: "i" 
       Yahan "i" ka matlab hai In-sensitive (Case-insensitive).
      Iske bina: Agar database mein "Python" likha hai aur user ne "python" (small p) search kiya, toh kuch nahi milega.
"i" ke saath: User PYTHON, python, ya PyThOn kuch bhi likhe, result mil jayega.
  */

  if (category && category !== "all") {
    query.category = category
  }

  if (price === "free") {
    query.price = 0
  }

  if (price === "paid") {
    query.price = { $gt: 0 }
  }
  const total = await Course.countDocuments(query)
  const courses = await Course.find(query)
    .populate("category")
    .populate("instructor")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean<CourseSerialized[]>()

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Explore Courses</h1>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">

        {/* Search Input Container - Desktop par 60% width lega */}
        <div className="w-full md:w-3/5">
          <SearchInput />
        </div>

        {/* Filters Container - Desktop par right aligned */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <Filters categories={categories} />

          {/* Optional: Clear Filters Button yahan add kar sakte hain */}
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
            category={category}
            price={price}
          />
        </>
      )}
    </div>
  )
}
