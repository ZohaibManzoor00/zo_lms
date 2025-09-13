import "server-only";

import { prisma } from "@/lib/db";

export type UsageType = "click";

export const incrementSnippetUsage = async (
  snippetId: string,
  type: UsageType
) => {
  const updateData = {
    ...(type === "click" && { clickCount: { increment: 1 } }),
  };

  const updatedSnippet = await prisma.codeSnippet.update({
    where: {
      id: snippetId,
    },
    data: updateData,
    select: {
      id: true,
      clickCount: true,
    },
  });

  return updatedSnippet;
};
