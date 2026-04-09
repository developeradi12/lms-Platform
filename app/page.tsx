// import Image from "next/image"
// import Link from "next/link"
// import {
//   ArrowRight,
//   BookOpen,
//   CheckCircle,
//   Clock,
//   GraduationCap,
//   Play,
//   Star,
//   TrendingUp,
//   Users,
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Course } from "@/models/Course"
// import "@/models/Category"
// import "@/models/User"
// import connectDb from "@/lib/db"
// import { formatDuration } from "@/utils/formatDuration"
// import { PublicNav } from "@/components/public-nav"
// import { PublicFooter } from "@/components/public-footer"
// import Reveal from "@/components/animations/Reveal"
// import { serializeCourseDetails } from "@/lib/serializers"
// import Hero from "@/components/homeSection/HeroSection"
// import Testimonial from "@/models/testimonals"
// import TestimonialsSection from "@/components/homeSection/Testimonial"

// const features = [
//   {
//     icon: BookOpen,
//     title: "Expert-Led Courses",
//     description:
//       "Learn from industry professionals with real-world experience and proven teaching methods.",
//   },
//   {
//     icon: TrendingUp,
//     title: "Track Your Progress",
//     description:
//       "Monitor your learning journey with detailed analytics, streaks, and achievement milestones.",
//   },
//   {
//     icon: GraduationCap,
//     title: "Earn Certificates",
//     description:
//       "Complete courses and receive recognized certificates to showcase your new skills.",
//   },
//   {
//     icon: Users,
//     title: "Community Learning",
//     description:
//       "Join a vibrant community of learners and collaborate on projects and discussions.",
//   },
// ]



// const stats = [
//   { value: "50,000+", label: "Active Learners" },
//   { value: "200+", label: "Expert Courses" },
//   { value: "4.8", label: "Average Rating" },
//   { value: "95%", label: "Completion Rate" },
// ]

// export default async function HomePage() {
//   await connectDb();

//   const courses = await Course.find({ isPublished: true })
//     .populate({
//       path: "categories",
//       select: "name",
//       options: { lean: true }
//     })
//     .populate({
//       path: "instructor",
//       select: "name",
//       options: { lean: true }
//     })
//     .sort({ createdAt: -1 })
//     .lean()
//   const safeCourses = courses.map(serializeCourseDetails)
//   const popularCourses = safeCourses.slice(0, 4)

//   return (
//     <div className="min-h-screen flex flex-col bg-background">
//       {/* Navbar */}
//       <PublicNav />
//       <main className="flex-1">

//         <Hero />

//         {/* Stats Bar */}
//         <Reveal>
//           <section className="border-y border-border bg-card">
//             <div className="mx-auto max-w-7xl px-6 py-10">
//               <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
//                 {stats.map((stat) => (
//                   <div key={stat.label} className="text-center">
//                     <p className="text-3xl font-bold text-foreground font-[family-name:var(--font-heading)]">
//                       {stat.value}
//                     </p>
//                     <p className="mt-1 text-sm text-muted-foreground">
//                       {stat.label}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </section>
//         </Reveal>

//         {/* Features */}
//         <Reveal delay={100}>
//           <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
//             <div className="mx-auto max-w-2xl text-center">
//               <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl font-[family-name:var(--font-heading)] text-balance">
//                 Everything you need to learn effectively
//               </h2>
//               <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
//                 Our platform is designed to help you achieve your learning goals
//                 with the right tools and support.
//               </p>
//             </div>
//             <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
//               {features.map((feature) => (
//                 <Card
//                   key={feature.title}
//                   className="border-border bg-card group hover:border-primary/30 transition-colors"
//                 >
//                   <CardContent className="flex flex-col gap-4 p-6">
//                     <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
//                       <feature.icon className="size-6" />
//                     </div>
//                     <h3 className="text-lg font-semibold text-card-foreground font-[family-name:var(--font-heading)]">
//                       {feature.title}
//                     </h3>
//                     <p className="text-sm text-muted-foreground leading-relaxed">
//                       {feature.description}
//                     </p>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </section>
//         </Reveal>

