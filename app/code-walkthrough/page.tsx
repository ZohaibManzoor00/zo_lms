"use client";

import { useState } from "react";
import { RecordingSession } from "./components/CodeRecorder";
import CodeRecorder from "./components/CodeRecorder";
import CodePlayback from "./components/CodePlayback";
import SessionUpload from "./components/SessionUpload";
import DemoGuide from "./components/DemoGuide";
import AudioTest from "./components/AudioTest";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ChevronsUpDown,
  Download,
  Trash2,
  ListVideo,
  Video,
  Mic,
  Clapperboard,
  Film,
} from "lucide-react";
import { format } from "date-fns";

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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Interactive Code Walkthrough
          </h1>
          <p className="text-lg text-muted-foreground">
            Record and replay your coding sessions with synchronized audio
            narration
          </p>
        </div>

        <DemoGuide />

        <Collapsible open={showAudioTest} onOpenChange={setShowAudioTest}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audio Setup</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Test your microphone before recording.
                  </p>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle Audio Test</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <AudioTest />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Card>
          <CardHeader>
            <CardTitle>Mode</CardTitle>
            <p className="text-sm text-muted-foreground">
              Switch between recording and playback.
            </p>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => {
                if (value) setViewMode(value as "record" | "playback");
              }}
            >
              <ToggleGroupItem value="record" aria-label="Record mode">
                <Video className="h-4 w-4 mr-2" />
                Record
              </ToggleGroupItem>
              <ToggleGroupItem value="playback" aria-label="Playback mode">
                <Film className="h-4 w-4 mr-2" />
                Playback
              </ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>

        {viewMode === "playback" && sessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recorded Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    className={`p-4 text-left rounded-lg border transition-all duration-200 ${
                      selectedSessionId === session.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:bg-muted/50"
                    }`}
                  >
                    <div className="font-medium text-foreground mb-1">
                      Session recorded at{" "}
                      {format(new Date(session.startTime), "PPpp")}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-4">
                        <span>
                          Duration:{" "}
                          {Math.round(
                            (session.endTime - session.startTime) / 1000
                          )}
                          s
                        </span>
                        <span>Code Events: {session.codeEvents.length}</span>
                        {session.audioBlob && (
                          <span className="flex items-center gap-1">
                            <Mic className="h-4 w-4" /> Audio
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === "record" ? (
          <CodeRecorder onSessionComplete={handleSessionComplete} />
        ) : selectedSession ? (
          <div className="space-y-8">
            <SessionUpload
              session={selectedSession}
              onUploadComplete={handleUploadComplete}
            />
            <Card>
              <CardHeader>
                <CardTitle>Review Your Session</CardTitle>
              </CardHeader>
              <CardContent>
                <CodePlayback session={selectedSession} />
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentSession(null);
                  setSelectedSessionId(null);
                }}
              >
                <ListVideo className="h-4 w-4 mr-2" />
                Back to Session List
              </Button>

              {uploadedSessionId && (
                <Button asChild>
                  <a href={`/test-lesson/${uploadedSessionId}`}>
                    <Clapperboard className="h-4 w-4 mr-2" />
                    View as Student
                  </a>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Card className="text-center p-12">
            <CardContent>
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-medium text-foreground mb-2">
                {sessions.length === 0
                  ? "No recorded sessions yet"
                  : "Select a session to play back"}
              </h3>
              <p className="text-muted-foreground">
                {sessions.length === 0
                  ? "Start by recording your first coding session!"
                  : "Choose a session from the list above to begin playback."}
              </p>
            </CardContent>
          </Card>
        )}

        {sessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3 flex-wrap">
              <Button
                variant="outline"
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
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Sessions
              </Button>
              <Button
                variant="destructive"
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
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Sessions
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
