import { Types } from "mongoose"
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export interface BaseCourse {
  _id: string
  title: string
  slug: string
  description: string
  thumbnail?: string

  instructor: Types.ObjectId
  categories: Types.ObjectId[]
  chapters: Types.ObjectId[]

  price: number
  duration: number
  level: CourseLevel
  isPublished: boolean

  totalLessons: number
  totalChapters: number

  averageRating: number
  totalReviews: number
  totalEnrollments: number

  prerequisites: string[]
  tags: string[]

  metaTitle?: string
  metaDescription?: string

  createdAt: Date
  updatedAt: Date
}

export type AdminCourse = {
  _id: string
  slug: string
  title: string
  price: number
  isPublished: boolean
  chaptersCount?: number
  createdAt: string
  category?: {
    _id: string
    name: string
  }
}

export type LeanCourse = Omit<BaseCourse, "instructor" | "categories" | "chapters"> & {
  instructor: string
  categories: string[]
  chapters: string[]
}

export type PublicCourse = Omit<LeanCourse, "metaTitle" | "metaDescription"
>
//Instructor populated
export type CourseWithInstructor<TInstructor> = Omit<LeanCourse, "instructor"> & { instructor: TInstructor }

// Categories populated
export type CourseWithCategories<TCategory> = Omit<LeanCourse, "categories"> & { categories: TCategory[] }

//Chapters populated
export type CourseWithChapters<TChapter> = Omit<LeanCourse, "chapters"> & { chapters: TChapter[] }

export type CourseDetails<TInstructor, TCategory, TChapter> =
  CourseWithInstructor<TInstructor> &
  CourseWithCategories<TCategory> &
  CourseWithChapters<TChapter>

export type PublishedCourse = LeanCourse & { isPublished: true }

export type CourseCard = Pick<LeanCourse, "_id" | "title" | "slug" | "thumbnail" | "price" | "averageRating" | "totalEnrollments" | "level">

export type CreateCourseDTO = Omit<BaseCourse, "_id" | "createdAt" | "updatedAt" | "averageRating" | "totalEnrollments" | "totalReviews">
export type CourseSlug = Pick<LeanCourse, "slug">

export type HomeCourse = {
  _id: any
  slug: string
  title: string
  thumbnail: string
  price: number
  averageRating: number
  duration: number
  level: string
  categories: { name: string }[]
  instructor: { name: string }
}