//         {/* Popular Courses */}
//         <Reveal delay={100}>
//           <section className="bg-secondary/30">
//             <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
//               <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
//                 <div>
//                   <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl font-[family-name:var(--font-heading)] text-balance">
//                     Popular courses
//                   </h2>
//                   <p className="mt-3 text-lg text-muted-foreground">
//                     Start learning from our most enrolled courses today.
//                   </p>
//                 </div>
//                 <Button
//                   variant="outline"
//                   className="border-border text-foreground hover:text-black"
//                   asChild
//                 >
//                   <Link href="/courses">
//                     View All Courses
//                     <ArrowRight className="ml-2 size-4 " />
//                   </Link>
//                 </Button>
//               </div>
//               <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
//                 {popularCourses.map((course) => (
//                   <Link key={course._id} href={`/courses/${course.slug}`}>
//                     <Card className="group overflow-hidden p-0 border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all h-full flex flex-col">
//                       <div className="relative aspect-video  w-full overflow-hidden">
//                         <Image
//                           src={course.thumbnail}
//                           alt={course.title}
//                           fill
//                           className="object-cover transition-transform group-hover:scale-105"
//                         />
//                         <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
//                           {course.level}
//                         </Badge>
//                       </div>
//                       <CardContent className="flex flex-1 flex-col gap-2 p-4">
//                         <p className="text-xs font-medium text-primary">
//                           {course.categories?.map((cat) => cat.name).join(", ")}
//                         </p>
//                         <h3 className="text-sm font-semibold text-card-foreground line-clamp-2 font-[family-name:var(--font-heading)] group-hover:text-primary transition-colors">
//                           {course.title}
//                         </h3>
//                         <p className="mt-auto text-xs text-muted-foreground">
//                           {course.instructor?.name}
//                         </p>
//                         <p className="mt-auto text-xs text-muted-foreground">
//                           ₹{course.price}
//                         </p>
//                         <div className="flex items-center justify-between text-xs text-muted-foreground">
//                           <span className="flex items-center gap-1">
//                             <Star className="size-3 fill-chart-3 text-chart-3" />
//                             {course.averageRating}
//                           </span>
//                           <span className="flex items-center gap-1">
//                             <Clock className="size-3" />
//                             {formatDuration(course.duration)}
//                           </span>
//                           <span className="flex items-center gap-1">
//                             <Users className="size-3" />
//                             {/* {course.enrolled.toLocaleString()} */}
//                           </span>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   </Link>
//                 ))}
//               </div>
//             </div>
//           </section>
//         </Reveal>

//         <Reveal delay={100}>
//           <TestimonialsSection/>
//         </Reveal>

//         {/* CTA */}
//         <Reveal delay={100}>
//           <section className="bg-primary">
//             <div className="mx-auto max-w-7xl px-6 py-20 text-center">
//               <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl font-[family-name:var(--font-heading)] text-balance">
//                 Ready to start your learning journey?
//               </h2>
//               <p className="mx-auto mt-4 max-w-lg text-lg text-primary-foreground/80 leading-relaxed">
//                 Join over 50,000 learners already building skills and advancing
//                 their careers with LearnHub.
//               </p>
//               <div className="mt-8 flex flex-wrap justify-center gap-3">
//                 <Button
//                   size="lg"
//                   className="bg-background text-foreground hover:bg-background/90"
//                   asChild
//                 >
//                   <Link href="/courses">
//                     Get Started Free
//                     <ArrowRight className="ml-2 size-4" />
//                   </Link>
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   className="border-primary-foreground/30 text-gray-400 hover:bg-primary-foreground/10 hover:text-primary-foreground"
//                   asChild
//                 >
//                   <Link href="/courses">Browse Courses</Link>
//                 </Button>
//               </div>
//             </div>
//           </section>
//         </Reveal>
//       </main>
//       {/* Footer */}
//       <PublicFooter />
//     </div>
//   )
// }


import connectDb from "@/lib/db"
import "@/models/User"


import { getCourses } from "@/lib/service/course"
import Category from "@/models/Category"

import { serializeCategory } from "@/lib/serializers"
import Image from "next/image"
import { Label } from "@/components/ui/label"
import SearchInput from "./(pages)/courses/_components/SearchInput"
import Filters from "./(pages)/courses/_components/filters"
import Pagination from "./(pages)/courses/_components/Pagination"
import CourseList from "./(pages)/courses/_components/CourseList"
import { PublicNav } from "@/components/public-nav"
import { PublicFooter } from "@/components/public-footer"

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

  const rawCategories = await Category.find().lean()

  const categories = rawCategories.map(serializeCategory)

  // Fetch courses and total count in parallel
  const { total, courses } = await getCourses({ search, categories: categoriesQuery, price, skip, limit })
  const totalPages = Math.ceil(total / limit)


  return (
    <>
      <PublicNav />
      <div className="min-h-screen bg-background">

        {/* ---------------- HEADER SECTION ---------------- */}
        <section className="relative w-full h-[320px] md:h-[340px] overflow-hidden">

          {/* Background Image */}
          <Image
            src="/banner1.jpg"
            alt="Courses Banner"
            fill
            priority
            className="object-cover scale-105"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 via-blue-900/70 to-blue-800/60" />

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">

            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              Upgrade Your Skills 🚀
            </h1>

            <p className="mt-4 text-white/90 max-w-xl text-lg">
              Discover high-quality courses designed by experts. Learn faster,
              grow smarter, and achieve your career goals.
            </p>

          </div>
        </section>


        {/* Search + Filters Container */}
        <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
          <div className="w-full backdrop-blur-lg bg-background border rounded-2xl p-4">
            <div className="flex flex-col md:flex-row items-center gap-4 px-4">

              {/* Search */}
              <div className="w-full md:flex-1 ">
                <Label className="px-4 text-sm font-medium mb-1 block">
                  Search Courses
                </Label>
                <SearchInput />
              </div>

              {/* Filters */}
              <div className="w-full md:w-auto">
                <Label className="text-sm px-4 font-medium mb-1 block">
                  Filter by Category & Price
                </Label>
                <Filters categories={categories} />
              </div>

            </div>
          </div>
        </div>


        {/* ---------------- MAIN CONTENT ---------------- */}
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-20">

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
      <PublicFooter />
    </>
  )
}

