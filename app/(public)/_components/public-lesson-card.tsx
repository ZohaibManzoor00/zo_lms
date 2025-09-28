import Image from "next/image";
import Link from "next/link";
import { LessonType } from "@/app/data/lesson/get-all-lessons";

import { PlayIcon, School } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ForwardButton } from "@/components/ui/forward-button";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { cn } from "@/lib/utils";

interface Props {
  data: LessonType;
}

export function PublicLessonCard({ data }: Props) {
  const thumbnailUrl = useConstructUrl(data.thumbnailKey || "");
  const hasVideo = !!data.videoKey;
  const hasWalkthrough = data.walkthroughs && data.walkthroughs.length > 0;

  return (
    <Link href={`/dashboard/lessons/${data.id}`} className="group">
      <Card className="group relative py-0 gap-0 hover:scale-[1.02] transition-all duration-300 !border-2 !border-border dark:!border-muted-foreground/30 hover:!border-primary/60 dark:hover:!border-primary/70 shadow-lg hover:shadow-xl">
        <Image
          src={
            data.thumbnailKey
              ? thumbnailUrl
              : "/placeholder-lesson-thumbnail.jpg"
          }
          alt="Thumbnail for lesson"
          width={600}
          height={400}
          className="w-full rounded-t-xl aspect-video h-full object-cover"
        />
        <CardContent className="p-6">
          <h2 className="font-medium text-primary text-lg line-clamp-2 group-hover:underline transition-all duration-300">
            {data.title}
          </h2>

          <div
            className={cn(
              "flex items-center mt-3",
              hasVideo && hasWalkthrough ? "space-x-2" : ""
            )}
          >
            {hasVideo ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                <PlayIcon className="size-4" />
                Video
              </span>
            ) : (
              <span className="inline-flex items-center py-1"></span>
            )}
            {hasWalkthrough ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                <School className="size-4 mr-1" />
                Walkthrough
              </span>
            ) : (
              <span className="inline-flex items-center py-1"></span>
            )}
          </div>

          {/* <p className="text-sm text-muted-foreground line-clamp-2 leading-tight mt-2"> */}
          {/* {data.} */}
          {/* </p> */}

          <div className="mt-4">
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
