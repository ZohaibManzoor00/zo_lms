import { Suspense } from "react";
import { getAllLessons } from "@/app/data/lesson/get-all-lessons";
import { PublicLessonCard, PublicLessonCardSkeleton } from "../_components/public-lesson-card";
// import { PublicLessonCard, PublicLessonCardSkeleton } from "../_components/public-lesson-card";

export default function PublicLessonsPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
          Explore Lessons
        </h1>
        <p className="text-muted-foreground">
          Discover a wide range of lessons designed to help you learn new skills
          and advance your career.
        </p>
      </div>

      <Suspense fallback={<LoadingCoursesSkeletonLayout />}>
        <RenderLessons />
      </Suspense>
    </>
  );
}

async function RenderLessons() {
  const lessons = await getAllLessons();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson) => (
        <PublicLessonCard key={lesson.id} data={lesson} />
      ))}
    </div>
  );
}

function LoadingCoursesSkeletonLayout() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, index) => <PublicLessonCardSkeleton key={index} /> )}
    </div>
  );
}
