import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export const getCodeSnippetById = async (snippetId: string) => {
  await requireAdmin();

  const snippet = await prisma.codeSnippet.findUnique({
    where: {
      id: snippetId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      code: true,
      language: true,
      tags: true,
      clickCount: true,
      isFeatured: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!snippet) return null;

  // Ensure language always has a value
  return {
    ...snippet,
    language: snippet.language ?? "bash",
  };
};

export const adminGetCodeSnippets = async () => {
  await requireAdmin();

  const snippets = await prisma.codeSnippet.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      code: true,
      language: true,
      tags: true,
      clickCount: true,
      isFeatured: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Ensure language always has a value
  return snippets.map((snippet) => ({
    ...snippet,
    language: snippet.language ?? "bash",
  }));
};

export type AdminCodeSnippetType = Awaited<
  ReturnType<typeof getCodeSnippetById>
>;

export type AdminCodeSnippetsType = Awaited<
  ReturnType<typeof adminGetCodeSnippets>
>[number];
