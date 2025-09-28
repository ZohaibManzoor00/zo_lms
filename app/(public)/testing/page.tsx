"use client";

import { useState } from "react";
import { AudioCodeRecorder } from "@/components/audio-code-recorder/audio-code-recorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AudioCodeSession } from "@/hooks/use-audio-code-recorder";

export default function TestingPage() {
  const [sessions, setSessions] = useState<AudioCodeSession[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<AudioCodeSession | null>(null);

  const handleSessionComplete = (session: AudioCodeSession) => {
    console.log("Session completed:", session);
    setSessions((prev) => [...prev, session]);
  };

  const handleLoadSession = (session: AudioCodeSession) => {
    setSelectedSession(session);
  };

  const handleClearSessions = () => {
    setSessions([]);
    setSelectedSession(null);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Audio Code Recorder Testing
          </h1>
          <p className="text-muted-foreground mt-2">
            Test the new audio recording functionality with Monaco editor
            synchronization.
          </p>
        </div>

        {/* Session Management */}
        {sessions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recorded Sessions ({sessions.length})</CardTitle>
                <Button
                  onClick={handleClearSessions}
                  variant="outline"
                  size="sm"
                >
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        )}

        {/* Main Recording Interface */}
        <AudioCodeRecorder
          onSessionComplete={handleSessionComplete}
          showSaveForm={false}
          initialCode={`# Welcome to the Audio Code Recorder Test!
# Start typing code and click "Start Recording" to begin.

def fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test the function
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
`}
        />

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Recording:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>
                    Click "Start Recording" to begin recording both audio and
                    code changes
                  </li>
                  <li>
                    Start typing in the Monaco editor - each change will be
                    tracked
                  </li>
                  <li>
                    Speak while coding to record synchronized audio narration
                  </li>
                  <li>Use "Pause/Resume" to control the recording</li>
                  <li>Click "Stop Recording" when finished</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Playback:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>
                    After recording, the playback interface will appear
                    automatically
                  </li>
                  <li>
                    Click "Play" to watch your code changes synchronized with
                    audio
                  </li>
                  <li>
                    Use the timeline slider to scrub through the recording
                  </li>
                  <li>
                    The editor will show code changes in real-time as the audio
                    plays
                  </li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                    High-precision timing synchronization between audio and code
                  </li>
                  <li>Real-time code event tracking during recording</li>
                  <li>Smooth playback with requestAnimationFrame updates</li>
                  <li>Session management for multiple recordings</li>
                  <li>Audio blob storage with efficient playback</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div>Total Sessions: {sessions.length}</div>
              <div>Selected Session: {selectedSession?.id || "None"}</div>
              <div>
                Latest Session:{" "}
                {sessions.length > 0
                  ? `${
                      sessions[sessions.length - 1].codeEvents.length
                    } events, ${Math.floor(
                      sessions[sessions.length - 1].duration / 1000
                    )}s`
                  : "None"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
