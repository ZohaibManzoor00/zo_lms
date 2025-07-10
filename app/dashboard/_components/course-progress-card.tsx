"use client";

import Image from "next/image";
import Link from "next/link";
import { useConstructUrl } from "@/hooks/use-construct-url";
import {
  useCourseProgress,
  CourseProgressData,
} from "@/hooks/use-course-progress";
import { EnrolledCourseType } from "@/app/data/user/get-enrolled-courses";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface Props {
  data: EnrolledCourseType;
}

export function CourseProgressCard({ data }: Props) {
  const thumbnailUrl = useConstructUrl(data.course.fileKey);
  const { totalLessons, completedLessons, progressPercentage } =
    useCourseProgress({ courseData: data.course as CourseProgressData });

  return (
    <Card className="group relative py-0 gap-0">
      <Badge className="absolute top-2 right-2 z-10">{data.course.level}</Badge>
      <Image
        src={thumbnailUrl}
        alt="Thumbnail for course"
        width={600}
        height={400}
        className="w-full rounded-t-xl aspect-video h-full object-cover"
      />

      <CardContent className="p-6">
        <Link
          href={`/dashboard/${data.course.slug}`}
          className="font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors"
        >
          {data.course.title}
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-tight mt-2">
          {data.course.smallDescription}
        </p>

        <div className="space-y-4 mt-3">
          <div className="flex justify-between mb-1 text-sm">
            <p>Progress: </p>
            <p className="font-medium">{progressPercentage}%</p>
          </div>

          <Progress value={progressPercentage} className="h-1.5" />

          <p className="text-xs text-muted-foreground mt-1">
            {completedLessons} of {totalLessons} lessons completed
          </p>
        </div>

        <Link
          href={`/dashboard/${data.course.slug}`}
          className={buttonVariants({ className: "w-full mt-4" })}
        >
          Learn More
        </Link>
      </CardContent>
    </Card>
  );
}

export function PublicCourseCardSkeleton() {
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
