"use client";

import { useState } from "react";
import { RecordingSession } from "./components/CodeRecorder";
import CodeRecorder from "./components/CodeRecorder";
import CodePlayback from "./components/CodePlayback";
import SessionUpload from "./components/SessionUpload";
import DemoGuide from "./components/DemoGuide";
import AudioTest from "./components/AudioTest";

export default function CodeWalkthroughPage() {
  const [sessions, setSessions] = useState<RecordingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<RecordingSession | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"record" | "playback">("record");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [showAudioTest, setShowAudioTest] = useState(false);
  const [uploadedSessionId, setUploadedSessionId] = useState<string | null>(
    null
  );

  const handleSessionComplete = (session: RecordingSession) => {
    setSessions((prev) => [...prev, session]);
    setCurrentSession(session);
    setViewMode("playback");
    setSelectedSessionId(session.id);
  };

  const handleUploadComplete = (sessionId: string) => {
    setUploadedSessionId(sessionId);
  };

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Interactive Code Walkthrough
          </h1>
          <p className="text-lg text-gray-600">
            Record and replay your coding sessions with synchronized audio
            narration
          </p>
        </div>

        {/* Demo Guide */}
        <DemoGuide />

        {/* Audio Test Toggle */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                Audio Setup
              </h3>
              <p className="text-sm text-gray-600">
                Test your microphone before recording
              </p>
            </div>
            <button
              onClick={() => setShowAudioTest(!showAudioTest)}
              className="px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {showAudioTest ? "🔽 Hide" : "🔼 Show"} Audio Test
            </button>
          </div>
        </div>

        {/* Audio Test */}
        {showAudioTest && (
          <div className="mb-6">
            <AudioTest />
          </div>
        )}

        {/* Mode Toggle */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode("record")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                viewMode === "record"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-lg hover:shadow-xl"
              }`}
            >
              🎬 Record New Session
            </button>
            <button
              onClick={() => setViewMode("playback")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                viewMode === "playback"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-lg hover:shadow-xl"
              }`}
            >
              ▶️ Playback Sessions
            </button>
          </div>
        </div>

        {/* Session List for Playback */}
        {viewMode === "playback" && sessions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
              <span className="text-blue-500">📁</span>
              Recorded Sessions
            </h3>
            <div className="grid gap-3">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`p-4 text-left rounded-lg border transition-all duration-200 ${
                    selectedSessionId === session.id
                      ? "border-blue-500 bg-blue-50 shadow-lg"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div className="font-medium text-gray-900 mb-1">
                    Session {session.id.split("-")[1]}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-4">
                      <span>
                        ⏱️ Duration:{" "}
                        {Math.round(
                          (session.endTime - session.startTime) / 1000
                        )}
                        s
                      </span>
                      <span>⌨️ Code Events: {session.codeEvents.length}</span>
                      <span>🎵 Audio Events: {session.audioEvents.length}</span>
                    </div>
                    {session.audioBlob && (
                      <div className="text-green-600 font-medium">
                        ✅ Audio:{" "}
                        {session.audioBlob.size > 1024
                          ? `${(session.audioBlob.size / 1024).toFixed(1)} KB`
                          : `${session.audioBlob.size} bytes`}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        {viewMode === "record" ? (
          <CodeRecorder onSessionComplete={handleSessionComplete} />
        ) : selectedSession ? (
          <div className="space-y-8">
            {/* Upload Section */}
            <SessionUpload
              session={selectedSession}
              onUploadComplete={handleUploadComplete}
            />

            {/* Playback Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-blue-500">▶️</span>
                Review Your Session
              </h2>
              <CodePlayback session={selectedSession} />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setCurrentSession(null);
                  setSelectedSessionId(null);
                }}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🎬 Record New Session
              </button>

              {uploadedSessionId && (
                <a
                  href={`/test-lesson/${uploadedSessionId}`}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🎓 View as Student
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              {sessions.length === 0
                ? "No recorded sessions yet"
                : "Select a session to play back"}
            </h3>
            <p className="text-gray-600">
              {sessions.length === 0
                ? "Start by recording your first coding session!"
                : "Choose a session from the list above to begin playback."}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        {sessions.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
              <span className="text-orange-500">⚡</span>
              Quick Actions
            </h3>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => {
                  const sessionData = JSON.stringify(sessions, null, 2);
                  const blob = new Blob([sessionData], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "code-walkthrough-sessions.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                📥 Export All Sessions
              </button>
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to clear all sessions? This action cannot be undone."
                    )
                  ) {
                    setSessions([]);
                    setCurrentSession(null);
                    setSelectedSessionId(null);
                  }
                }}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🗑️ Clear All Sessions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
