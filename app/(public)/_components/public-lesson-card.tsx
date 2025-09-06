import Image from "next/image";
import Link from "next/link";
import { LessonType } from "@/app/data/lesson/get-all-lessons";

import { School, TimerIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ForwardButton } from "@/components/ui/forward-button";
import { useConstructUrl } from "@/hooks/use-construct-url";

interface Props {
  data: LessonType;
}

export function PublicLessonCard({ data }: Props) {
  //   const thumbnailUrl = useConstructUrl(data.fileKey);
  const thumbnailUrl = useConstructUrl(data.thumbnailKey || "");
  return (
    <Card className="group relative py-0 gap-0">
      {/* <Badge className="absolute top-2 right-2 z-10">{data.level}</Badge> */}
      <Image
        src={data.thumbnailKey ? thumbnailUrl : "/placeholder-lesson-thumbnail.jpg"}
        alt="Thumbnail for lesson"
        width={600}
        height={400}
        className="w-full rounded-t-xl aspect-video h-full object-cover"
      />
      <CardContent className="p-6">
        <Link
          href={`/dashboard/${data.chapter.course.slug}/${data.id}`}
          className="font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors"
        >
          {data.title}
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-tight mt-2">
          {/* {data} */}
        </p>

        <div className="flex items-center gap-x-5 mt-4">
          <div className="flex items-center gap-x-2">
            <TimerIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <p className="text-sm text-muted-foreground">{data.position}h</p>
          </div>

          <div className="flex items-center gap-x-2">
            <School className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <p className="text-sm text-muted-foreground">{data.chapter.course.slug}</p>
          </div>
        </div>
        {/* <Link
          href={`/courses/${data.slug}`}
          className={buttonVariants({ className: "w-full mt-4" })}
        >
          View Course
        </Link> */}
        <div className="mt-4">
          <ForwardButton
            variant="secondary"
            label="View Lesson"
            href={`/dashboard/${data.chapter.course.slug}/${data.id}`}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function PublicLessonCardSkeleton() {
  return (
    <Card className="group relative py-0 gap-0">
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
