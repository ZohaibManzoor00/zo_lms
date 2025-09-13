import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getStandaloneLessonContent } from "@/app/data/lesson/get-standalone-lesson-content";

import { StandaloneLessonContent } from "./_components/standalone-lesson-content";
import { LessonSkeleton } from "@/app/dashboard/[slug]/[lessonId]/_components/lesson-skeleton";

interface Params {
  params: Promise<{ lessonId: string }>;
}

export default async function DashboardStandaloneLessonPage({
  params,
}: Params) {
  const { lessonId } = await params;

  try {
    const lessonContent = await getStandaloneLessonContent(lessonId);
    if (!lessonContent) return redirect("/dashboard/lessons");

    return (
      <Suspense fallback={<LessonSkeleton />}>
        <StandaloneLessonContentLoader lessonId={lessonId} />
      </Suspense>
    );
  } catch (error) {
    return redirect("/dashboard/lessons");
  }
}

const StandaloneLessonContentLoader = async ({
  lessonId,
}: {
  lessonId: string;
}) => {
  try {
    const data = await getStandaloneLessonContent(lessonId);
    return <StandaloneLessonContent data={data} />;
  } catch (error) {
    return redirect("/dashboard/lessons");
  }
};
