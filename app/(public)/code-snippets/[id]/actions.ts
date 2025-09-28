"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function incrementSnippetUsage(snippetId: string) {
  try {
    await prisma.codeSnippet.update({
      where: { id: snippetId },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    });

    // Revalidate the snippet detail page and listings
    revalidatePath(`/code-snippets/${snippetId}`);
    revalidatePath("/code-snippets");
    revalidatePath("/admin/code-snippets");

    return { success: true };
  } catch (error) {
    console.error("Error incrementing snippet usage:", error);
    return { success: false };
  }
}
