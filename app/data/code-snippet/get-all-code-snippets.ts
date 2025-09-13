import "server-only";

import { prisma } from "@/lib/db";

export const getAllCodeSnippets = async () => {
  const data = await prisma.codeSnippet.findMany({
    where: {
      isPublic: true,
    },
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
      author: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  return data;
};

export type CodeSnippetType = Awaited<
  ReturnType<typeof getAllCodeSnippets>
>[number];
