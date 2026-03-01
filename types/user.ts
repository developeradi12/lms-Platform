import { Types } from "mongoose"

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT"
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BLOCKED"

export interface BaseUser {
  _id: string
  name: string
  email: string
  password: string
  role: UserRole
  avatar?: string
  bio?: string
  isVerified: boolean
  status: UserStatus
  refreshToken?: string

  wishlist: Types.ObjectId[]
  orders: Types.ObjectId[]
  reviews: Types.ObjectId[]

  createdAt: Date
  updatedAt: Date
}
export type PublicUser = Omit<BaseUser,"password"|"refreshToken">
export type AuthUser = Pick<BaseUser,"_id" | "email" | "role">
export type UserWishlist = Pick<BaseUser,"_id" | "wishlist">
export type InstructorPreview = Pick<BaseUser,"_id" | "name" | "avatar" | "bio">
export type LeanUserWishlist = { _id: string, wishlist?: string[]}