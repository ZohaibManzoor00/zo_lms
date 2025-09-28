"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { revalidatePath } from "next/cache";
import {
  updateCodeSnippetSchema,
  UpdateCodeSnippetSchemaType,
} from "@/lib/zod-schemas";

export async function updateCodeSnippet(
  snippetId: string,
  data: UpdateCodeSnippetSchemaType
) {
  await requireAdmin();

  const validatedData = updateCodeSnippetSchema.parse(data);

  try {
    const updatedSnippet = await prisma.codeSnippet.update({
      where: { id: snippetId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        code: validatedData.code,
        language: validatedData.language,
        tags: validatedData.tags || [],
        isFeatured: validatedData.isFeatured,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/code-snippets");
    revalidatePath("/code-snippets");

    return updatedSnippet;
  } catch (error) {
    console.error("Error updating code snippet:", error);
    throw new Error("Failed to update code snippet");
  }
}
