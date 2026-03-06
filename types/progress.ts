import { Types } from "mongoose"

export type ProgressSerialized = {
  _id: string
  user: string
  course: string

  completedLessons: string[]
  lastAccessedLesson: string | null

  percentage: number
  isCompleted: boolean

  createdAt: string
  updatedAt: string
}