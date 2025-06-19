import { z } from "zod";

export const courseLevelSchema = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;
export const courseStatusSchema = ["Draft", "Published", "Archived"] as const;
export const courseCategorySchema = ["Development", "Business", "Finance", "IT & Software", "Personal Development", "Marketing", "Design", "Life Skills", "Health & Fitness", "Music", "Other"] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must be less than 100 characters" }),
  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters" })
    .max(2000, { message: "Description must be less than 2000 characters" }),
  fileKey: z.string().min(1, { message: "File key is required" }),
  price: z.coerce.number().min(0), // allow free courses
  duration: z.coerce
    .number()
    .min(1, { message: "Duration must be greater than 0" })
    .max(500, { message: "Duration must be less than 500" }),
  level: z.enum(courseLevelSchema, {
    message: "Level is required",
  }),
  category: z.enum(courseCategorySchema, {
    message: "Category is required",
  }),
  smallDescription: z
    .string()
    .min(3, { message: "Small description must be at least 3 characters" })
    .max(200, {
      message: "Small description must be less than 200 characters",
    }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters" }),
  status: z.enum(courseStatusSchema, {
    message: "Status is required",
  }),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
