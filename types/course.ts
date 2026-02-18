import { Category } from "./category"
import { Chapter } from "./chapter"
import { Instructor } from "./instructor"


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
