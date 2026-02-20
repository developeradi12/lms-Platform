import { Lesson } from "./lesson"

export type Chapter = {
  _id: string
  title: string
  description?: string
  order?: number
  lessons: Lesson[]
  createdAt?: string
  updatedAt?: string
}