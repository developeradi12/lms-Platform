"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { toast } from "sonner"

import { email, z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Loader2, Camera } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const profileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address").optional(),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

type User = {
  name: string
  email: string
  role: string
  avatar?: string
  createdAt: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)


  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const fetchUser = async () => {
    try {
      setLoadingUser(true)
      const res = await api.get("/api/user/profile")

      setUser(res.data.user)

      // set form values
      profileForm.reset({
        name: res.data.user.name || "",
        email: res.data.user.email || "",
      })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load profile")
    } finally {
      setLoadingUser(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])


  const onSubmitProfile = async (values: ProfileFormValues) => {
    try {
      setSavingProfile(true)

      const res = await api.put("/api/user/profile", values)

      setUser(res.data.user)
      toast.success("Profile updated successfully ✅")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Update failed")
    } finally {
      setSavingProfile(false)
    }
  }

  const onSubmitPassword = async (values: PasswordFormValues) => {
    try {
      setSavingPassword(true)

      await api.put("/api/user/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      toast.success("Password updated successfully 🔥")
      passwordForm.reset()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Password update failed")
    } finally {
      setSavingPassword(false)
    }
  }

  if (loadingUser) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded-xl animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-[260px] bg-muted rounded-2xl animate-pulse" />
          <div className="lg:col-span-2 h-[260px] bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold">
          My Profile
        </h2>
        <p className="text-muted-foreground">
          Manage your personal information and security settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* LEFT PANEL */}
        <Card className="border-border bg-card hover:shadow-md transition-all rounded-2xl">
          <CardContent className="flex flex-col items-center text-center p-6 gap-5">

            <div className="relative group">
              <Avatar className="h-28 w-28 rounded-2xl border shadow-sm">
                <AvatarImage src={user.avatar || ""} />
                <AvatarFallback className="rounded-2xl text-2xl font-semibold">
                  {user.name?.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-xl shadow-md 
              opacity-0 group-hover:opacity-100 transition"
                onClick={() => toast.info("Avatar upload coming soon 😄")}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <p className="font-semibold text-lg">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <Badge variant="secondary" className="rounded-full px-3">
              {user.role}
            </Badge>

            <div className="w-full pt-4 border-t text-left space-y-1">
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-2 space-y-6">

          {/* PERSONAL INFO */}
          <Card className="border-border bg-card hover:shadow-md transition-all rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Personal Information
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                  className="space-y-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-xl focus-visible:ring-1"
                              placeholder="Enter your name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        className="rounded-xl bg-muted"
                        value={user.email}
                        disabled
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="rounded-xl px-6"
                    disabled={savingProfile}
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* PASSWORD */}
          <Card className="border-border bg-card hover:shadow-md transition-all rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Security Settings
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                  className="space-y-5"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-xl"
                            type="password"
                            placeholder="Enter current password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-xl"
                              type="password"
                              placeholder="New password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-xl"
                              type="password"
                              placeholder="Confirm password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    className="rounded-xl px-6"
                    disabled={savingPassword}
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}