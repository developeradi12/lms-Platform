import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  GraduationCap,
  Play,
  Star,
  TrendingUp,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Course } from "@/models/Course"
import "@/models/Category"
import "@/models/User"
import connectDb from "@/lib/db"
import { formatDuration } from "@/utils/formatDuration"
import { PublicNav } from "@/components/public-nav"
import { PublicFooter } from "@/components/public-footer"
import Reveal from "@/components/animations/Reveal"
import { serializeCourseDetails } from "@/lib/serializers"
import Hero from "@/components/homeSection/HeroSection"
import Testimonial from "@/models/testimonals"
import TestimonialsSection from "@/components/homeSection/Testimonial"

const features = [
  {
    icon: BookOpen,
    title: "Expert-Led Courses",
    description:
      "Learn from industry professionals with real-world experience and proven teaching methods.",
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description:
      "Monitor your learning journey with detailed analytics, streaks, and achievement milestones.",
  },
  {
    icon: GraduationCap,
    title: "Earn Certificates",
    description:
      "Complete courses and receive recognized certificates to showcase your new skills.",
  },
  {
    icon: Users,
    title: "Community Learning",
    description:
      "Join a vibrant community of learners and collaborate on projects and discussions.",
  },
]



const stats = [
  { value: "50,000+", label: "Active Learners" },
  { value: "200+", label: "Expert Courses" },
  { value: "4.8", label: "Average Rating" },
  { value: "95%", label: "Completion Rate" },
]

export default async function HomePage() {
  await connectDb();

  const courses = await Course.find({ isPublished: true })
    .populate({
      path: "categories",
      select: "name",
      options: { lean: true }
    })
    .populate({
      path: "instructor",
      select: "name",
      options: { lean: true }
    })
    .sort({ createdAt: -1 })
    .lean()
  const safeCourses = courses.map(serializeCourseDetails)
  const popularCourses = safeCourses.slice(0, 4)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <PublicNav />
      <main className="flex-1">

        <Hero />

        {/* Stats Bar */}
        <Reveal>
          <section className="border-y border-border bg-card">
            <div className="mx-auto max-w-7xl px-6 py-10">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-3xl font-bold text-foreground font-[family-name:var(--font-heading)]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Features */}
        <Reveal delay={100}>
          <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl font-[family-name:var(--font-heading)] text-balance">
                Everything you need to learn effectively
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Our platform is designed to help you achieve your learning goals
                with the right tools and support.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="border-border bg-card group hover:border-primary/30 transition-colors"
                >
                  <CardContent className="flex flex-col gap-4 p-6">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <feature.icon className="size-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground font-[family-name:var(--font-heading)]">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Popular Courses */}
        <Reveal delay={100}>
          <section className="bg-secondary/30">
            <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl font-[family-name:var(--font-heading)] text-balance">
                    Popular courses
                  </h2>
                  <p className="mt-3 text-lg text-muted-foreground">
                    Start learning from our most enrolled courses today.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-border text-foreground hover:bg-card"
                  asChild
                >
                  <Link href="/courses">
                    View All Courses
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {popularCourses.map((course) => (
                  <Link key={course._id} href={`/courses/${course.slug}`}>
                    <Card className="group overflow-hidden p-0 border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all h-full flex flex-col">
                      <div className="relative aspect-video  w-full overflow-hidden">
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                          {course.level}
                        </Badge>
                      </div>
                      <CardContent className="flex flex-1 flex-col gap-2 p-4">
                        <p className="text-xs font-medium text-primary">
                          {course.categories?.map((cat) => cat.name).join(", ")}
                        </p>
                        <h3 className="text-sm font-semibold text-card-foreground line-clamp-2 font-[family-name:var(--font-heading)] group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="mt-auto text-xs text-muted-foreground">
                          {course.instructor?.name}
                        </p>
                        <p className="mt-auto text-xs text-muted-foreground">
                          ₹{course.price}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="size-3 fill-chart-3 text-chart-3" />
                            {course.averageRating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDuration(course.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="size-3" />
                            {/* {course.enrolled.toLocaleString()} */}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal delay={100}>
          <TestimonialsSection/>
        </Reveal>

        {/* CTA */}
        <Reveal delay={100}>
          <section className="bg-primary">
            <div className="mx-auto max-w-7xl px-6 py-20 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl font-[family-name:var(--font-heading)] text-balance">
                Ready to start your learning journey?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-primary-foreground/80 leading-relaxed">
                Join over 50,000 learners already building skills and advancing
                their careers with LearnHub.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90"
                  asChild
                >
                  <Link href="/courses">
                    Get Started Free
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground/30 text-gray-400 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  asChild
                >
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            </div>
          </section>
        </Reveal>
      </main>
      {/* Footer */}
      <PublicFooter />
    </div>
  )
}
