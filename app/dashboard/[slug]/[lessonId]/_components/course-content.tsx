"use client";

import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { markLessonComplete } from "../actions";
import { toast } from "sonner";
import { LessonContentType } from "@/app/data/course/get-lesson-content";
import { useOptimistic } from "react";

import { RenderDescription } from "@/components/rich-text-editor/render-description";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { BookIcon, CheckCircle, XCircle } from "lucide-react";
import { HeartButton } from "@/components/ui/heart-button";
import { CodeReviewPlaybackEditorV2 } from "@/components/audio-code-walkthrough";
import { Button } from "@/components/ui/button";

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
      setOptimisticIsCompleted(!optimisticIsCompleted);
      const currentToastId = toast.loading(
        `Marking lesson as ${
          optimisticIsCompleted ? "incomplete" : "complete"
        }...`
      );

      const { data: result, error } = await tryCatch(
        markLessonComplete(data.id, data.chapter?.course.slug ?? "")
      );

      if (error) {
        toast.error(
          "An unexpected error occurred while marking the lesson as complete",
          { id: currentToastId }
        );
        setOptimisticIsCompleted(initialIsCompleted);
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
        setOptimisticIsCompleted(initialIsCompleted);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-background pl-6">
      <VideoPlayer
        thumbnailKey={data.thumbnailKey ?? ""}
        videoKey={data.videoKey ?? ""}
      />
      <div className="flex justify-between items-center border-b py-0">
        {/* <div className="flex gap-x-1 items-center">
          <MotionIcon
            isActive={optimisticIsCompleted}
            onChange={onSubmit}
            disabled={pending}
            icon={CircleCheckBig}
          />
        </div> */}
        <div className="py-4">
          {data.lessonProgress.length > 0 &&
          data.lessonProgress[0].completed ? (
            <Button variant="outline" onClick={onSubmit} disabled={pending}>
              <XCircle className="size-4 text-red-500" />
              Mark as incomplete
            </Button>
          ) : (
            <Button variant="outline" onClick={onSubmit} disabled={pending}>
              <CheckCircle className="size-4 text-primary" />
              Mark as complete
            </Button>
          )}
        </div>
        <HeartButton
          initialCount={0}
          maxClicks={10}
          onChange={(count) => {
            console.log(count);
          }}
        />
      </div>

      {data.walkthroughs && data.walkthroughs.length > 0 && (
        <LessonCodeWalkthrough data={data} />
      )}

      <div className="space-y-3 pt-6">
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

function LessonCodeWalkthrough({ data }: Props) {
  // Transform the lesson walkthroughs into the format expected by the v2 editor
  const walkthroughs =
    data.walkthroughs?.map((lw) => ({
      ...lw.walkthrough,
      // Ensure we have all the required fields
      steps: lw.walkthrough.steps || [],
    })) || [];

  if (walkthroughs.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Interactive Code Walkthroughs
        </h2>
      </div>

      <CodeReviewPlaybackEditorV2
        walkthroughs={walkthroughs}
        defaultLanguage="python"
        defaultCode="# Welcome to the Interactive Code Walkthrough!
# 
# This is an editable code editor where you can:
# 1. Write and edit code freely in edit mode
# 2. Select a walkthrough above to switch to playback mode
# 3. Follow along with audio-synchronized code changes
# 4. Switch back to edit mode anytime to experiment
#
# Try selecting a walkthrough from the collection above to get started!

def example_function():
    print('Hello from the walkthrough!')
    return 'Ready to learn!'

# Your code here...
"
      />

      <div className="border-b pb-4 pt-2" />
    </div>
  );
}
