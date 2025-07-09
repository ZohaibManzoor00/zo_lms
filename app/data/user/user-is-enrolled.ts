import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export const checkIfCourseBought = async (courseId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) return false;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    select: { status: true },
  });

  return enrollment?.status === "Active";
};
