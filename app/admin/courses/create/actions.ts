"use server";

import { prisma } from "@/lib/db";
import { courseSchema, CourseSchemaType } from "@/lib/zod-schemas";
import { ApiResponse } from "@/lib/types";
import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";

const aj = arcjet.withRule(fixedWindow({ mode: "LIVE", window: "1m", max: 5 }));

export const createCourse = async (
  data: CourseSchemaType
): Promise<ApiResponse> => {
  const session = await requireAdmin();
  try {
    const req = await request();
    const decision = await aj.protect(req, { fingerprint: session.user.id });
    
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "Too many requests, please try again later.",
        };
      }
      return {
        status: "error",
        message:
          "Bot detected! If this is a mistake contact our support directly",
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
