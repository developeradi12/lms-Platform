"use client"

import { useEffect, useState } from "react"
import Reveal from "../animations/Reveal"
import api from "@/lib/api"
import { Testimonial } from "@/types/testimonial"
import { Card, CardContent } from "../ui/card"
import { Star } from "lucide-react"
import { Skeleton } from "../ui/skeleton"

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  /* ── Fetch API ── */
  const fetchTestimonials = async () => {
    try {
      const res = await api.get("/api/admin/testimonials")
      setTestimonials(res.data.testimonials || [])
    } catch (err) {
      console.error("Failed to fetch testimonials", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  // const testimonials = [
  //   {
  //     name: "Alex Turner",
  //     role: "Frontend Developer at Vercel",
  //     quote:
  //       "LearnHub's React course completely transformed my career. The project-based approach made complex concepts click.",
  //     avatar: "AT",
  //   },
  //   {
  //     name: "Priya Sharma",
  //     role: "Data Scientist at Google",
  //     quote:
  //       "The Python for Data Science course was exactly what I needed. Clear, structured, and deeply practical.",
  //     avatar: "PS",
  //   },
  //   {
  //     name: "Marcus Johnson",
  //     role: "UX Designer at Figma",
  //     quote:
  //       "I went from complete beginner to landing my dream design role. The curriculum is incredibly well structured.",
  //     avatar: "MJ",
  //   },
  // ]

  /* ── Helper: initials ── */
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  /* ── Skeleton UI ── */
  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (!testimonials.length) return null

  return (

    <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      {/* Heading */}
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
          Loved by learners worldwide
        </h2>
        <p className="mt-4 text-muted-foreground">
          See what our students have to say about their learning experience.
        </p>
      </div>

      {/* Cards */}
      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <Card key={t._id} className="border-border bg-card">
            <CardContent className="flex flex-col gap-4 p-6">

              {/* ⭐ Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`size-4 ${i <= (t.rating || 5)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                      }`}
                  />
                ))}
              </div>

              {/* 💬 Message */}
              <p className="text-sm leading-relaxed">
                “{t.message}”
              </p>

              {/* 👤 User */}
              <div className="flex items-center gap-3 pt-2">

                {/* Image / Fallback */}
                {t.image ? (
                  <img
                    src={t.image}
                    alt={t.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {getInitials(t.name)}
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.role || "Student"}
                  </p>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

  )
}