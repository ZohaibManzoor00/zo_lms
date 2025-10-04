"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { lessonUpdateSchema, LessonUpdateSchemaType } from "@/lib/zod-schemas";

interface Props {
  formData: LessonUpdateSchemaType;
  lessonId: string;
}

export const updateLesson = async ({
  formData,
  lessonId,
}: Props): Promise<ApiResponse> => {
  await requireAdmin();

  try {
    const result = lessonUpdateSchema.safeParse(formData);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid form data",
      };
    }

    await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        title: formData.title,
        description: formData.description,
        thumbnailKey: formData.thumbnailKey,
        videoKey: formData.videoKey,
      },
    });

    // Update LessonWalkthrough join table
    if (Array.isArray(formData.walkthroughIds)) {
      // Remove all existing links
      await prisma.lessonWalkthrough.deleteMany({ where: { lessonId } });
      // Add new links in order
      await Promise.all(
        formData.walkthroughIds.map((walkthroughId, idx) =>
          prisma.lessonWalkthrough.create({
            data: {
              lessonId,
              walkthroughId,
              position: idx,
            },
          })
        )
      );
    }

    return {
      status: "success",
      message: "Lesson updated successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update lesson",
    };
  }
};
