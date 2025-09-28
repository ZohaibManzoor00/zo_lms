"use client";

import { useState, useRef, useCallback } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mic,
  Pause,
  Play,
  Square,
  Video,
  RotateCcw,
  Save,
  Loader2,
} from "lucide-react";
import {
  useAudioCodeRecorder,
  type AudioCodeSession,
} from "@/hooks/use-audio-code-recorder";
import { useAudioCodePlayback } from "@/hooks/use-audio-code-playback";

interface AudioCodeRecorderProps {
  onSessionComplete?: (session: AudioCodeSession) => void;
  onSessionSaved?: (
    session: AudioCodeSession,
    name: string,
    description?: string
  ) => Promise<string>;
  initialCode?: string;
  showSaveForm?: boolean;
}

export function AudioCodeRecorder({
  onSessionComplete,
  onSessionSaved,
  initialCode = "// Start coding here...\n",
  showSaveForm = true,
}: AudioCodeRecorderProps) {
  const [session, setSession] = useState<AudioCodeSession | null>(null);
  const [showSave, setShowSave] = useState(false);
  const [saveForm, setSaveForm] = useState({
    name: "",
    description: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Memoize the session complete callback to prevent infinite loops
  const handleSessionComplete = useCallback(
    (newSession: AudioCodeSession) => {
      console.log(
        "AudioCodeRecorder: Session completed, setting session state"
      );
      setSession(newSession);
      if (showSaveForm) {
        setShowSave(true);
        setSaveForm((prev) => ({
          ...prev,
          name: `Recording ${new Date().toLocaleString()}`,
        }));
      }
      onSessionComplete?.(newSession);
    },
    [onSessionComplete, showSaveForm]
  );

  const handleSave = useCallback(async () => {
    if (!session || !saveForm.name.trim()) return;

    setIsSaving(true);
    try {
      if (onSessionSaved) {
        await onSessionSaved(
          session,
          saveForm.name.trim(),
          saveForm.description.trim() || undefined
        );
      }
      setShowSave(false);
      setSaveForm({ name: "", description: "" });
    } catch (error) {
      console.error("Error saving recording:", error);
      alert("Failed to save recording. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [session, saveForm, onSessionSaved]);

  const handleCancelSave = useCallback(() => {
    setShowSave(false);
    setSaveForm({ name: "", description: "" });
  }, []);

  const {
    code,
    setCode,
    isRecording,
    isAudioRecording,
    isPaused,
    recordingTime,
    codeEvents,
    startRecording,
    stopRecording,
    pauseResumeRecording,
    handleCodeChange,
    formatTime,
  } = useAudioCodeRecorder({
    onSessionComplete: handleSessionComplete,
    initialCode,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    setCode(value);
    handleCodeChange(value);
  };

  const handleReset = () => {
    setSession(null);
    setCode(initialCode);
  };

  return (
    <div className="space-y-6">
      {/* Recording Interface */}
      <Card className="border shadow-lg bg-card/50 backdrop-blur-sm relative">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {isRecording && (
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              )}
              {session && !isRecording && (
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              )}
              {!isRecording && !session && (
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full" />
              )}
              <CardTitle className="text-lg font-semibold text-foreground">
                {!isRecording && !session && "Audio Code Recorder"}
                {isRecording && "Recording in Progress..."}
                {session && !isRecording && "Recording Complete"}
              </CardTitle>
            </div>
            {isRecording && (
              <div className="flex items-center gap-3 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse"></div>
                <span>{formatTime(recordingTime)}</span>
                {isAudioRecording && (
                  <div className="flex items-center gap-2 border-l border-destructive/30 pl-2">
                    <Mic className="h-4 w-4" />
                    <span>{isPaused ? "Paused" : "Recording"}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96 w-full">
            <Editor
              height="100%"
              defaultLanguage="python"
              value={code}
              onMount={handleEditorDidMount}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                readOnly: false, // Always allow editing during recording
              }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              {!session && (
                <>
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    size="lg"
                    className="min-w-[180px]"
                    variant={isRecording ? "destructive" : "default"}
                  >
                    {isRecording ? (
                      <>
                        <Square className="h-5 w-5" />
                        <span className="ml-2">Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Video className="h-5 w-5" />
                        <span className="ml-2">Start Recording</span>
                      </>
                    )}
                  </Button>
                  {isRecording && (
                    <Button
                      onClick={pauseResumeRecording}
                      variant="outline"
                      size="lg"
                      className="min-w-[160px]"
                    >
                      {isPaused ? (
                        <>
                          <Play className="h-5 w-5" />
                          <span className="ml-2">Resume</span>
                        </>
                      ) : (
                        <>
                          <Pause className="h-5 w-5" />
                          <span className="ml-2">Pause</span>
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
              {session && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  className="min-w-[160px]"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span className="ml-2">New Recording</span>
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-background p-3">
                <div className="text-2xl font-bold">{codeEvents.length}</div>
                <div className="text-xs text-muted-foreground">Code Events</div>
              </div>
              <div className="rounded-lg bg-background p-3">
                <div className="text-2xl font-bold">
                  {session
                    ? formatTime(Math.floor(session.duration / 1000))
                    : formatTime(recordingTime)}
                </div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Save Form Modal */}
        {showSave && session && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Save Recording</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={saveForm.name}
                    onChange={(e) =>
                      setSaveForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter recording name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={saveForm.description}
                    onChange={(e) =>
                      setSaveForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Optional description"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={!saveForm.name.trim() || isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="size-4" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelSave}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Card>

      {/* Playback Interface */}
      {session && <AudioCodePlayback session={session} />}
    </div>
  );
}

// Playback Component
interface AudioCodePlaybackProps {
  session: AudioCodeSession;
}

function AudioCodePlayback({ session }: AudioCodePlaybackProps) {
  const {
    currentCode,
    isPlaying,
    currentTime,
    audioUrl,
    totalDuration,
    audioRef,
    startPlayback,
    pausePlayback,
    stopPlayback,
    seekTo,
    formatTime,
  } = useAudioCodePlayback({ session });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleScrubberInput = (e: React.FormEvent<HTMLInputElement>) => {
    const time = Number((e.target as HTMLInputElement).value);
    seekTo(time);
  };

  return (
    <Card className="border shadow-lg bg-card/50 backdrop-blur-sm gap-0 relative">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10 pb-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <CardTitle className="text-lg font-semibold text-foreground">
            Playback Preview
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Hidden audio element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onError={(e) => console.error("Audio playback error:", e)}
          />
        )}

        {/* Controls */}
        <div className="space-y-4 px-4 sm:px-6 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={isPlaying ? pausePlayback : startPlayback}
              size="lg"
              className="shadow-sm"
            >
              {isPlaying ? (
                <Pause className="size-5" />
              ) : (
                <Play className="size-5" />
              )}
              <span className="font-medium">
                {isPlaying ? "Pause" : "Play"}
              </span>
            </Button>
            <Button
              onClick={stopPlayback}
              variant="outline"
              size="lg"
              className="min-w-[100px] shadow-sm border-border/50 hover:border-border"
            >
              <Square className="size-4" />
              <span className="font-medium">Stop</span>
            </Button>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-muted-foreground w-12 text-center">
              {formatTime(currentTime)}
            </span>
            <div className="relative w-full">
              {/* Background track */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                  />
                </div>
              </div>
              {/* Range input */}
              <input
                type="range"
                min="0"
                max={totalDuration}
                value={currentTime}
                onInput={handleScrubberInput}
                className="relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10
                  [&::-webkit-slider-track]:bg-transparent [&::-webkit-slider-track]:h-2
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background
                  [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:h-2 [&::-moz-range-track]:border-0
                  [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 
                  [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-none
                  focus:outline-none"
              />
            </div>
            <span className="text-sm font-mono text-muted-foreground w-12 text-center">
              {formatTime(totalDuration)}
            </span>
          </div>
        </div>

        {/* Code Editor */}
        <div className="h-96 w-full">
          <Editor
            height="100%"
            defaultLanguage="python"
            value={currentCode}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              readOnly: true, // Always read-only during playback
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
