import Image from "next/image";
import Link from "next/link";
import { AdminLessonType } from "@/app/data/admin/admin-get-lesson";
import { useConstructUrl } from "@/hooks/use-construct-url";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  PlayIcon,
  MoreVertical,
  Pencil,
  Trash2,
  School,
} from "lucide-react";
// import { Pill, PillIndicator, PillIndicatorProps } from "@/components/ui/pill";
import { ForwardButton } from "@/components/ui/forward-button";

interface Props {
  data: AdminLessonType;
}

// const pillIndicatorMap = {
//   Published: "success",
//   Archived: "error",
//   Draft: "warning",
// };
// const pillLabelMap = {
//   Published: "Active",
//   Archived: "Archived",
//   Draft: "Draft",
// };

export function AdminLessonCard({ data }: Props) {
  const thumbnailUrl = useConstructUrl(data.thumbnailKey || "");
  const hasThumbnail = !!data.thumbnailKey;
  const hasVideo = !!data.videoKey;
  const hasWalkthrough = data.walkthroughs && data.walkthroughs.length > 0;

  return (
    <Card className="group relative py-0 gap-0">
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/admin/lessons/${data.id}/edit`}>
                <Pencil className="size-4 text-yellow-600" />
                Edit Lesson
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/lessons/${data.id}`}>
                <Eye className="size-4 text-emerald-600" />
                Preview Lesson
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/admin/lessons/${data.id}/delete`}>
                <Trash2 className="size-4 text-destructive" />
                Delete Lesson
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Image
        src={hasThumbnail ? thumbnailUrl : "/placeholder-lesson-thumbnail.jpg"}
        className="rounded-t-lg w-full h-full aspect-video object-cover"
        alt="Thumbnail"
        width={600}
        height={400}
      />

      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <Link
            href={`/admin/lessons/${data.id}/edit`}
            className="font-medium text-lg line-clamp-1 hover:underline group-hover:text-primary transition-colors"
          >
            {data.title}
          </Link>
          {/* <Pill>
            <PillIndicator
              pulse={data.status === "Published"}
              variant={
                pillIndicatorMap[data.status] as PillIndicatorProps["variant"]
              }
            />
            {pillLabelMap[data.status]}
          </Pill> */}
        </div>
        {/* <p className="line-clamp-2 text-sm text-muted-foreground leading-tight mt-2">
          {data.smallDescription}
        </p> */}

        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <PlayIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <p className="text-sm text-muted-foreground">{hasVideo ? "Video" : "No Video"}</p>
          </div>

          <div className="flex items-center gap-x-2">
            <School className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <p className="text-sm text-muted-foreground">{hasWalkthrough ? "Walkthrough" : "No Walkthrough"}</p>
          </div>
        </div>

        <ForwardButton
          href={`/admin/lessons/${data.id}/edit`}
          label="Edit Course"
          variant="default"
          className="w-full mt-4"
        />
      </CardContent>
    </Card>
  );
}

export function AdminLessonCardSkeleton() {
  return (
    <Card className="group relative py-0 gap-0">
      {/* <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="size-8 rounded-md" />
      </div> */}
      <div className="w-full relative h-fit">
        <Skeleton className="w-full rounded-b-none aspect-video h-[200px] object-cover" />
      </div>

      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2 rounded" />
        <Skeleton className="h-4 w-full mb-4 rounded" />

        <div className="mt-4 flex items-center gap-x-5">
          {/* <div className="flex items-center gap-x-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-4 w-10 rounded" />
          </div>

          <div className="flex items-center gap-x-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-4 w-10 rounded" />
          </div> */}
        </div>

        <Skeleton className="w-full h-10 mt-4" />
      </CardContent>
    </Card>
  );
}
