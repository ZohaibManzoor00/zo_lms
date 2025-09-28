import "server-only";

import { prisma } from "@/lib/db";

export const getCodeSnippetById = async (id: string) => {
  const snippet = await prisma.codeSnippet.findUnique({
    where: {
      id,
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

export type CodeSnippetDetailType = Awaited<
  ReturnType<typeof getCodeSnippetById>
>;
