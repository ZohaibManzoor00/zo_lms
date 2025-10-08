"use server";

import { prisma } from "@/lib/db";
import {
  standaloneLessonSchema,
  StandaloneLessonSchemaType,
} from "@/lib/zod-schemas";
import { ApiResponse } from "@/lib/types";
import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath, revalidateTag } from "next/cache";
import { tryCatch } from "@/hooks/try-catch";

const aj = arcjet.withRule(fixedWindow({ mode: "LIVE", window: "1m", max: 5 }));

export const createStandaloneLesson = async (
  data: StandaloneLessonSchemaType
): Promise<ApiResponse> => {
  const session = await requireAdmin();

  const { error } = await tryCatch(
    (async () => {
      const req = await request();
      const decision = await aj.protect(req, { fingerprint: session.user.id });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          throw new Error("Too many requests, please try again later.");
        }
        throw new Error(
          "Bot detected! If this is a mistake contact our support directly"
        );
      }

      const validation = standaloneLessonSchema.safeParse(data);
      if (!validation.success) {
        throw new Error("Invalid form data");
      }

      const maxPosition = await prisma.lesson.findFirst({
        where: { chapterId: null },
        select: { position: true },
        orderBy: { position: "desc" },
      });

      const lesson = await prisma.lesson.create({
        data: {
          title: validation.data.title,
          description: validation.data.description,
          videoKey: validation.data.videoKey,
          thumbnailKey: validation.data.thumbnailKey,
          position: (maxPosition?.position ?? 0) + 1,
          chapterId: null, // Standalone lesson
          categories: validation.data.categories || [],
          difficulty: validation.data.difficulty,
          leetCodeSlug: validation.data.leetCodeSlug,
        },
      });

      if (
        validation.data.walkthroughIds &&
        validation.data.walkthroughIds.length > 0
      ) {
        const walkthroughData = validation.data.walkthroughIds.map(
          (walkthroughId, index) => ({
            lessonId: lesson.id,
            walkthroughId,
            position: index + 1,
          })
        );

        await prisma.lessonWalkthrough.createMany({
          data: walkthroughData,
        });
      }
    })()
  );

  if (error) {
    console.error(error);
    return {
      status: "error",
      message: error.message || "Failed to create lesson",
    };
  }

  revalidatePath("/admin/lessons");
  revalidateTag("lessons");
  revalidateTag("homepage");

  return {
    status: "success",
    message: "Lesson created successfully",
  };
};
