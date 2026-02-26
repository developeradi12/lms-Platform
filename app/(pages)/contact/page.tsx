"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

const contactDetails = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@learnforge.io",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (800) 555-FORGE",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "350 5th Avenue, New York, NY",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "Mon–Fri, 8am–8pm EST",
  },
]

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    await new Promise((res) => setTimeout(res, 1200))

    setStatus("success")
  }

  return (
    <div className="bg-background text-foreground">

      {/* HERO */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Badge className="mb-4">Get In Touch</Badge>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-space-grotesk)]">
            We’d love to hear from you
          </h1>

          <p className="mt-6 text-muted-foreground max-w-2xl leading-relaxed">
            Whether you're ready to start a trial, have a pricing question,
            need support, or just want to say hello — our team responds within
            one business day.
          </p>
        </div>
      </section>

      {/* MAIN */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16">

          {/* LEFT: Contact Info */}
          <div>
            <Badge className="mb-4">Reach Out</Badge>

            <h2 className="text-3xl font-bold mb-6 font-[family-name:var(--font-space-grotesk)]">
              Multiple ways to connect
            </h2>

            <p className="text-muted-foreground mb-10 leading-relaxed">
              Our team is spread across time zones so someone is always
              available. Choose the channel that works best for you.
            </p>

            <div className="space-y-4">
              {contactDetails.map((item) => (
                <Card key={item.label}>
                  <CardContent className="p-5 flex items-start gap-4">
                    <item.icon className="size-5 text-primary mt-1" />
                    <div>
                      <p className="text-xs uppercase text-muted-foreground font-medium tracking-wider">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        {item.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* RIGHT: Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Send us a message
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input placeholder="First Name" required />
                  <Input placeholder="Last Name" required />
                </div>

                <Input type="email" placeholder="Work Email" required />

                <Input placeholder="Company (optional)" />

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo">Enterprise Demo</SelectItem>
                    <SelectItem value="pricing">Pricing & Plans</SelectItem>
                    <SelectItem value="support">Technical Support</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Tell us a bit about what you need..."
                  rows={5}
                  required
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Sending..." : "Send Message"}
                </Button>

                {status === "success" && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                    ✅ Message sent! We'll be in touch shortly.
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  🔒 We never share your data. Read our Privacy Policy.
                </p>

              </form>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">

          <Badge className="mb-4">FAQ</Badge>

          <h2 className="text-3xl font-bold mb-10 font-[family-name:var(--font-space-grotesk)]">
            Quick answers
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "How fast is the response time?",
                a: "Within 1 business day for general inquiries.",
              },
              {
                q: "Can I book a live demo?",
                a: "Yes — select 'Enterprise Demo' in the form.",
              },
              {
                q: "Do you offer a free trial?",
                a: "Yes — 14 days, no credit card required.",
              },
              {
                q: "Where are your servers hosted?",
                a: "Primarily AWS us-east-1 with EU region available.",
              },
            ].map((faq) => (
              <Card key={faq.q}>
                <CardContent className="p-6">
                  <p className="font-semibold mb-2">{faq.q}</p>
                  <p className="text-sm text-muted-foreground">
                    {faq.a}
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