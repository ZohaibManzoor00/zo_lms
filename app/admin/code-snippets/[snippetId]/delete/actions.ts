"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { revalidatePath } from "next/cache";

export async function deleteCodeSnippet(snippetId: string) {
  await requireAdmin();

  try {
    await prisma.codeSnippet.delete({
      where: { id: snippetId },
    });

    revalidatePath("/admin/code-snippets");
    revalidatePath("/code-snippets");

    return { success: true };
  } catch (error) {
    console.error("Error deleting code snippet:", error);
    throw new Error("Failed to delete code snippet");
  }
}
