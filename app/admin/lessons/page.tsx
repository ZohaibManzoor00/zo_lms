import { Suspense } from "react";
import { adminGetLessons } from "@/app/data/admin/admin-get-lessons";
import {
  AdminLessonCard,
  AdminLessonCardSkeleton,
} from "./_components/admin-lesson-card";
import { EmptyCourseState } from "@/components/general/empty-course-state";
import { ForwardButton } from "@/components/ui/forward-button";

// Force dynamic rendering to always show fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function LessonsPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Lessons</h1>
        <ForwardButton
          href="/admin/lessons/create"
          label="Create Lesson"
          variant="default"
        />
      </div>

      <Suspense fallback={<AdminLessonSkeletonLayout />}>
        <RenderLessons />
      </Suspense>
    </>
  );
}

async function RenderLessons() {
  const lessons = await adminGetLessons();

  return (
    <>
      {lessons.length === 0 ? (
        <EmptyCourseState
          title="No lessons found"
          description="You haven't created any lessons yet."
          buttonText="Create Lesson"
          href="/admin/lessons/create"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {lessons.map((lesson) => (
            <AdminLessonCard key={lesson.id} data={lesson} />
          ))}
        </div>
      )}
    </>
  );
}

function AdminLessonSkeletonLayout() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-7">
      {Array.from({ length: 4 }).map((_, idx) => (
        <AdminLessonCardSkeleton key={idx} />
      ))}
    </div>
  );
}
