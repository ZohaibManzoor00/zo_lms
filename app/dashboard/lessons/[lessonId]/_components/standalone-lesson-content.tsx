"use client";

import { useState } from "react";
import { StandaloneLessonContentType } from "@/app/data/lesson/get-standalone-lesson-content";
// import { useOptimistic } from "react";

import { RenderDescription } from "@/components/rich-text-editor/render-description";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { BookIcon, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { convertWalkthroughToAudioRecording } from "@/lib/convert-walkthrough-to-audio-recording";
import { AudioPlayback } from "@/components/audio-code-walkthrough";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// const getLanguageColor = (language: string) => {
//   return (
//     languageColors[language.toLowerCase()] ||
//     "bg-gray-500/10 text-gray-700 border-gray-500/20"
//   );
// };

const formatDurationInMinutes = (seconds: number) => {
  if (seconds < 60) {
    const roundedSeconds = Math.round(seconds);
    return `${roundedSeconds} second${roundedSeconds !== 1 ? "s" : ""}`;
  }
  const minutes = Math.round(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const calculateWalkthroughDuration = (walkthrough: any) => {
  if (!walkthrough.steps || walkthrough.steps.length === 0) return 5; // Default 5 seconds
  const lastStep = walkthrough.steps[walkthrough.steps.length - 1];
  return Math.max(lastStep.timestamp, 1); // At least 1 second
};

interface Props {
  data: StandaloneLessonContentType;
}

export function StandaloneLessonContent({ data }: Props) {
  // const [, startTransition] = useTransition();
  // const initialIsCompleted =
  //   data.lessonProgress.length > 0 && data.lessonProgress[0].completed;

  // const [optimisticIsCompleted, setOptimisticIsCompleted] =
  //   useOptimistic(initialIsCompleted);

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

  // const onSubmit = () => {
  //   startTransition(async () => {
  //     setOptimisticIsCompleted(!optimisticIsCompleted);
  //     const currentToastId = toast.loading(
  //       `Marking lesson as ${
  //         optimisticIsCompleted ? "incomplete" : "complete"
  //       }...`
  //     );

  //     const { data: result, error } = await tryCatch(
  //       markLessonComplete(data.id, data.chapter?.course.slug ?? "")
  //     );

  //     if (error) {
  //       toast.error(
  //         "An unexpected error occurred while marking the lesson as complete",
  //         { id: currentToastId }
  //       );
  //       setOptimisticIsCompleted(initialIsCompleted);
  //       return;
  //     }

  //     if (result?.status === "success") {
  //       toast.success(
  //         `Lesson marked as ${
  //           optimisticIsCompleted ? "incomplete" : "complete"
  //         }`,
  //         { id: currentToastId }
  //       );
  //     } else if (result?.status === "error") {
  //       toast.error(result.message, { id: currentToastId });
  //       setOptimisticIsCompleted(initialIsCompleted);
  //     }
  //   });
  // };

  return (
    <div className="flex flex-col h-full bg-background px-6">
      {/* Back to lessons navigation */}
      {/* <div className="mb-6">
        <Link href="/dashboard/lessons">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Lessons
          </Button>
        </Link>
      </div> */}

      <div className="space-y-6">
        <VideoPlayer
          thumbnailKey={data.thumbnailKey ?? ""}
          videoKey={data.videoKey ?? ""}
        />

        {/* <div className="flex justify-between items-center border-b pb-4">
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
        </div> */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {data.title}
          </h1>

          {data.description && (
            <RenderDescription json={JSON.parse(data.description)} />
          )}
        </div>

        <div className="border-b" />

        {data.walkthroughs && data.walkthroughs.length > 0 && (
          <LessonCodeWalkthrough data={data} />
        )}
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
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              Interactive Code Walkthroughs
            </h2>
            <p className="text-muted-foreground">
              {data.walkthroughs.length} walkthrough
              {data.walkthroughs.length > 1 ? "s" : ""} available
            </p>
          </div>

          <div className="space-y-4">
            {data.walkthroughs.map((lw, idx) => (
              <div
                key={lw.id}
                className="group border border-border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Collapsible
                  open={openIndex === idx}
                  onOpenChange={(open) => setOpenIndex(open ? idx : null)}
                >
                  <CollapsibleTrigger
                    className={cn(
                      "w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors duration-200",
                      openIndex === idx && "bg-muted/30 border-b border-border"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {lw.position || idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                            {lw.walkthrough.name}
                          </h3>
                          {/* <Badge
                            variant="secondary"
                            className={`text-xs ${getLanguageColor(
                              lw.walkthrough?.language || "python"
                            )}`}
                          >
                            {capitalizeFirstLetterInWord(
                              lw.walkthrough.language || "python"
                            )}
                          </Badge> */}
                        </div>
                        {lw.walkthrough.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {lw.walkthrough.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Duration:{" "}
                        {formatDurationInMinutes(
                          calculateWalkthroughDuration(lw.walkthrough)
                        )}
                      </Badge>
                      <ChevronDown
                        className={cn(
                          "size-5 text-muted-foreground transition-transform duration-200",
                          openIndex === idx && "rotate-180"
                        )}
                      />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <>
                      <div className="border border-border rounded-none overflow-hidden bg-background">
                        <AudioPlayback
                          recording={convertWalkthroughToAudioRecording(
                            lw.walkthrough,
                            getAudioUrl(lw.walkthrough.audioKey)
                          )}
                        />
                      </div>
                    </>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="pt-3" />
    </>
  );
}
