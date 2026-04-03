"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Lock, CreditCard } from "lucide-react"
import { toast } from "sonner"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface CourseWithInstructor {
  _id: string
  title: string
  price: number
  slug:string
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
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const discount = 0
  const finalPrice = course.price - discount

  // Load Razorpay Script
  useEffect(() => {
    const loadScript = () => {
      return new Promise<boolean>((resolve) => {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => {
          setScriptLoaded(true)
          resolve(true)
        }
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
      })
    }

    loadScript()
  }, [])

  const handlePayment = async () => {
    if (!agree) return

    if (!scriptLoaded) {
      alert("Payment SDK not loaded. Please refresh.")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: finalPrice,
        }),
      })

      const order = await res.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "My LMS",
        description: course.title,

        handler: async function (response: any) {

          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              courseId:course._id,
            })
          })

          const data = await verifyRes.json()

          if (data.success) {
            toast.success("Payment Successful")

            // redirect to course page
            window.location.href = `/courses/${course.slug}`

          } else {
            toast.error("Payment verification failed")
          }
        },

        prefill: {
          name: "Test User",
          email: "test@example.com",
        },

        theme: {
          color: "#6366f1",
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error) {
      console.error(error)
      alert("Something went wrong during payment")
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

            {/* Razorpay handles card UI automatically */}
            <p className="text-sm text-muted-foreground">
              You will be redirected to secure Razorpay checkout.
            </p>

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

      {/* RIGHT SIDE */}
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