import { z } from "zod";

export const courseLevelSchema = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;
export const courseStatusSchema = ["Draft", "Published", "Archived"] as const;
export const courseCategorySchema = [
  "Data Structures & Algorithms",
  "Frontend Development",
  "Backend Development",
  "Fullstack Development",
  "Other",
] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must be less than 100 characters" }),
  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters" })
    .max(2000, { message: "Description must be less than 2000 characters" }),
  fileKey: z.string().min(1, { message: "File is required" }),
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

export const chapterSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  courseId: z
    .string()
    .uuid({ message: "Invalid course ID" })
    .min(1, { message: "Course is required" }),
});

export const lessonSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  chapterId: z
    .string()
    .uuid({ message: "Invalid chapter ID" })
    .min(1, { message: "Chapter is required" }),
  courseId: z
    .string()
    .uuid({ message: "Invalid course ID" })
    .min(1, { message: "Course is required" }),
  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters" })
    .optional(),
  videoKey: z.string().optional(),
  thumbnailKey: z.string().optional(),
  walkthroughIds: z.string().array().optional(),
});

export const standaloneLessonSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  videoKey: z.string().optional(),
  thumbnailKey: z.string().optional(),
  walkthroughIds: z.string().array().optional(),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
export type ChapterSchemaType = z.infer<typeof chapterSchema>;
export type LessonSchemaType = z.infer<typeof lessonSchema>;
export type StandaloneLessonSchemaType = z.infer<typeof standaloneLessonSchema>;
