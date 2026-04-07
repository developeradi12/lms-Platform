export type Order = {
  _id: string
  user: {
    name: string
    email: string
  }
  course: {
    title: string
  }
  amount: number
  status: "SUCCESS" | "FAILED" | "PENDING"
  createdAt: string
}
