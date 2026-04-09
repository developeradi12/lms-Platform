"use client"

import { useState } from "react"
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
    email: z.string().email(),
    otp: z.string().optional()
})

type FormType = z.infer<typeof schema>

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const [cooldown, setCooldown] = useState(0)

    const form = useForm<FormType>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", otp: "" }
    })

    //  Send OTP
    const sendOtp = async (email: string) => {
        try {
            setLoading(true)

            await api.post("/api/auth/forgot/send-otp", { email })

            toast.success("OTP sent")
            setOtpSent(true)

            // cooldown
            setCooldown(30)
            const interval = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

        } catch {
            toast.error("Failed to send OTP")
        } finally {
            setLoading(false)
        }
    }

    //  Verify OTP
    const verifyOtp = async (values: FormType) => {
        try {
            setLoading(true)

            await api.post("/api/auth/forgot/verify-otp", values)

            toast.success("OTP verified")

            //  redirect to reset page
            window.location.href = `/auth/reset?email=${values.email}`

        } catch {
            toast.error("Invalid OTP")
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
                        <CardTitle>Forgot Password</CardTitle>
                        <CardDescription>Enter email to receive OTP</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={form.handleSubmit(
                                otpSent ? verifyOtp : (v) => sendOtp(v.email)
                            )}
                            className="space-y-5"
                        >
                            <FieldGroup>

                                {/* Email */}
                                <Field>
                                    <FieldLabel>Email</FieldLabel>
                                    <Input
                                        {...form.register("email")}
                                        placeholder="Enter email"
                                    />
                                </Field>

                                {/* OTP Field */}
                                {otpSent && (
                                    <Field>
                                        <FieldLabel>OTP</FieldLabel>
                                        <Input
                                            {...form.register("otp")}
                                            placeholder="Enter OTP"
                                        />
                                    </Field>
                                )}

                                {/* Button */}
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading
                                        ? "Please wait..."
                                        : otpSent
                                            ? "Verify OTP"
                                            : cooldown > 0
                                                ? `Resend in ${cooldown}s`
                                                : "Send OTP"}
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