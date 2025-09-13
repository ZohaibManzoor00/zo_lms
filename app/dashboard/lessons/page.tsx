import { getAllLessons } from "@/app/data/lesson/get-all-lessons";
import { PublicLessonCard } from "@/app/(public)/_components/public-lesson-card";
import { EmptyCourseState } from "@/components/general/empty-course-state";

export default async function DashboardLessonsPage() {
  const lessons = await getAllLessons();

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">All Lessons</h1>
        <p className="text-muted-foreground">
          Explore all lessons across all our courses
        </p>
      </div>

      {lessons.length === 0 ? (
        <EmptyCourseState
          title="No lessons available"
          description="There are no published lessons available at the moment"
          buttonText="Browse Courses"
          href="/courses"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <PublicLessonCard key={lesson.id} data={lesson} />
          ))}
        </div>
      )}
    </>
  );
}
