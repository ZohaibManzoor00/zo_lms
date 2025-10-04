import { getAllLessons } from "@/app/data/lesson/get-all-lessons";
import { EmptyCourseState } from "@/components/general/empty-course-state";
import { AllLessonsSidebar } from "./[lessonId]/_components/all-lessons-sidebar";
import { SelectLessonState } from "./_components/select-lesson-state";

export default async function DashboardLessonsPage() {
  const lessons = await getAllLessons();

  if (lessons.length === 0) {
    return (
      <EmptyCourseState
        title="No lessons available"
        description="There are no published lessons available at the moment"
        buttonText="Browse Courses"
        href="/courses"
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      <div className="border-r border-border shrink-0 overflow-y-auto">
        <AllLessonsSidebar lessons={lessons} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <SelectLessonState />
      </div>
    </div>
  );
}
