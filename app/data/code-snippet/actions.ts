"use server";

import { incrementSnippetUsage, UsageType } from "./increment-snippet-usage";
import { revalidateTag } from "next/cache";
import { tryCatch } from "@/hooks/try-catch";

export async function trackSnippetUsage(snippetId: string, type: UsageType) {
  const { data: updatedSnippet, error } = await tryCatch(incrementSnippetUsage(snippetId, type));
  if (error) return { success: false, error: error.message };

  revalidateTag("code-snippets");
  revalidateTag("homepage");

  return {
    success: true,
    snippet: updatedSnippet,
    message: `${type} count incremented successfully`,
  };
}
