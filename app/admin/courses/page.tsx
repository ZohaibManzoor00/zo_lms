import { Suspense } from "react";
import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import {
  AdminCourseCard,
  AdminCourseCardSkeleton,
} from "./_components/admin-course";
import { EmptyCourseState } from "@/components/general/empty-course-state";
import { ForwardButton } from "@/components/ui/forward-button";

export default function CoursesPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Courses</h1>
        <ForwardButton href="/admin/courses/create" label="Create Course" variant="default" />
      </div>

      <Suspense fallback={<AdminCourseSkeletonLayout />}>
        <RenderCourses />
      </Suspense>
    </>
  );
}

async function RenderCourses() {
  const courses = await adminGetCourses();

  return (
    <>
      {courses.length === 0 ? (
        <EmptyCourseState
          title="No courses found"
          description="You haven't created any courses yet."
          buttonText="Create Course"
          href="/admin/courses/create"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7">
          {courses.map((course) => (
            <AdminCourseCard key={course.id} data={course} />
          ))}
        </div>
      )}
    </>
  );
}

function AdminCourseSkeletonLayout() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7">
      {Array.from({ length: 4 }).map((_, idx) => (
        <AdminCourseCardSkeleton key={idx} />
      ))}
    </div>
  );
}
