"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { ApiResponse } from "@/lib/types";

export const deleteCourse = async (courseId: string): Promise<ApiResponse> => {
  await requireAdmin();

  try {
    await prisma.course.delete({ where: { id: courseId } });

    revalidatePath("/admin/courses");

    return {
      status: "success",
      message: "Course deleted successfully",
    };
  } catch {
    return {
      status: "error",
      message: "An unexpected error occurred. Please try again.",
    };
  }
};
