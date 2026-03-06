import { CourseDetailsSerialized, CourseSerialized } from "@/types/course";
import { buildSerializer } from "./builder";
import { CategorySerialized } from "@/types/category";
import { UserSerialize } from "@/types/user";

// course
export const serializeCourse = buildSerializer<CourseSerialized>([])
export const serializeCourseDetails = buildSerializer<CourseDetailsSerialized>()
export const serializeCourses = (courses:any[])=>courses.map(serializeCourseDetails)
//category
export const serializeCategory = buildSerializer<CategorySerialized>()
export const serializeCategories = (categories: any[]) =>categories.map(serializeCategory)

//user
export const userSerialized = buildSerializer<UserSerialize>();