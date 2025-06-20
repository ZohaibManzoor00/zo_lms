"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { courseSchema, CourseSchemaType } from "@/lib/zod-schemas";
import { ApiResponse } from "@/lib/types";
import { auth } from "@/lib/auth";

export const createCourse = async (
  data: CourseSchemaType
): Promise<ApiResponse> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        status: "error",
        message: "Unauthorized",
      };
    }
    const validation = courseSchema.safeParse(data);
    if (!validation.success) {
      return {
        status: "error",
        message: "Invalid form data",
      };
    }

    await prisma.course.create({
      data: {
        ...validation.data,
        userId: session.user.id,
      },
    });

    return {
      status: "success",
      message: "Course created successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Failed to create course",
    };
  }
};
