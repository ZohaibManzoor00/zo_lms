import { getCourseSidebarData } from "@/app/data/course/get-course-sidebar-data";
import { CourseSidebar } from "../_components/course-sidebar";

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function CourseLayout({ children, params }: Props) {
  const { slug } = await params;
  const { course } = await getCourseSidebarData(slug);

  return (
    <div className="flex">
      <div className="w-80 border-r border-border shrink-0 overflow-y-auto">
        <CourseSidebar course={course} />
      </div>

      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
