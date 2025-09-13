"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { tryCatch } from "@/hooks/try-catch";

const aj = arcjet.withRule(fixedWindow({ mode: "LIVE", window: "1m", max: 5 }));

export const deleteCourse = async (courseId: string): Promise<ApiResponse> => {
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

      await prisma.course.delete({ where: { id: courseId } });
    })()
  );

  if (error) {
    return {
      status: "error",
      message:
        error.message || "An unexpected error occurred. Please try again.",
    };
  }

  revalidatePath("/admin/courses");
  revalidatePath("/courses");

  return {
    status: "success",
    message: "Course deleted successfully",
  };
};
