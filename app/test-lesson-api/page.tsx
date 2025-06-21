"use client";

import { useState } from "react";
import CodePlayback from "@/app/code-walkthrough/components/CodePlayback";
import { RecordingSession } from "@/app/code-walkthrough/components/CodeRecorder";

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
  const [expandedWalkthroughs, setExpandedWalkthroughs] = useState<Set<string>>(
    new Set()
  );

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

  const toggleWalkthroughExpansion = (walkthroughId: string) => {
    const newExpanded = new Set(expandedWalkthroughs);
    if (newExpanded.has(walkthroughId)) {
      newExpanded.delete(walkthroughId);
    } else {
      newExpanded.add(walkthroughId);
    }
    setExpandedWalkthroughs(newExpanded);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Test Lesson API
          </h1>
          <p className="text-gray-600 mb-6">
            Test the lesson API endpoint to fetch recordings and walkthroughs
            for a specific course, chapter, and lesson.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course ID
              </label>
              <input
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., bc37c9d7-b365-41bb-93df-c50875ce9d4e"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter ID
              </label>
              <input
                type="text"
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 50fe7693-5fb9-4753-9224-b987a3f3ae3e"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson ID
              </label>
              <input
                type="text"
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 09024326-3e0e-4c6d-8bff-acf6230addc0"
              />
            </div>
          </div>

          <button
            onClick={fetchLessonData}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? "Loading..." : "Fetch Lesson Data"}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {data && (
          <div className="space-y-6">
            {/* Lesson Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Lesson Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700">Course</h3>
                  <p className="text-gray-900">
                    {data.lesson.chapter.course.title}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Chapter</h3>
                  <p className="text-gray-900">{data.lesson.chapter.title}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Lesson</h3>
                  <p className="text-gray-900">{data.lesson.title}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Position</h3>
                  <p className="text-gray-900">{data.lesson.position}</p>
                </div>
                {data.lesson.description && (
                  <div className="col-span-2">
                    <h3 className="font-medium text-gray-700">Description</h3>
                    <p className="text-gray-900">{data.lesson.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {data.summary.totalWalkthroughs}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Walkthroughs
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatDuration(data.summary.totalDuration)}
                  </div>
                  <div className="text-sm text-gray-600">Total Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatDuration(data.summary.averageDuration)}
                  </div>
                  <div className="text-sm text-gray-600">Average Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {data.summary.hasAudio ? "✅" : "❌"}
                  </div>
                  <div className="text-sm text-gray-600">Has Audio</div>
                </div>
              </div>
            </div>

            {/* Walkthroughs */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Code Walkthroughs ({data.walkthroughs.length})
              </h2>
              {data.walkthroughs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No walkthroughs found for this lesson.
                </p>
              ) : (
                <div className="space-y-4">
                  {data.walkthroughs.map((walkthrough) => (
                    <div
                      key={walkthrough.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="flex items-start justify-between p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {walkthrough.title}
                          </h3>
                          {walkthrough.description && (
                            <p className="text-gray-600 text-sm mb-2">
                              {walkthrough.description}
                            </p>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">
                                Instructor:
                              </span>
                              <br />
                              <span className="text-gray-900">
                                {walkthrough.instructor.name}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Duration:
                              </span>
                              <br />
                              <span className="text-gray-900">
                                {formatDuration(walkthrough.duration)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Code Events:
                              </span>
                              <br />
                              <span className="text-gray-900">
                                {walkthrough.codeEventCount}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Audio Events:
                              </span>
                              <br />
                              <span className="text-gray-900">
                                {walkthrough.audioEventCount}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <button
                            onClick={() =>
                              toggleWalkthroughExpansion(walkthrough.id)
                            }
                            className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          >
                            {expandedWalkthroughs.has(walkthrough.id)
                              ? "Hide Walkthrough"
                              : "Watch Walkthrough"}
                          </button>
                          <a
                            href={`/test-lesson/${walkthrough.id}`}
                            className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                          >
                            View Full Page
                          </a>
                          {walkthrough.audioFileKey && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              Has Audio
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Collapsible Walkthrough Player */}
                      {expandedWalkthroughs.has(walkthrough.id) && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          <div className="p-6">
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className="text-blue-500 text-lg">💡</div>
                                <div>
                                  <h4 className="font-medium text-blue-700 mb-1">
                                    Interactive Code Walkthrough
                                  </h4>
                                  <p className="text-sm text-blue-600">
                                    Watch the instructor's code being typed in
                                    real-time with synchronized audio narration.
                                    You can pause at any time to edit the code
                                    and experiment, then resume to see the
                                    original solution.
                                  </p>
                                </div>
                              </div>
                            </div>
                            <CodePlayback
                              session={convertWalkthroughToSession(walkthrough)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
