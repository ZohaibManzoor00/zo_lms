import { Skeleton } from "@/components/ui/skeleton";

export function LessonSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background px-6">
      <div className="space-y-4 mb-6">
        {/* Title skeleton */}
        <Skeleton className="h-9 w-3/4" />

        {/* Lesson metadata badges skeleton */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Difficulty badge */}
          <Skeleton className="h-6 w-16 rounded-md" />

          {/* Duration with icon */}
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>

          {/* Category with icon */}
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-1">
        {/* Video player skeleton */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>

        {/* Description content skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-1 w-full" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
        {/* Separator */}

        {/* Code walkthrough section skeleton (if present) */}
      </div>
    </div>
  );
}
