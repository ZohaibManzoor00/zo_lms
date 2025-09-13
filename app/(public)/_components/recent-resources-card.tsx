import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, LucideIcon } from "lucide-react";
import {
  RecentCourseType,
  RecentLessonType,
  RecentCodeSnippetType,
} from "@/app/data/homepage/get-recent-resources";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResourceItem {
  id: string;
  title: string;
  createdAt: Date;
  href: string;
  type: string;
}

interface RecentResourcesCardProps {
  title: string;
  icon: LucideIcon;
  items: ResourceItem[];
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
    <Card className="bg-background/10 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
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
                      <div className="h-16 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground/50">
                          No more items
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t flex-shrink-0">
          <Link
            href={viewAllHref}
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            View all {title.toLowerCase()}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Generic resource item renderer
function ResourceItem({ item }: { item: ResourceItem }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <Link
      href={item.href}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "flex items-center justify-between w-full px-4 py-3 rounded-lg shadow-sm group transition-colors hover:bg-accent/60 h-16"
      )}
    >
      <div className="flex gap-x-2 items-center min-w-0 flex-1">
        <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(item.createdAt)}
        </p>
      </div>
      <div className="flex-shrink-0 ml-4">
        <Badge variant="secondary" className="text-xs px-2 py-0.5 min-w-fit">
          {item.type}
        </Badge>
      </div>
    </Link>
  );
}

// Helper functions to transform data into ResourceItem format
export function transformCourseToResourceItem(
  course: RecentCourseType
): ResourceItem {
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
): ResourceItem {
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
): ResourceItem {
  return {
    id: snippet.id,
    title: snippet.title,
    createdAt: snippet.createdAt,
    href: `/code-snippets/${snippet.id}`,
    type: snippet.language || "Code Snippet",
  };
}
