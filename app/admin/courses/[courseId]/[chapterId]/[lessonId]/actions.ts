"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { lessonSchema, LessonSchemaType } from "@/lib/zod-schemas";

interface Props {
  formData: LessonSchemaType;
  lessonId: string;
}

export const updateLesson = async ({
  formData,
  lessonId,
}: Props): Promise<ApiResponse> => {
  await requireAdmin();

  try {
    const result = lessonSchema.safeParse(formData);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid form data",
      };
    }

    await prisma.lesson.update({
        where: {
            id: lessonId
        }, 
        data: {
            title: formData.title,
            description: formData.description,
            thumbnailKey: formData.thumbnailKey,
            videoKey: formData.videoKey,
        }
    });

    return {
        status: "success",
        message: "Lesson updated successfully",
    }
  } catch {
    return {
      status: "error",
      message: "Failed to update lesson",
    };
  }
};
