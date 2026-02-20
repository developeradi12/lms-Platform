export type Lesson = {
  _id: string
  title: string
  description?: string
  duration?: number
  videoUrl?: string
  isFreePreview?: boolean
  order?: number
  createdAt?: string
  updatedAt?: string
  isCompleted: boolean 
}
