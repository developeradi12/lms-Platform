export type Submission = {
  _id: string
  fileUrl: string
  status: "PENDING" | "REVIEWED"
  createdAt: string
}
export type Assignment = {
  lessonId: string
  lessonTitle: string
  courseTitle: string
  submissions: Submission[]
}