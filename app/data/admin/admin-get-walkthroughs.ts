import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export const adminGetWalkthroughs = async () => {
  await requireAdmin();

  const walkthroughs = await prisma.codeWalkthrough.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      audioKey: true,
      createdAt: true,
      updatedAt: true,
      steps: {
        select: {
          code: true,
          timestamp: true,
          stepIndex: true,
        },
        orderBy: { stepIndex: "asc" },
      },
    },
  });

  return walkthroughs;
};

export type AdminWalkthroughType = Awaited<
  ReturnType<typeof adminGetWalkthroughs>
>;
