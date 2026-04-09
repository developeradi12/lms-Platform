import z from "zod";

export const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "description must be 10 characters"),
  videoUrl: z.string().url("Enter a valid video URL"),
  duration: z.coerce.number().min(0, "Duration must be at least 0").optional(),
  order: z.coerce.number().min(0).optional(),
  isFreePreview: z.boolean().optional(),
  resources: z.array(
    z.object({
      file: z.any(),
      type: z.enum(["NOTE", "ASSIGNMENT"]),
    })
  ).optional()
})


export type LessonFormValues = z.input<typeof formSchema>