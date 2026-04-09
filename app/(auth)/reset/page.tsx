"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import api from "@/lib/api"
import { toast } from "sonner"

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card"

import {
  Field, FieldLabel, FieldError, FieldGroup
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PublicNav } from "@/components/public-nav"
import { PublicFooter } from "@/components/public-footer"

const schema = z.object({
  password: z.string().min(6, "Min 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type FormType = z.infer<typeof schema>

export default function ResetPassword() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  const email = searchParams.get("email")

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormType) => {
    try {
      setLoading(true)

      await api.post("/api/auth/forgot/reset", {
        email,
        password: values.password,
      })

      toast.success("Password reset successful")

      router.push("/login")

    } catch {
      toast.error("Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PublicNav />

      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md rounded-2xl">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter your new password</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FieldGroup>

                {/* Password */}
                <Field>
                  <FieldLabel>New Password</FieldLabel>
                  <Input
                    type="password"
                    {...form.register("password")}
                  />
                  <FieldError errors={[form.formState.errors.password]} />
                </Field>

                {/* Confirm */}
                <Field>
                  <FieldLabel>Confirm Password</FieldLabel>
                  <Input
                    type="password"
                    {...form.register("confirmPassword")}
                  />
                  <FieldError errors={[form.formState.errors.confirmPassword]} />
                </Field>

                <Button className="w-full" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>

              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="text-xs text-muted-foreground justify-center">
            LMS Platform
          </CardFooter>
        </Card>
      </div>

      <PublicFooter />
    </>
  )
}