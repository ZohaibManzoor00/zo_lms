"use server";

import { prisma } from "@/lib/db";
import { courseSchema, CourseSchemaType } from "@/lib/zod-schemas";
import { ApiResponse } from "@/lib/types";
import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";
import { tryCatch } from "@/hooks/try-catch";

const aj = arcjet.withRule(fixedWindow({ mode: "LIVE", window: "1m", max: 5 }));

export const createCourse = async (
  data: CourseSchemaType
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

      const validation = courseSchema.safeParse(data);
      if (!validation.success) {
        throw new Error("Invalid form data");
      }

      const newStripeProductData = await stripe.products.create({
        name: validation.data.title,
        description: validation.data.smallDescription,
        default_price_data: {
          currency: "usd",
          unit_amount: validation.data.price * 100,
        },
      });

      await prisma.course.create({
        data: {
          ...validation.data,
          userId: session.user.id,
          stripePriceId: newStripeProductData.default_price as string,
        },
      });
    })()
  );

  if (error) {
    console.error(error);
    return {
      status: "error",
      message: error.message || "Failed to create course",
    };
  }

  revalidatePath("/courses");

  return {
    status: "success",
    message: "Course created successfully",
  };
};
