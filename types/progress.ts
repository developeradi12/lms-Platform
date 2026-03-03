import { Types } from "mongoose"

export type ProgressSerialized = {
  _id: string
  user: string
  course: string
  percentage: number
  completedLessons: string[];
  isCompleted: boolean
  completedAt?: string;
  lastAccessedLesson?: string;
  createdAt: string;
  updatedAt: string;
}