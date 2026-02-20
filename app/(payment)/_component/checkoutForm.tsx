"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Lock, CreditCard } from "lucide-react"
import { CourseDocument } from "@/schemas/courseSchema"

interface CourseWithInstructor {
  _id: string
  title: string
  price: number
  thumbnail?: string
  instructor: {
    _id: string
    name: string
  }
}

interface CheckoutFormProps {
  course: CourseWithInstructor
}

export default function CheckoutForm({ course }: CheckoutFormProps) {
  const [coupon, setCoupon] = useState("")
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)

  const discount = 0
  const finalPrice = course.price - discount

  const handlePayment = async () => {
    if (!agree) return

    try {
      setLoading(true)

      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course._id,
          coupon,
        }),
      })

      const data = await res.json()

      // Redirect to payment gateway (Stripe/Razorpay)
      window.location.href = data.url

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">

      {/* LEFT SIDE */}
      <div className="md:col-span-2 space-y-6">

        {/* Course Preview */}
        <Card>
          <CardContent className="p-6 flex gap-4">
            {course.thumbnail && (
              <Image
                src={course.thumbnail}
                alt={course.title}
                width={120}
                height={80}
                className="rounded-md object-cover"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p className="text-sm text-muted-foreground">
                Instructor: {course.instructor?.name || "John Doe"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </h3>

            <Input placeholder="Card Number" />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="MM/YY" />
              <Input placeholder="CVC" />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={agree}
                onCheckedChange={(value: any) => setAgree(value)}
              />
              <span className="text-sm">
                I agree to the Terms & Conditions
              </span>
            </div>

            <Button
              className="w-full"
              disabled={!agree || loading}
              onClick={handlePayment}
            >
              <Lock className="w-4 h-4 mr-2" />
              {loading ? "Processing..." : `Pay ₹${finalPrice}`}
            </Button>

            <p className="text-xs text-muted-foreground">
              🔒 Secure 256-bit SSL encrypted payment
            </p>
          </CardContent>
        </Card>

      </div>

      {/* RIGHT SIDE - ORDER SUMMARY */}
      <div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Order Summary</h3>

            <div className="flex justify-between">
              <span>Course Price</span>
              <span>₹{course.price}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{finalPrice}</span>
            </div>

            <Input
              placeholder="Apply Coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />

            <Badge variant="secondary">
              30-Day Money Back Guarantee
            </Badge>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
