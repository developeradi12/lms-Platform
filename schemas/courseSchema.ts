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
    .instanceof(File)
    .refine((file) => !file || file.size <= 2 * 1024 * 1024, "Max 2MB")
    .refine(
      (file) =>
        !file || ["image/png", "image/jpeg", "image/webp"].includes(file.type),
      "Only PNG/JPG/WEBP allowed"
    ),
  chapters: z.array(z.string()).optional().default([]), // ObjectId[] as string[]
  price: z.number().min(0).optional().default(0),
  duration: z.number().min(0).optional().default(0), // minutes
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional().default("BEGINNER"),
  categories: z.array(z.string()).min(1, "Primary category is required"),
  tags: z.array(z.string()),
  prerequisites: z.array(z.string()),
  isPublished: z.boolean().default(false),
})


export const CourseCreateApiSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be less than 120 characters")
    .trim(),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),

  thumbnail: z.string().optional(),//url came later
  category: z.string().min(1, "Category is required"), // ObjectId as string
  chapters: z.array(z.string()).optional().default([]), // ObjectId[] as sting[]
  price: z.number().min(0).optional().default(0),
  duration: z.number().min(0).optional().default(0), // minutes
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional().default("BEGINNER"),
  isPublished: z.boolean().optional().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export const CourseUpdateSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be less than 120 characters")
    .trim(),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),

  imageUrl: z.string().optional(), // old url
  // new file upload (optional)
  imageFile: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 2 * 1024 * 1024, "Max 2MB")
    .refine(
      (file) =>
        !file || ["image/png", "image/jpeg", "image/webp"].includes(file.type),
      "Only PNG/JPG/WEBP allowed"
    ),
  category: z.string().min(1, "Category is required"), // ObjectId as string
  chapters: z.array(z.string()).optional().default([]), // ObjectId[] as sting[]
  price: z.number().min(0).optional().default(0),
  duration: z.number().min(0).optional().default(0), // minutes
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional().default("BEGINNER"),
  isPublished: z.boolean().optional().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
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
export type CourseCreateApiInput = z.infer<typeof CourseCreateApiSchema>
