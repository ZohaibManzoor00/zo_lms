"use client";

import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { markLessonComplete } from "../actions";

import { LessonContentType } from "@/app/data/course/get-lesson-content";
import { RenderDescription } from "@/components/rich-text-editor/render-description";
import { Button } from "@/components/ui/button";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { BookIcon, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useConfetti } from "@/hooks/use-confetti";

interface Props {
  data: LessonContentType;
}

export function CourseContent({ data }: Props) {
  const [pending, startTransition] = useTransition();
  const { triggerConfetti } = useConfetti();
  const isCompleted =
    data.lessonProgress.length > 0 && data.lessonProgress[0].completed;

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
      const { data: result, error } = await tryCatch(
        markLessonComplete(data.id, data.chapter.course.slug)
      );

      if (error) {
        toast.error(
          "An unexpected error occurred while marking the lesson as complete"
        );
        return;
      }

      if (result?.status === "success") {
        if (isCompleted) {
          toast.success("Lesson marked as incomplete");
        } else {
          triggerConfetti();
          toast.success("Lesson marked as complete");
        }
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  };

  console.log(data.lessonProgress, "LESSON PROGRESS");

  return (
    <div className="flex flex-col h-full bg-background pl-6">
      <VideoPlayer
        thumbnailKey={data.thumbnailKey ?? ""}
        videoKey={data.videoKey ?? ""}
      />

      <div className="py-4 border-b">
        {data.lessonProgress.length > 0 && data.lessonProgress[0].completed ? (
          <Button variant="outline" onClick={onSubmit} disabled={pending}>
            <XCircle className="size-4 text-red-500" />
            Mark as incomplete
          </Button>
        ) : (
          <Button variant="outline" onClick={onSubmit} disabled={pending}>
            <CheckCircle className="size-4 text-green-500" />
            Mark as complete
          </Button>
        )}
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
