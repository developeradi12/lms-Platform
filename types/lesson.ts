import { Types } from "mongoose"

export interface BaseLesson {
  _id: string
  title: string
  description?: string

  metaTitle?: string
  metaDescription?: string

  slug: string
  chapter: Types.ObjectId

  videoUrl?: string
  duration: number
  isFreePreview: boolean

  order: number

  createdAt: Date
  updatedAt: Date
}

export type LeanLesson = Omit<
  BaseLesson,
  "chapter"
> & {
  chapter: string
}

export type PublicLesson = Omit<
  LeanLesson,
  "metaTitle" | "metaDescription"
>
export type LessonPreview = Pick<
  LeanLesson,
  "_id" | "title" | "slug" | "duration" | "isFreePreview" | "order"
>

export type SafeLesson = Omit<
  LeanLesson,
  "videoUrl"
>

export type LessonWithChapter<TChapter> =
  Omit<LeanLesson, "chapter"> & {
    chapter: TChapter
  }

  export type LessonSEO = Pick<
  LeanLesson,
  "metaTitle" | "metaDescription"
>

export type CreateLessonDTO = Omit<
  BaseLesson,
  "_id" | "createdAt" | "updatedAt"
>
export type UpdateLessonDTO = Partial<CreateLessonDTO>

export type LessonSlug = Pick<
  LeanLesson,
  "slug"
>