"use client";

import { useState, useEffect, use } from "react";
import CodePlayback from "../../code-walkthrough/components/CodePlayback";
import { RecordingSession } from "../../code-walkthrough/components/CodeRecorder";
import { SessionMetadata } from "@/app/api/sessions/route";

interface TestLessonPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function TestLessonPage({ params }: TestLessonPageProps) {
  const { sessionId } = use(params);
  const [session, setSession] = useState<RecordingSession | null>(null);
  const [metadata, setMetadata] = useState<SessionMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/sessions/${sessionId}`);

        if (!response.ok) {
          throw new Error("Session not found");
        }

        const data = await response.json();
        setSession(data.session);

        // Get metadata from sessions list
        const sessionsResponse = await fetch("/api/sessions");
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          const sessionMetadata = sessionsData.sessions.find(
            (s: SessionMetadata) => s.id === sessionId
          );
          setMetadata(sessionMetadata);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Lesson Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "The requested lesson could not be loaded."}
          </p>
          <a
            href="/code-walkthrough"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            ← Back to Code Walkthrough
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <a href="/code-walkthrough" className="hover:text-blue-500">
                  Code Walkthrough
                </a>
                <span>→</span>
                <span className="text-gray-700">Lesson</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">
                {metadata?.title || "Interactive Code Walkthrough"}
              </h1>
              {metadata?.description && (
                <p className="text-gray-600 mt-2">{metadata.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Course: {metadata?.courseId}
              </div>
              <div className="text-sm text-gray-500">
                Chapter: {metadata?.chapterId}
              </div>
              <div className="text-sm text-gray-500">
                Lesson: {metadata?.lessonId}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Section (Placeholder) */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-red-500">🎥</span>
            Video Explanation
          </h2>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📹</div>
            <p className="text-gray-600 mb-4">
              This is where the instructor's video explanation would be
              embedded.
            </p>
            <div className="bg-gray-200 rounded-lg p-4 text-sm text-gray-500">
              <strong>Video Placeholder:</strong> In a real implementation, this
              would contain an embedded video player with the instructor's
              explanation of the problem or concept being covered in this
              lesson.
            </div>
          </div>
        </div>

        {/* Interactive Code Walkthrough */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-blue-500">💻</span>
            Interactive Code Walkthrough
          </h2>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-blue-500 text-lg">💡</div>
              <div>
                <h4 className="font-medium text-blue-700 mb-1">
                  How to Use This Walkthrough
                </h4>
                <p className="text-sm text-blue-600">
                  Watch the instructor's code being typed in real-time with
                  synchronized audio narration. You can pause at any time to
                  edit the code and experiment, then resume to see the original
                  solution.
                </p>
              </div>
            </div>
          </div>
          <CodePlayback session={session} />
        </div>

        {/* Lesson Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-purple-500">📊</span>
            Lesson Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 mb-1">Duration</div>
              <div className="font-bold text-purple-700">
                {Math.round((session.endTime - session.startTime) / 1000)}s
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 mb-1">Code Events</div>
              <div className="font-bold text-blue-700">
                {session.codeEvents.length}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 mb-1">Audio Events</div>
              <div className="font-bold text-green-700">
                {session.audioEvents.length}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Instructor</div>
              <div className="font-bold text-gray-700">
                {metadata?.instructorId || "Unknown"}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <a
            href="/code-walkthrough"
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            ← Back to Code Walkthrough
          </a>
          <div className="text-sm text-gray-500">Session ID: {sessionId}</div>
        </div>
      </div>
    </div>
  );
}
