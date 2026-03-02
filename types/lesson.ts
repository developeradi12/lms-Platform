export type LessonSerialized = {
  _id: string
  slug: string
  title: string
  description:string
  duration: number
  videoUrl?: string | null
  isFreePreview: boolean
  isComplete:boolean
}