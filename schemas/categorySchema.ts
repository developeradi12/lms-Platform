import { z } from "zod"

export const createCategoryFormSchema = z.object({
  name: z.string().min(6, "Name is required"),
  description: z.string().min(6, "Description is required"),
  image: z
    .instanceof(File)
    .refine((file) => !file || file.size <= 2 * 1024 * 1024, "Max 2MB")
    .refine(
      (file) =>
        !file || ["image/png", "image/jpeg", "image/webp"].includes(file.type),
      "Only PNG/JPG/WEBP allowed"
    ),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export const createCategoryApiSchema = z.object({
  name: z.string().min(6, "Name is required"),
  description: z.string().min(6, "Description is required"),
  image: z.string().optional(),//url came later
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})
export const updateCategorySchema = z.object({
  name: z.string().min(6, "Name is required"),
  description: z.string().optional(),
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
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export const categorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  image: z.string().default(""),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type CreateCategoryFormValues = z.infer<typeof createCategoryFormSchema>
export type CreateCategoryBody = z.infer<typeof createCategoryApiSchema>
export type UpdateCategoryform = z.infer<typeof updateCategorySchema>
export type Category = z.infer<typeof categorySchema>
