import { Types } from "mongoose"
import { z } from "zod"

export const CourseCreateSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be less than 120 characters")
    .trim(),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),

  thumbnail: z
    .instanceof(File, { message: "Thumbnail is required" })
    .refine((file) => !file || file.size <= 2 * 1024 * 1024, "Max 2MB")
    .refine(
      (file) =>
        !file || ["image/png", "image/jpeg", "image/webp"].includes(file.type),
      "Only PNG/JPG/WEBP allowed"
    ),
  price: z.number().min(0),
  duration: z.number().min(0), // minutes
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  categories: z.array(z.string()).min(1, "Primary category is required"),
  tags: z.array(z.string()),
  prerequisites: z.array(z.string()),
  isPublished: z.boolean(),
})


export const CourseUpdateSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be less than 120 characters")
    .trim()
    .optional(),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters")
    .optional(),

  thumbnailUrl: z.string().optional(), // old url
  // new file upload (optional)
  thumbnailFile: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 2 * 1024 * 1024, "Max 2MB")
    .refine(
      (file) =>
        !file || ["image/png", "image/jpeg", "image/webp"].includes(file.type),
      "Only PNG/JPG/WEBP allowed"
    ),
  categories: z.array(z.string()).optional(), // ObjectId as string
  price: z.number().min(0).optional(),
  duration: z.number().min(0).optional(), // minutes
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  isPublished: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
    metaDescription:z.string().optional(),
    metaTitle:z.string().optional(),
})

export interface CourseDocument {
  title: string
  slug: string
  description: string
  thumbnail: string

  instructor: Types.ObjectId
  categories: Types.ObjectId[]
  chapters: Types.ObjectId[]

  price: number
  duration: number
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  isPublished: boolean

  averageRating: number
  totalReviews: number
  totalEnrollments: number
  prerequisites: string[]
  tags: string[]
  metaTitle?: string
  metaDescription?: string

  createdAt: Date
  updatedAt: Date
}



// .partial() method creates a new schema where every property from the original schema is wrapped in an optional() modifier.
//Types.ObjectId = TS + runtime object
//Schema.Types.ObjectId = mongoose schema field type (safe + correct)

export type CourseCreateInput = z.infer<typeof CourseCreateSchema>
export type CourseUpdateInput = z.infer<typeof CourseUpdateSchema>
