export type ResourceType = "NOTE" | "ASSIGNMENT"

export type LessonResource = {
  title: string
  fileUrl: string
  type: ResourceType
}

export type LessonSerialized = {
  _id: string
  slug: string
  title: string
  description: string
  duration: number
  videoUrl?: string | null
  isFreePreview: boolean
  isComplete: boolean
  resources?: LessonResource[]
}