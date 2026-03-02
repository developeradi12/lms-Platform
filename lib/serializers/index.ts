import { CategorySerialized, CourseDetailsSerialized, CourseSerialized } from "@/types";
import { buildSerializer } from "./builder";

// course
export const serializeCourse = buildSerializer<CourseSerialized>([])
export const serializeCourseDetails = buildSerializer<CourseDetailsSerialized>()

//category
export const serializeCategory = buildSerializer<CategorySerialized>()