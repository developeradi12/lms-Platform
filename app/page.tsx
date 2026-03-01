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
import { getSession } from "@/utils/session"
import { serializeHomeCourse } from "@/lib/serializers"

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

const testimonials = [
  {
    name: "Alex Turner",
    role: "Frontend Developer at Vercel",
    quote:
      "LearnHub's React course completely transformed my career. The project-based approach made complex concepts click.",
    avatar: "AT",
  },
  {
    name: "Priya Sharma",
    role: "Data Scientist at Google",
    quote:
      "The Python for Data Science course was exactly what I needed. Clear, structured, and deeply practical.",
    avatar: "PS",
  },
  {
    name: "Marcus Johnson",
    role: "UX Designer at Figma",
    quote:
      "I went from complete beginner to landing my dream design role. The curriculum is incredibly well structured.",
    avatar: "MJ",
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
  const session = await getSession();
  const role = session?.role || null;

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
  const safeCourses = courses.map(serializeHomeCourse)
  const popularCourses = safeCourses.slice(0, 4)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <PublicNav role={role} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--primary)_0%,transparent_50%)] opacity-[0.06]" />
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-32">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="flex flex-col gap-6">
                <Badge
                  variant="secondary"
                  className="w-fit bg-secondary text-secondary-foreground px-4 py-1.5 text-sm"
                >
                  New courses added weekly
                </Badge>
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl font-[family-name:var(--font-heading)] text-balance">
                  Master new skills.{" "}
                  <span className="text-primary">Advance your career.</span>
                </h1>
                <p className="max-w-lg text-lg text-muted-foreground leading-relaxed">
                  Join thousands of learners building real-world skills with
                  expert-led, project-based courses in development, design, data
                  science, and more.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    asChild
                  >
                    <Link href="/courses">
                      Explore Courses
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border text-foreground hover:bg-secondary"
                    asChild
                  >
                    <Link href="/courses">
                      <Play className="mr-2 size-4" />
                      Watch Demo
                    </Link>
                  </Button>
                </div>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-2">
                    {["AT", "PS", "MJ", "LW"].map((initials) => (
                      <div
                        key={initials}
                        className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-semibold text-primary-foreground"
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="size-3.5 fill-chart-3 text-chart-3"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Trusted by 50,000+ learners
                    </p>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative hidden lg:block">
                <div className="overflow-hidden rounded-2xl border border-border shadow-2xl">
                  <Image
                    src="/images/hero-students.jpg"
                    alt="Students learning together in a modern workspace"
                    width={600}
                    height={420}
                    className="object-cover w-full"
                    priority
                  />
                </div>
                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-6 rounded-xl border border-border bg-card p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-accent/10">
                      <CheckCircle className="size-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">
                        Course Completed
                      </p>
                      <p className="text-xs text-muted-foreground">
                        UI/UX Design Fundamentals
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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

        {/* Testimonials */}
        <Reveal delay={100}>
          <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl font-[family-name:var(--font-heading)] text-balance">
                Loved by learners worldwide
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                See what our students have to say about their learning experience.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <Card
                  key={t.name}
                  className="border-border bg-card"
                >
                  <CardContent className="flex flex-col gap-4 p-6">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="size-4 fill-chart-3 text-chart-3"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-card-foreground leading-relaxed">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
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
