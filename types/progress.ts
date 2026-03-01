import { Types } from "mongoose"

export interface BaseProgress {
  _id: string

  user: Types.ObjectId
  lesson: Types.ObjectId
  course: Types.ObjectId

  watchedSeconds: number
  isCompleted: boolean
  completedAt?: Date

  createdAt: Date
  updatedAt: Date
}

export type LeanProgress = Omit<
  BaseProgress,
  "user" | "lesson" | "course"
> & {
  user: string
  lesson: string
  course: string
}

export type ProgressPreview = Pick<LeanProgress,"lesson" | "watchedSeconds" | "isCompleted">
export type LessonCompletion = Pick<LeanProgress,"lesson" | "isCompleted" | "completedAt">
export type ResumeProgress = Pick<LeanProgress,"lesson" | "watchedSeconds">
export type ProgressWithLesson<TLesson> =Omit<LeanProgress, "lesson"> & {lesson: TLesson}
export type ProgressWithCourse<TCourse> =Omit<LeanProgress, "course"> & {course: TCourse}
// export type UpdateProgressDTO = Pick<BaseProgress,"watchedSeconds" | "isCompleted">

export type MarkLessonCompleteDTO = Pick<BaseProgress,"lesson" | "course">