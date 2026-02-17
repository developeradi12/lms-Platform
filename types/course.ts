export interface Lesson {
  _id: string
  title: string
  duration?: string
}

export interface Chapter {
  _id: string
  title: string
  description?: string
  lessons: Lesson[]
}

export interface Category {
  _id: string
  name: string
  slug: string
}

export interface Instructor {
  _id: string
  name?: string
  firstName?: string
  lastName?: string
}

export interface CourseSerialized {
  _id: string
  title: string
  description: string
  price: number
  thumbnail: string
  isPublished: boolean
  category?: Category
  instructor?: Instructor
  chapters: Chapter[]
}
