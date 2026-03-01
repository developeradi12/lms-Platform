import { Types } from "mongoose"

export interface CategoryDocument {
  _id: Types.ObjectId

  name: string
  slug: string
  description?: string
  image?: string

  metaTitle?: string
  metaDescription?: string

  createdAt: Date
  updatedAt: Date
}

export interface CourseDocument {
  _id: Types.ObjectId

  title: string
  slug: string
  description: string
  thumbnail?: string

  instructor: Types.ObjectId
  categories: Types.ObjectId[]
  chapters: Types.ObjectId[]

  price: number
  duration: number
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  isPublished: boolean

  totalLessons: number
  totalReviews: number
  totalEnrollments: number
  averageRating: number

  prerequisites: string[]
  tags: string[]

  metaTitle?: string
  metaDescription?: string

  createdAt: Date
  updatedAt: Date
}