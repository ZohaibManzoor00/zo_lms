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
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ForwardButton } from "@/components/ui/forward-button";
import { cn } from "@/lib/utils";
import { Award } from "lucide-react";

interface Props {
  data: EnrolledCourseType;
}

export function CourseProgressCard({ data }: Props) {
  const thumbnailUrl = useConstructUrl(data.course.fileKey);
  const { totalLessons, completedLessons, progressPercentage } =
    useCourseProgress({ courseData: data.course as CourseProgressData });
  const isCourseComplete = completedLessons === totalLessons;

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
        <div className="flex justify-between items-center">
          <Link
            href={`/dashboard/${data.course.slug}`}
            className="font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors"
          >
            {data.course.title}
          </Link>
          {isCourseComplete && <Award className="size-5 text-yellow-400" />}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-tight mt-2">
          {data.course.smallDescription}
        </p>

        <div className="space-y-2 mt-3">
          <div
            className={cn(
              "flex justify-between text-sm",
              isCourseComplete && "text-green-600"
            )}
          >
            <span>Progress</span>
            <p className="font-medium">{progressPercentage}%</p>
          </div>
          <Progress
            value={progressPercentage}
            className={cn("h-1.5", isCourseComplete && "bg-green-600")}
            indicatorClassName={isCourseComplete ? "bg-green-600" : ""}
          />
          <p
            className={cn(
              "text-xs text-muted-foreground",
              isCourseComplete && "text-green-500"
            )}
          >
            {completedLessons} of {totalLessons} lessons completed
          </p>
        </div>
        {/* <div className="flex justify-between items-center"> */}
          <div className={cn("mt-4")}>
            <ForwardButton
              className="w-full"
              label="View Course"
              href={`/dashboard/${data.course.slug}`}
            />
          </div>
          {/* <ForwardButton
            className="w-full"
            label="Admin Edit"
            variant="default"
            href={`/admin/courses/${data.course.id}/edit`}
          /> */}
        {/* </div> */}
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
