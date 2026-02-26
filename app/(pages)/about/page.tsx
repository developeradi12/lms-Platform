"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Globe, Smile, Target } from "lucide-react"

const stats = [
  { num: "2M+", label: "Active Learners", icon: Users },
  { num: "140+", label: "Countries", icon: Globe },
  { num: "98%", label: "Satisfaction", icon: Smile },
]

const pillars = [
  {
    title: "Outcome-Driven",
    desc: "Every feature is designed around measurable learning outcomes.",
  },
  {
    title: "Learner-First",
    desc: "Adaptive paths, spaced repetition and intuitive UI.",
  },
  {
    title: "Enterprise-Ready",
    desc: "SSO, SCORM, xAPI, LTI support built-in.",
  },
  {
    title: "Data-Rich",
    desc: "Deep analytics to track progress and performance.",
  },
]

const team = [
  { name: "Amara Osei", role: "CEO & Co-Founder" },
  { name: "James Whitfield", role: "CTO & Co-Founder" },
  { name: "Sofia Reyes", role: "Head of Product" },
  { name: "Marcus Tan", role: "Head of Learning Science" },
]

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">

      {/* HERO */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-2 gap-12 items-center">

          <div>
            <Badge className="mb-4">Our Story</Badge>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-space-grotesk)]">
              Forging the future of learning
            </h1>

            <p className="mt-6 text-muted-foreground max-w-lg leading-relaxed">
              LearnForge is an enterprise-grade learning management platform
              built for teams that refuse to settle. We blend pedagogy,
              technology, and design into one seamless experience.
            </p>

            <div className="mt-8 flex gap-4 flex-wrap">
              <Button>Get Started</Button>
              <Button variant="outline">Explore Courses</Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="p-6 flex flex-col items-center gap-3">
                  <stat.icon className="size-6 text-primary" />
                  <p className="text-3xl font-bold">{stat.num}</p>
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </section>

      {/* MISSION */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-12">

          <div>
            <Badge className="mb-4">Our Mission</Badge>

            <h2 className="text-3xl font-bold mb-6 font-[family-name:var(--font-space-grotesk)]">
              Learning that actually sticks
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-4">
              We built LearnForge because we were frustrated with clunky
              learning platforms and courses no one completed.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Our mission is simple: treat learners like intelligent adults,
              empower instructors, and provide real measurable outcomes.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid sm:grid-cols-2 gap-6">
            {pillars.map((pillar) => (
              <Card key={pillar.title}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pillar.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </section>

      {/* TEAM */}
      <section className="border-t border-border py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">

          <Badge className="mb-4">The Team</Badge>

          <h2 className="text-3xl font-bold mb-10 font-[family-name:var(--font-space-grotesk)]">
            People behind the platform
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member) => (
              <Card key={member.name} className="text-center">
                <CardContent className="p-6">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                    {member.name.charAt(0)}
                  </div>

                  <h3 className="font-semibold">
                    {member.name}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {member.role}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </section>

    </div>
  )
}