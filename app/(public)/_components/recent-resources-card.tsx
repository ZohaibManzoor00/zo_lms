import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, LucideIcon } from "lucide-react";
import {
  RecentCourseType,
  RecentLessonType,
  RecentCodeSnippetType,
} from "@/app/data/homepage/get-recent-resources";
import { ResourceItem } from "./client-resource-item";

export interface ResourceItemType {
  id: string;
  title: string;
  createdAt: Date;
  href: string;
  type: string;
}

interface RecentResourcesCardProps {
  title: string;
  icon: LucideIcon;
  items: ResourceItemType[];
  viewAllHref: string;
  emptyMessage: string;
}

export function RecentResourcesCard({
  title,
  icon: Icon,
  items,
  viewAllHref,
  emptyMessage,
}: RecentResourcesCardProps) {
  return (
    <Card className="bg-gradient-to-br from-background/10 to-background/5 h-full flex flex-col border-2 border-border dark:border-muted-foreground/30 shadow-lg hover:shadow-xl hover:border-primary/60 dark:hover:border-primary/70 transition-all duration-300 backdrop-blur-sm">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary drop-shadow-sm" />
          <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            {title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="space-y-2 flex-1">
              {Array.from({ length: 3 }).map((_, index) => {
                const item = items[index];
                return (
                  <div
                    key={item?.id || `placeholder-${index}`}
                    className="w-full"
                  >
                    {item ? (
                      <ResourceItem item={item} />
                    ) : (
                      <div className="h-16 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center bg-gradient-to-r from-muted/20 to-muted/10">
                        <span className="text-xs text-muted-foreground/50">
                          Coming soon
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-border dark:border-muted-foreground/30 flex-shrink-0">
          <Link
            href={viewAllHref}
            className="inline-flex items-center text-sm text-primary hover:text-primary/80 hover:underline transition-colors duration-200 font-medium"
          >
            View all {title.toLowerCase()}
            <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Generic resource item renderer with enhanced styling

// Helper functions to transform data into ResourceItem format
export function transformCourseToResourceItem(
  course: RecentCourseType
): ResourceItemType {
  return {
    id: course.id,
    title: course.title,
    createdAt: course.createdAt,
    href: `/courses/${course.slug}`,
    type: course.category,
  };
}

export function transformLessonToResourceItem(
  lesson: RecentLessonType
): ResourceItemType {
  const hasVideo = !!lesson.videoKey;
  const hasWalkthrough = lesson.walkthroughs && lesson.walkthroughs.length > 0;

  const getType = () => {
    if (hasVideo && hasWalkthrough) return "Video + Walkthrough";
    if (hasVideo) return "Video";
    if (hasWalkthrough) return "Walkthrough";
    return "Lesson";
  };

  return {
    id: lesson.id,
    title: lesson.title,
    createdAt: lesson.createdAt,
    href: `/dashboard/lessons/${lesson.id}`,
    type: getType(),
  };
}

export function transformCodeSnippetToResourceItem(
  snippet: RecentCodeSnippetType
): ResourceItemType {
  return {
    id: snippet.id,
    title: snippet.title,
    createdAt: snippet.createdAt,
    href: `/code-snippets/${snippet.id}`,
    type: snippet.language || "Code Snippet",
  };
}
