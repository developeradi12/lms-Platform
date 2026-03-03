import { CourseDetailsSerialized, CourseSerialized } from "@/types/course";
import { buildSerializer } from "./builder";
import { CategorySerialized } from "@/types/category";
import { UserSerialize } from "@/types/user";

// course
export const serializeCourse = buildSerializer<CourseSerialized>([])
export const serializeCourseDetails = buildSerializer<CourseDetailsSerialized>()

//category
export const serializeCategory = buildSerializer<CategorySerialized>()

//user
export const userSerialized = buildSerializer<UserSerialize>();