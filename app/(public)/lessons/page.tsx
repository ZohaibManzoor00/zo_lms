import { getAllLessons } from "@/app/data/lesson/get-all-lessons";
import { PublicLessonCard } from "@/app/(public)/_components/public-lesson-card";
import { EmptyCourseState } from "@/components/general/empty-course-state";

export default async function PublicLessonsPage() {
  const lessons = await getAllLessons();

  return (
    <div className="pb-10">
      <div className="flex flex-col space-y-2 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
          Explore Lessons
        </h1>
        <p className="text-muted-foreground">
          Discover a wide range of lessons designed to help you learn new skills
          and advance your career.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {lessons.map((lesson) => (
            <PublicLessonCard key={lesson.id} data={lesson} isPublic={true} />
          ))}
        </div>
      )}
    </div>
  );
}
