import { Types } from "mongoose"

export interface BaseChapter {
  _id: string
  title: string
  description?: string

  metaTitle?: string
  metaDescription?: string

  course: Types.ObjectId
  lessons: Types.ObjectId[]

  slug: string
  order: number

  createdAt: Date
  updatedAt: Date
}

export type LeanChapter = Omit<BaseChapter,"course" | "lessons"> & {
  course: string
  lessons: string[]
}

export type PublicChapter = Omit<LeanChapter,"metaTitle" | "metaDescription">
export type ChapterPreview = Pick<LeanChapter,"_id" | "title" | "slug" | "order">

export type ChapterWithLessons<TLesson> =Omit<LeanChapter, "lessons"> & {lessons: TLesson[]}

export type ChapterWithCourse<TCourse>=Omit<LeanChapter, "course"> & {course: TCourse}
export type ChapterSEO = Pick<LeanChapter,"metaTitle" | "metaDescription">
export type CreateChapterDTO = Omit<BaseChapter,"_id" | "createdAt" | "updatedAt">
export type UpdateChapterDTO = Partial<CreateChapterDTO>
export type ChapterSlug = Pick<LeanChapter,"slug">