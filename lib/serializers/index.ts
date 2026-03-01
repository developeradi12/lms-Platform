import { HomeCourse } from "@/types";
import { buildSerializer } from "./builder";

export const serializeHomeCourse = buildSerializer<HomeCourse>([
  "_id",
  "title",
  "slug",
  "thumbnail",
  "price",
  "averageRating",
  "duration",
  "level",
  "instructor",
  "categories"
])