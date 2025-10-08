"use client";

import Link from "next/link";
import { LessonType } from "@/app/data/lesson/get-all-lessons";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ForwardButton } from "@/components/ui/forward-button";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { DynamicThumbnail } from "@/app/dashboard/lessons/[lessonId]/_components/dynamic-thumbnail";

interface Props {
  data: LessonType;
  isPublic?: boolean;
}

export function PublicLessonCard({ data, isPublic = false }: Props) {
  const thumbnailUrl = useConstructUrl(data.thumbnailKey || "");
  const linkHref = isPublic
    ? `/lessons/${data.id}`
    : `/dashboard/lessons/${data.id}`;

  return (
    <div className="group relative">
      <Link href={linkHref}>
        <Card className="p-0 group relative py-0 gap-0 hover:scale-[1.02] transition-all duration-300 !border-2 !border-border dark:!border-muted-foreground/30 hover:!border-primary/60 dark:hover:!border-primary/70 shadow-lg hover:shadow-xl overflow-hidden">
          <DynamicThumbnail
            title={data.title}
            thumbnailUrl={thumbnailUrl}
            categories={data.categories}
            difficulty={data.difficulty}
          />
          <CardContent className="py-4">
            <div className="">
              <ForwardButton
                variant="secondary"
                label="View Lesson"
                useLink={false}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

export function PublicLessonCardSkeleton() {
  return (
    <Card className="group relative py-0 gap-0 !border-2 !border-border dark:!border-muted-foreground/30 shadow-lg">
      <div className="absolute top-2 right-2 z-10 flex items-center">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="w-full relative h-fit">
        <Skeleton className="w-full rounded-b-none aspect-video" />
      </div>

      <CardContent className="p-6 pb-6">
        <div className="space-y-4 mt-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>

        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-4 w-8" />
          </div>

          <div className="flex items-center gap-x-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>

        <Skeleton className="w-full mt-4 h-10 rounded-md" />
      </CardContent>
    </Card>
  );
}
