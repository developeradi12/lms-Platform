
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT"
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BLOCKED"


export type UserSerialize = {
  _id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  bio?: string
  isVerified: boolean
  enrolledCourses:string[]
  status: UserStatus
  wishlist:string[]
  orders:string[]
  reviews:string[]
  createdAt: Date
  updatedAt: Date
}