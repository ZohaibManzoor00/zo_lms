"use client";

import { StandaloneLessonContentType } from "@/app/data/lesson/get-standalone-lesson-content";

import { RenderDescription } from "@/components/rich-text-editor/render-description";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { BookIcon, Clock, Target, ExternalLink } from "lucide-react";
import { CodeReviewPlaybackEditorV2 } from "@/components/audio-code-walkthrough";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  getDifficultyColor,
  getCategoryColor,
  formatDifficulty,
} from "@/lib/lesson-utils";

interface Props {
  data: StandaloneLessonContentType;
}

export function StandaloneLessonContent({ data }: Props) {
  const VideoPlayer = ({
    thumbnailKey,
    videoKey,
  }: {
    thumbnailKey: string;
    videoKey: string;
  }) => {
    const videoUrl = useConstructUrl(videoKey);
    const thumbnailUrl = useConstructUrl(thumbnailKey);

    if (!videoKey && !thumbnailKey) {
      return (
        <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center">
          <BookIcon className="size-16 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            This lesson does not have a video yet.
          </p>
        </div>
      );
    }

    if (!videoKey) {
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
          <Image
            src={thumbnailUrl}
            alt="Thumbnail"
            fill
            className="object-cover"
          />
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

  return (
    <div className="flex flex-col h-full bg-background px-6">
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {data.title}
          </h1>
          {data.leetCodeSlug && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open(
                  `https://leetcode.com/problems/${data.leetCodeSlug}`,
                  "_blank"
                );
              }}
              className="flex items-center gap-2"
            >
              <ExternalLink className="size-4" />
              LeetCode
            </Button>
          )}
        </div>

        {/* Lesson metadata badges */}
        <div className="flex items-center gap-3 flex-wrap">
          {data.difficulty && (
            <Badge
              variant="outline"
              className={cn("font-medium", getDifficultyColor(data.difficulty))}
            >
              {formatDifficulty(data.difficulty)}
            </Badge>
          )}

          {/* Duration badge - placeholder for now */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Badge
              variant="outline"
              className={
                "font-medium border-primary text-primary bg-transparent hover:bg-primary/20"
              }
            >
              <Clock className="size-4" />
              <span>30 min</span>
            </Badge>
          </div>

          {data.categories && data.categories.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {data.categories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className={cn("font-medium", getCategoryColor(category))}
                >
                  <Target className="size-4" />
                  {category}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

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
    <div className="my-8">
      {/* <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Interactive Code Walkthroughs
        </h2>
        <p className="text-muted-foreground">
          {walkthroughs.length} walkthrough
          {walkthroughs.length > 1 ? "s" : ""} available. Select one to start
          playback or use edit mode to write your own code.
        </p>
      </div> */}

      <CodeReviewPlaybackEditorV2
        walkthroughs={walkthroughs}
        defaultLanguage="python"
        defaultCode="# Welcome to the Interactive Code Walkthrough!"
      />
    </div>
  );
}
