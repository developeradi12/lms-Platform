import { Lesson } from "./lesson"

export interface Chapter {
  _id: string
  title: string
  description?: string
  lessons: Lesson[]
}