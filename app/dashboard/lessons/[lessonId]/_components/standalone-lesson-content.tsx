"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { tryCatch } from "@/hooks/try-catch";
import { markLessonComplete } from "@/app/dashboard/[slug]/[lessonId]/actions";
import { toast } from "sonner";
import { StandaloneLessonContentType } from "@/app/data/lesson/get-standalone-lesson-content";
import { useOptimistic } from "react";

import { RenderDescription } from "@/components/rich-text-editor/render-description";
import { useConstructUrl } from "@/hooks/use-construct-url";
import {
  BookIcon,
  CheckCircle,
  ChevronDown,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { HeartButton } from "@/components/ui/heart-button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { buildRecordingSession } from "@/lib/build-recording-session";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CodePlayback = dynamic(
  () => import("@/components/code-walkthrough/code-playback"),
  { ssr: false }
);

interface Props {
  data: StandaloneLessonContentType;
}

export function StandaloneLessonContent({ data }: Props) {
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
        markLessonComplete(data.id, data.chapter.course.slug)
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
    <div className="flex flex-col h-full bg-background">
      {/* Back to lessons navigation */}
      <div className="mb-6">
        <Link href="/dashboard/lessons">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Lessons
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <VideoPlayer
          thumbnailKey={data.thumbnailKey ?? ""}
          videoKey={data.videoKey ?? ""}
        />

        <div className="flex justify-between items-center border-b pb-4">
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

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {data.title}
          </h1>
          {data.description && (
            <RenderDescription json={JSON.parse(data.description)} />
          )}
        </div>
      </div>
    </div>
  );
}

function LessonCodeWalkthrough({ data }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const getAudioUrl = useConstructUrl;

  return (
    <>
      {data.walkthroughs && data.walkthroughs.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">
              Interactive Code Walkthroughs
            </h2>
          </div>
          {data.walkthroughs.map((lw, idx) => (
            <Collapsible
              key={lw.id}
              open={openIndex === idx}
              onOpenChange={(open) => setOpenIndex(open ? idx : null)}
              className="dark:bg-accent/40 bg-accent rounded mb-2"
            >
              <CollapsibleTrigger
                className={cn(
                  "w-full flex items-center rounded justify-between px-4 py-2 text-left font-semibold bg-muted hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
                  openIndex === idx &&
                    "bg-primary/10 hover:text-primary hover:bg-primary/20 hover:rounded hover:rounded-b-none rounded dark:bg-accent dark:text-accent-foreground text-primary border-t-accent-foreground rounded-b-none"
                )}
              >
                <span>{lw.walkthrough.name}</span>
                <ChevronDown
                  className={`ml-2 size-5 text-bg-accent-foreground transition-transform duration-200 ${
                    openIndex === idx ? "rotate-180" : "rotate-0"
                  }`}
                  aria-hidden="true"
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="">
                {lw.walkthrough.description && (
                  <>
                    <div className="text-muted-foreground p-4 text-sm">
                      {lw.walkthrough.description}
                    </div>
                  </>
                )}
                <CodePlayback
                  showGuide
                  session={buildRecordingSession(lw.walkthrough, getAudioUrl)}
                />
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      <div className="border-b pb-4 pt-2" />
    </>
  );
}
