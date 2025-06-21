"use client";

import { useState } from "react";
import CodePlayback from "@/app/code-walkthrough/components/CodePlayback";
import { RecordingSession } from "@/app/code-walkthrough/components/CodeRecorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronsUpDown,
  BarChart,
  Clock,
  AudioWaveform,
  Video,
} from "lucide-react";

interface Walkthrough {
  id: string;
  title: string;
  description: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  duration: number;
  startTime: string;
  endTime: string;
  initialCode: string;
  finalCode: string;
  audioFileKey: string | null;
  audioContentType: string | null;
  audioSize: number | null;
  codeEventCount: number;
  audioEventCount: number;
  createdAt: string;
  updatedAt: string;
  codeEvents: any[];
  audioEvents: any[];
}

interface LessonData {
  lesson: {
    id: string;
    title: string;
    description: string | null;
    thumbnailKey: string | null;
    videoKey: string | null;
    position: number;
    chapter: {
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  };
  walkthroughs: Walkthrough[];
  summary: {
    totalWalkthroughs: number;
    totalDuration: number;
    averageDuration: number;
    hasAudio: boolean;
    hasVideo: boolean;
  };
}

export default function TestLessonApiPage() {
  const [courseId, setCourseId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [data, setData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessonData = async () => {
    if (!courseId || !chapterId || !lessonId) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/test-lesson?courseId=${encodeURIComponent(
          courseId
        )}&chapterId=${encodeURIComponent(
          chapterId
        )}&lessonId=${encodeURIComponent(lessonId)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch lesson data");
      }

      const lessonData = await response.json();
      setData(lessonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const convertWalkthroughToSession = (
    walkthrough: Walkthrough
  ): RecordingSession => {
    return {
      id: walkthrough.id,
      startTime: new Date(walkthrough.startTime).getTime(),
      endTime: new Date(walkthrough.endTime).getTime(),
      codeEvents: walkthrough.codeEvents.map((event) => ({
        timestamp: new Date(event.timestamp).getTime(),
        type: event.type,
        data: event.data,
      })),
      audioEvents: walkthrough.audioEvents.map((event) => ({
        timestamp: new Date(event.timestamp).getTime(),
        type: event.type,
      })),
      initialCode: walkthrough.initialCode,
      finalCode: walkthrough.finalCode,
      audioUrl: walkthrough.audioFileKey
        ? `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.fly.storage.tigris.dev/${walkthrough.audioFileKey}`
        : undefined,
    };
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Test Lesson API
            </CardTitle>
            <p className="text-muted-foreground">
              Fetch recordings and walkthroughs for a lesson using its IDs.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="courseId">Course ID</Label>
                <Input
                  id="courseId"
                  type="text"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  placeholder="e.g., bc37c9d7-b365-41bb-93df-c50875ce9d4e"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapterId">Chapter ID</Label>
                <Input
                  id="chapterId"
                  type="text"
                  value={chapterId}
                  onChange={(e) => setChapterId(e.target.value)}
                  placeholder="e.g., 50fe7693-5fb9-4753-9224-b987a3f3ae3e"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessonId">Lesson ID</Label>
                <Input
                  id="lessonId"
                  type="text"
                  value={lessonId}
                  onChange={(e) => setLessonId(e.target.value)}
                  placeholder="e.g., 09024326-3e0e-4c6d-8bff-acf6230addc0"
                />
              </div>
            </div>

            <Button onClick={fetchLessonData} disabled={loading}>
              {loading ? "Loading..." : "Fetch Lesson Data"}
            </Button>

            {error && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive font-medium">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {data && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Information</CardTitle>
                <p className="text-muted-foreground">
                  {data.lesson.chapter.course.title} /{" "}
                  {data.lesson.chapter.title}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-muted-foreground">
                      Lesson
                    </h3>
                    <p className="text-foreground">{data.lesson.title}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">
                      Position
                    </h3>
                    <p className="text-foreground">{data.lesson.position}</p>
                  </div>
                  {data.lesson.description && (
                    <div className="col-span-2">
                      <h3 className="font-medium text-muted-foreground">
                        Description
                      </h3>
                      <p className="text-foreground">
                        {data.lesson.description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <BarChart className="h-6 w-6 mx-auto text-primary mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {data.summary.totalWalkthroughs}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Walkthroughs
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <Clock className="h-6 w-6 mx-auto text-primary mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {formatDuration(data.summary.totalDuration)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Duration
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <AudioWaveform className="h-6 w-6 mx-auto text-primary mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {data.summary.hasAudio ? "Yes" : "No"}
                    </div>
                    <div className="text-sm text-muted-foreground">Audio</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <Video className="h-6 w-6 mx-auto text-primary mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {data.summary.hasVideo ? "Yes" : "No"}
                    </div>
                    <div className="text-sm text-muted-foreground">Video</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Code Walkthroughs ({data.walkthroughs.length})
                </CardTitle>
                <p className="text-muted-foreground">
                  Click on a walkthrough to view the recording.
                </p>
              </CardHeader>
              <CardContent>
                {data.walkthroughs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No walkthroughs found for this lesson.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.walkthroughs.map((walkthrough) => (
                      <Collapsible
                        key={walkthrough.id}
                        className="rounded-lg border"
                      >
                        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50">
                          <div className="text-left">
                            <h3 className="font-semibold text-foreground">
                              {walkthrough.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Instructor: {walkthrough.instructor.name} •
                              Duration: {formatDuration(walkthrough.duration)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {walkthrough.audioFileKey && (
                              <Badge variant="secondary">Has Audio</Badge>
                            )}
                            <ChevronsUpDown className="h-4 w-4" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="border-t bg-muted/20">
                          <div className="p-6">
                            <CodePlayback
                              session={convertWalkthroughToSession(walkthrough)}
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
