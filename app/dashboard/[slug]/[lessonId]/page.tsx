import { redirect } from "next/navigation";
import { CourseContent } from "./_components/course-content";
import { getLessonContent } from "@/app/data/course/get-lesson";

interface Params {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonContentPage({ params }: Params) {
  const { lessonId } = await params;
  const lessonContent = await getLessonContent(lessonId);

  if (!lessonContent) return redirect("/dashboard");

  return <CourseContent data={lessonContent} />;
}
