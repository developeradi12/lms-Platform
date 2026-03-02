import { LessonSerialized } from "./lesson"

export type CourseSerialized = {
  _id: string
  title: string
  slug: string
  description: string
  thumbnail: string

  instructor: string
  categories: string[]
  chapters: string[]

  price: number
  duration: number
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  isPublished: boolean

  totalLessons: number
  averageRating: number
  totalReviews: number
  totalEnrollments: number

  prerequisites: string[]
  tags: string[]

  metaTitle?: string
  metaDescription?: string

  createdAt: string
  updatedAt: string
}

export type CourseDetailsSerialized = {
  _id: string
  title: string
  slug: string
  description: string
  thumbnail: string
  price: number
  level: string
  duration: number
  averageRating: number
  totalEnrollments: number
  createdAt: string
  updatedAt: string

  instructor: {
    _id: string
    name?: string
    bio:string
  } | null

  categories: {
    name: string
    slug: string
  }[]

  chapters: {
    _id: string
    title: string
   lessons: LessonSerialized[]
  }[]
}