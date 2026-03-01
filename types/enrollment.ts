export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "REFUNDED"

import { Types } from "mongoose"

export interface BaseEnrollment {
  _id: string

  user: Types.ObjectId
  course: Types.ObjectId

  progress: number
  enrolledAt: Date

  status: EnrollmentStatus

  createdAt: Date
  updatedAt: Date
}
export type LeanEnrollment = Omit<
  BaseEnrollment,
  "user" | "course"
> & {
  user: string
  course: string
}
//Enrollment Preview : Dashboard / course card me use hota hai
export type EnrollmentPreview = Pick<LeanEnrollment,"_id" | "course" | "progress" | "status">

//Enrollment With Course (Populate)
export type EnrollmentWithCourse<TCourse> =Omit<LeanEnrollment, "course"> & {course: TCourse}

//Enrollment With User (Admin use)
export type EnrollmentWithUser<TUser> =Omit<LeanEnrollment, "user"> & {user: TUser}

//Progress Update
export type UpdateProgressDTO = Pick<BaseEnrollment,"progress">

export type CreateEnrollmentDTO = Pick<BaseEnrollment,"user" | "course">