"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function VerifyOtpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const email = searchParams.get("email") || ""

  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!email) {
      toast.error("Email missing, please signup again")
      router.push("/signup")
    }
  }, [email, router])

  const handleVerify = async () => {
    if (!otp.trim() || otp.length !== 6) {
      toast.error("Enter valid 6 digit OTP")
      return
    }

    const signupData = localStorage.getItem("signupData")

    if (!signupData) {
      toast.error("Signup data missing, please signup again")
      router.push("/signup")
      return
    }

    const parsed = JSON.parse(signupData)

    try {
      setLoading(true)

      // ✅ Step 2: Verify OTP + Create Account
      const res = await axios.post("/api/auth/verify-otp", {
        name: parsed.name,
        email: parsed.email,
        password: parsed.password,
        otp,
      })

      toast.success(res.data?.message || "Account created successfully")

      // cleanup
      localStorage.removeItem("signupData")

      // redirect
      router.push("/admin/dashboard") // or "/"
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "OTP verification failed")
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    try {
      setResending(true)

      await axios.post("/api/auth/send-otp", { email })

      toast.success("OTP resent successfully")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to resend OTP")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Verify OTP</CardTitle>
          <CardDescription>
            OTP sent to <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>OTP</Label>
            <Input
              className="rounded-xl tracking-[6px] text-center text-lg"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
            />
          </div>

          <Button
            onClick={handleVerify}
            className="w-full rounded-xl"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify & Create Account"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={resendOtp}
            className="w-full rounded-xl"
            disabled={resending}
          >
            {resending ? "Resending..." : "Resend OTP"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
