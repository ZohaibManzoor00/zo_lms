import { Suspense } from "react";
import { BookOpen, Code, GraduationCap } from "lucide-react";

import { getHomepageData } from "@/app/data/homepage/get-recent-resources";
import {
  RecentResourcesCard,
  transformCodeSnippetToResourceItem,
  transformCourseToResourceItem,
  transformLessonToResourceItem,
} from "@/app/(public)/_components/recent-resources-card";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Homepage() {
  return (
    <>
      <section className="relative pt-15">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* <Badge variant="outline">Online learning made easy</Badge> */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Welcome to my learning hub.
          </h1>
          <p className="text-muted-foreground md:text-xl max-w-[700px]">
            Here you&apos;ll find the projects I&apos;ve built, the systems
            I&apos;ve designed, and the lessons I&apos;ve documented along the
            way. This space is both my portfolio and a living resource for
            anyone curious about how I think and build.
          </p>
        </div>
      </section>

      <section className="pt-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Suspense
              fallback={
                <>
                  <ResourceCardSkeleton />
                  <ResourceCardSkeleton />
                  <ResourceCardSkeleton />
                </>
              }
            >
              <HomepageResourcesSection />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}

async function HomepageResourcesSection() {
  const { courses, lessons, codeSnippets } = await getHomepageData();

  const transformedCourses = courses.map(transformCourseToResourceItem);
  const transformedLessons = lessons.map(transformLessonToResourceItem);
  const transformedCodeSnippets = codeSnippets.map(
    transformCodeSnippetToResourceItem
  );

  return (
    <>
      <RecentResourcesCard
        title="Latest Courses"
        icon={BookOpen}
        items={transformedCourses}
        viewAllHref="/courses"
        emptyMessage="No courses available yet."
      />
      <RecentResourcesCard
        title="Latest Lessons"
        icon={GraduationCap}
        items={transformedLessons}
        viewAllHref="/lessons"
        emptyMessage="No lessons available yet."
      />
      <RecentResourcesCard
        title="Latest Code Snippets"
        icon={Code}
        items={transformedCodeSnippets}
        viewAllHref="/code-snippets"
        emptyMessage="No code snippets available yet."
      />
    </>
  );
}

function ResourceCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-muted rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <Skeleton className="h-8 w-6" />
          <Skeleton className="h-8 w-30" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-15 w-full mb-1" />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t">
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  );
}
