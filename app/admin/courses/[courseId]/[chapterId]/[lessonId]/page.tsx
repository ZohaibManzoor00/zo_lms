import { adminGetLesson } from "@/app/data/admin/admin-get-lesson";
import { LessonForm } from "./_components/lesson-form";

interface Params {
  params: Promise<{ courseId: string; chapterId: string; lessonId: string }>;
}

export default async function LessonPage({ params }: Params) {
  const { courseId, chapterId, lessonId } = await params;
  const lesson = await adminGetLesson(lessonId);

  return <LessonForm lesson={lesson} chapterId={chapterId} courseId={courseId} />;
}
