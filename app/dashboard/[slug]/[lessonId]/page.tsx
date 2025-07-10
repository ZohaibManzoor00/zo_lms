import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getLessonContent } from "@/app/data/course/get-lesson-content";

import { CourseContent } from "./_components/course-content";
import { LessonSkeleton } from "./_components/lesson-skeleton";

interface Params {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonContentPage({ params }: Params) {
  const { lessonId } = await params;
  const lessonContent = await getLessonContent(lessonId);

  if (!lessonContent) return redirect("/dashboard");

  return (
    <Suspense fallback={<LessonSkeleton />}>
      <LessonContentLoader lessonId={lessonId} />
    </Suspense>
  );
}

const LessonContentLoader = async ({ lessonId }: { lessonId: string }) => {
  const data = await getLessonContent(lessonId);

  return <CourseContent data={data} />;
};
