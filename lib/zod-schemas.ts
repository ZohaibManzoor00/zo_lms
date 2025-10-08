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

export const lessonDifficultySchema = [
  "Easy",
  "Medium",
  "Hard",
  "VeryHard",
] as const;

export const lessonCategorySchema = [
  "Array",
  "String",
  "Hash Table",
  "Dynamic Programming",
  "Math",
  "Sorting",
  "Greedy",
  "Depth-First Search",
  "Database",
  "Binary Search",
  "Tree",
  "Breadth-First Search",
  "Matrix",
  "Two Pointers",
  "Binary Tree",
  "Heap (Priority Queue)",
  "Prefix Sum",
  "Stack",
  "Graph",
  "Design",
  "Backtracking",
  "Sliding Window",
  "Union Find",
  "Linked List",
  "Monotonic Stack",
  "Trie",
  "Divide and Conquer",
  "Queue",
  "Recursion",
  "Combinatorics",
  "Hash Function",
  "Memoization",
  "Topological Sort",
  "Binary Search Tree",
  "Minimum Spanning Tree",
  "Shortest Path",
  "Doubly-Linked List",
  "Probability and Statistics",
  "Quickselect",
  "Bucket Sort",
  "Suffix Array",
  "Merge Sort",
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
  categories: z.array(z.enum(lessonCategorySchema)).optional(),
  difficulty: z.enum(lessonDifficultySchema).optional(),
  leetCodeSlug: z.string().optional(),
});

export const lessonUpdateSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  chapterId: z
    .string()
    .uuid({ message: "Invalid chapter ID" })
    .min(1, { message: "Chapter is required" })
    .optional(),
  courseId: z
    .string()
    .uuid({ message: "Invalid course ID" })
    .min(1, { message: "Course is required" })
    .optional(),
  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters" })
    .optional(),
  videoKey: z.string().optional(),
  thumbnailKey: z.string().optional(),
  walkthroughIds: z.string().array().optional(),
  categories: z.array(z.enum(lessonCategorySchema)).optional(),
  difficulty: z.enum(lessonDifficultySchema).optional(),
  leetCodeSlug: z.string().optional(),
});

export const standaloneLessonSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  videoKey: z.string().optional(),
  thumbnailKey: z.string().optional(),
  walkthroughIds: z.string().array().optional(),
  categories: z.array(z.enum(lessonCategorySchema)).optional(),
  difficulty: z.enum(lessonDifficultySchema).optional(),
  leetCodeSlug: z.string().optional(),
});

// Programming languages array for consistency across the app
export const PROGRAMMING_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "c",
  "rust",
  "go",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "html",
  "css",
  "sql",
  "bash",
  "shell",
  "json",
  "yaml",
  "xml",
] as const;

export const createCodeSnippetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  language: z.string().min(1, "Language is required"),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional().default(false),
});

export const updateCodeSnippetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  language: z.string().min(1, "Language is required"),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional().default(false),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
export type ChapterSchemaType = z.infer<typeof chapterSchema>;
export type LessonSchemaType = z.infer<typeof lessonSchema>;
export type LessonUpdateSchemaType = z.infer<typeof lessonUpdateSchema>;
export type StandaloneLessonSchemaType = z.infer<typeof standaloneLessonSchema>;
export type CreateCodeSnippetSchemaType = z.infer<
  typeof createCodeSnippetSchema
>;
export type UpdateCodeSnippetSchemaType = z.infer<
  typeof updateCodeSnippetSchema
>;
