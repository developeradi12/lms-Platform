import { Category } from "./category"
import { Chapter } from "./chapter"
import { Instructor } from "./instructor"

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export type Course = {
  _id: string
  title: string
  slug: string
  description: string
  thumbnail: string
  price: number
  level: CourseLevel
  status?: CourseStatus

  prerequisites: string[]
  tags: string[]

  instructor?: Instructor
  categories: Category[]

  chapters: Chapter[]

  totalDuration?: number
  totalLessons?: number
  averageRating?: number
  createdAt: string
  updatedAt?: string
}