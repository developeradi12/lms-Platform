
//   .regex(
//   /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/,
//   "Password must contain at least one letter and one number"
// ),

"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { Eye, EyeOff } from "lucide-react"
import api from "@/lib/api"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

// type LoginValues = z.input<typeof loginSchema> // infers the input type, which is the same as output in this case
type LoginValues = z.infer<typeof loginSchema>// automaticslly infers the type from the schema

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  })

  const { errors, isSubmitted } = form.formState

  const onSubmit = async (values: LoginValues) => {
    try {
      setLoading(true)

      const res = await api.post("/api/auth/login", values)
      // console.log("login_response", res);
      toast.success(res.data?.message || "Login successful")
      // if (res.data?.user?.role === "ADMIN") {
      //   router.push("/admin/dashboard")
      // }else if(res.data?.user?.role === "INSTRUCTOR"){
      //   router.push("/instructor/dashboard")//change to instructor dashboard
      // }else{
        router.push("/");
      

    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Login to access your dashboard</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FieldGroup className="space-y-4">
              {/* Email */}
              <Field data-invalid={!!errors.email && isSubmitted}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  {...form.register("email")}
                  aria-invalid={!!errors.email && isSubmitted}
                  className="focus-visible:ring-2 rounded-xl"
                />
                {errors.email && isSubmitted && (
                  <FieldError errors={[errors.email]} />
                )}
              </Field>

              {/* Password */}
              <Field data-invalid={!!errors.password && isSubmitted}>
                <FieldLabel htmlFor="password">Password</FieldLabel>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...form.register("password")}
                    aria-invalid={!!errors.password && isSubmitted}
                    className="focus-visible:ring-2 rounded-xl pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>

                {errors.password && isSubmitted && (
                  <FieldError errors={[errors.password]} />
                )}
              </Field>

              {/* Submit Button (MUST be inside form) */}
              <Button
                type="submit"
                className="w-full rounded-xl"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </Button>

              {/* Links */}
              <div className="flex items-center justify-between text-sm pt-2">
                <Link
                  href="/auth/forgot-password"
                  className="text-muted-foreground hover:underline"
                >
                  Forgot password?
                </Link>

                <Link
                  href="/sign_up"
                  className="font-medium hover:underline"
                >
                  Sign Up
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-xs text-muted-foreground">
          LMS Platform
        </CardFooter>
      </Card>
    </div>
  )
}
