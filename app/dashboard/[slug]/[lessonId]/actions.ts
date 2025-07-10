"use server";

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

export const markLessonComplete = async (
  lessonId: string,
  slug: string
): Promise<ApiResponse> => {
  const user = await requireUser();

  try {
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lessonId,
        },
      },
    });

    const newCompletedStatus = existingProgress?.completed ? false : true;

    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lessonId,
        },
      },
      update: {
        completed: newCompletedStatus,
      },
      create: {
        userId: user.id,
        lessonId: lessonId,
        completed: newCompletedStatus,
      },
    });

    revalidatePath(`/dashboard/${slug}`);

    return {
      status: "success",
      message: `Lesson marked as ${
        newCompletedStatus ? "complete" : "incomplete"
      }`,
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update lesson completion status",
    };
  }
};
