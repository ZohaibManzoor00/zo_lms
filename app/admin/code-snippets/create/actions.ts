"use server";

import { prisma } from "@/lib/db";
import { createCodeSnippetSchema, CreateCodeSnippetSchemaType } from "@/lib/zod-schemas";
import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";
import { tryCatch } from "@/hooks/try-catch";
import { ApiResponse } from "@/lib/types";

const aj = arcjet.withRule(fixedWindow({ mode: "LIVE", window: "1m", max: 5 }));

export const createCodeSnippet = async (data: CreateCodeSnippetSchemaType): Promise<ApiResponse> => {
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

      const validation = createCodeSnippetSchema.safeParse(data);
      if (!validation.success) {
        throw new Error("Invalid form data");
      }

      await prisma.codeSnippet.create({
        data: {
          ...validation.data,
          authorId: session.user.id,
        },
      });
    })()
  );

  if (error) {
    return {
      status: "error",
      message: error.message || "Failed to create code snippet",
    };
  }

  revalidatePath("/admin/code-snippets");
  revalidatePath("/code-snippets");

  return {
    status: "success",
    message: "Code snippet created successfully",
  };
};
