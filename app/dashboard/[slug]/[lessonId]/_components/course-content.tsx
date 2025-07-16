"use client";

import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { markLessonComplete } from "../actions";
import { toast } from "sonner";
import { LessonContentType } from "@/app/data/course/get-lesson-content";
import { useOptimistic } from "react";

import { RenderDescription } from "@/components/rich-text-editor/render-description";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { BookIcon, CircleCheckBig } from "lucide-react";
import { HeartButton } from "@/components/ui/heart-button";
import { MotionIcon } from "@/components/ui/motion-button";

interface Props {
  data: LessonContentType;
}

export function CourseContent({ data }: Props) {
  const [pending, startTransition] = useTransition();
  const initialIsCompleted =
    data.lessonProgress.length > 0 && data.lessonProgress[0].completed;

  const [optimisticIsCompleted, setOptimisticIsCompleted] =
    useOptimistic(initialIsCompleted);

  const VideoPlayer = ({
    thumbnailKey,
    videoKey,
  }: {
    thumbnailKey: string;
    videoKey: string;
  }) => {
    const videoUrl = useConstructUrl(videoKey);
    const thumbnailUrl = useConstructUrl(thumbnailKey);

    if (!videoKey) {
      return (
        <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center">
          <BookIcon className="size-16 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            This lesson does not have a video yet.
          </p>
        </div>
      );
    }

    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        <video
          className="w-full h-full object-cover"
          controls
          poster={thumbnailUrl}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  const onSubmit = () => {
    startTransition(async () => {
      setOptimisticIsCompleted(!optimisticIsCompleted); // Optimistic update
      const currentToastId = toast.loading(
        `Marking lesson as ${
          optimisticIsCompleted ? "incomplete" : "complete"
        }...`
      );

      const { data: result, error } = await tryCatch(
        markLessonComplete(data.id, data.chapter.course.slug)
      );

      if (error) {
        toast.error(
          "An unexpected error occurred while marking the lesson as complete",
          { id: currentToastId }
        );
        setOptimisticIsCompleted(initialIsCompleted); // Revert on error
        return;
      }

      if (result?.status === "success") {
        toast.success(
          `Lesson marked as ${
            optimisticIsCompleted ? "incomplete" : "complete"
          }`,
          { id: currentToastId }
        );
      } else if (result?.status === "error") {
        toast.error(result.message, { id: currentToastId });
        setOptimisticIsCompleted(initialIsCompleted); // Revert on error
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-background pl-6">
      <VideoPlayer
        thumbnailKey={data.thumbnailKey ?? ""}
        videoKey={data.videoKey ?? ""}
      />

      <div className="flex justify-between items-center border-b py-4">
        <div className="flex gap-x-1 items-center">
          <MotionIcon
            isActive={optimisticIsCompleted} // Use optimistic state
            onChange={onSubmit}
            disabled={pending}
            icon={CircleCheckBig}
          />
        </div>
        <HeartButton
          initialCount={0}
          maxClicks={10}
          onChange={(count) => {
            console.log(count);
          }}
        />
      </div>
      <div className="space-y-3 pt-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {data.title}
        </h1>
        {data.description && (
          <RenderDescription json={JSON.parse(data.description)} />
        )}
      </div>
    </div>
  );
}
