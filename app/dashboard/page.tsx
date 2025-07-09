import { Suspense } from "react";
import { getEnrolledCourses } from "@/app/data/user/get-enrolled-courses";
import { getAllCourses } from "@/app/data/course/get-all-courses";
import { EmptyCourseState } from "@/components/general/empty-course-state";
import { PublicCourseCard } from "../(public)/_components/public-course-card";
import Link from "next/link";

export default async function DashboardPage() {
  const [enrolledCourses, allCourses] = await Promise.all([
    getEnrolledCourses(),
    getAllCourses(),
  ]);

  const coursesUserHasNotEnrolledIn = allCourses.filter(
    (course) =>
      !enrolledCourses.some(
        ({ course: enrolledCourse }) => enrolledCourse.id === course.id
      )
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Enrolled Courses</h1>
        <p className="text-muted-foreground">
          Here are the courses you have enrolled in
        </p>
      </div>

      {enrolledCourses.length === 0 ? (
        <EmptyCourseState
          title="No enrolled courses"
          description="You haven't enrolled in any courses yet"
          buttonText="Browse Courses"
          href="/courses"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrolledCourses.map((course) => (
            <Link
              href={`/dashboard/${course.course.slug}`}
              key={course.course.id}
            >
              {course.course.title}
            </Link>
          ))}
        </div>
      )}

      <section className="mt-10">
        <div className="flex flex-col gap-2 mb-5">
          <h1 className="text-3xl font-bold">Available Courses</h1>
          <p className="text-muted-foreground">
            Here are the courses you can enroll in
          </p>
        </div>

        {coursesUserHasNotEnrolledIn.length === 0 ? (
          <EmptyCourseState
            title="No available courses"
            description="All courses are already enrolled"
            buttonText="Browse Courses"
            href="/courses"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coursesUserHasNotEnrolledIn.map((course) => (
              <PublicCourseCard key={course.id} data={course} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
