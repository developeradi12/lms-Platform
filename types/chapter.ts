import { LessonSerialized } from "./lesson"

export type ChapterSerialized = {
  _id: string
  title: string
  description?: string
  metaTitle?: string
  metaDescription?: string
  slug?: string
  order?: number

  lessons:LessonSerialized[]
}