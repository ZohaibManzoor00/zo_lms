import Image from "next/image";
import Link from "next/link";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { CourseType } from "@/app/data/course/get-all-courses";
import { School, TimerIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ForwardButton } from "@/components/ui/forward-button";

interface Props {
  data: CourseType;
}

export function PublicCourseCard({ data }: Props) {
  const thumbnailUrl = useConstructUrl(data.fileKey);

  return (
    <Link href={`/dashboard/courses/${data.slug}`} className="group hover:scale-[1.02] transition-all duration-300">
      <Card className="group relative py-0 gap-0">
        <Badge className="absolute top-2 right-2 z-10">{data.level}</Badge>
        <Image
          src={thumbnailUrl}
          alt="Thumbnail for course"
          width={600}
          height={400}
          className="w-full rounded-t-xl aspect-video h-full object-cover"
        />

        <CardContent className="p-6">
          <h3
            className="font-medium text-lg group-hover:underline line-clamp-1 hover:underline group-hover:text-primary transition-colors"
          >
            {data.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-tight mt-2">
            {data.smallDescription}
          </p>

          <div className="flex items-center gap-x-5 mt-4">
            <div className="flex items-center gap-x-2">
              <TimerIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
              <p className="text-sm text-muted-foreground">{data.duration}h</p>
            </div>

            <div className="flex items-center gap-x-2">
              <School className="size-6 p-1 rounded-md text-primary bg-primary/10" />
              <p className="text-sm text-muted-foreground">{data.category}</p>
            </div>
          </div>
          <div className="mt-4">
            <ForwardButton
              variant="secondary"
              label="View Course"
              useLink={false}
              // href={`/courses/${data.slug}`}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
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
