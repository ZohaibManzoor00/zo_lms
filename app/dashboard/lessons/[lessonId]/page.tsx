import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getStandaloneLessonContent } from "@/app/data/lesson/get-standalone-lesson-content";
import { getAllLessons } from "@/app/data/lesson/get-all-lessons";

import { StandaloneLessonContent } from "./_components/standalone-lesson-content";
import { AllLessonsSidebar } from "./_components/all-lessons-sidebar";
import { LessonSkeleton } from "@/app/dashboard/lessons/[lessonId]/_components/lesson-skeleton";

interface Params {
  params: Promise<{ lessonId: string }>;
}

export default async function DashboardStandaloneLessonPage({
  params,
}: Params) {
  const { lessonId } = await params;

  try {
    const [lessonContent, lessons] = await Promise.all([
      getStandaloneLessonContent(lessonId),
      getAllLessons(),
    ]);

    if (!lessonContent) return redirect("/dashboard/lessons");

    return (
      <div className="flex h-[calc(100vh-7rem)]">
        <div className="border-r border-border shrink-0 overflow-y-auto">
          <AllLessonsSidebar lessons={lessons} currentLessonId={lessonId} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<LessonSkeleton />}>
            <StandaloneLessonContentLoader lessonId={lessonId} />
          </Suspense>
        </div>
      </div>
    );
  } catch {
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
  } catch {
    return redirect("/dashboard/lessons");
  }
};
