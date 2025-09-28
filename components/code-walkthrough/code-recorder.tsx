"use client";

import { useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Pause, Play, Square, Video } from "lucide-react";
import { useCodeRecording } from "@/hooks/use-code-recording";
import type { RecordingSession } from "@/hooks/use-code-recording";

// Re-export types for backward compatibility
export type {
  CodeEvent,
  AudioEvent,
  RecordingSession,
} from "@/hooks/use-code-recording";

interface CodeRecorderProps {
  onSessionComplete?: (session: RecordingSession) => void;
}

export function CodeRecorder({ onSessionComplete }: CodeRecorderProps) {
  const {
    code,
    setCode,
    recordingState,
    isAudioRecording,
    codeEvents,
    audioEvents,
    recordingTime,
    handleCodeChange,
    handlePrimaryButtonClick,
    stopRecording,
    formatTime,
  } = useCodeRecording({ onSessionComplete });

  const editorRef = useRef<MonacoEditor>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type MonacoEditor = any;

  const handleEditorDidMount = (editor: MonacoEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    setCode(value);
    handleCodeChange(value);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">
            {recordingState === "idle" && "Prepare Your Walkthrough"}
            {recordingState === "recording" && "Recording Walkthrough..."}
            {recordingState === "paused" && "Recording Paused"}
          </CardTitle>
          {recordingState !== "idle" && (
            <div className="flex items-center gap-3 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive">
              <div className="h-2 w-2 rounded-full bg-destructive animate-pulse"></div>
              <span>{formatTime(recordingTime)}</span>
              {isAudioRecording && (
                <div className="flex items-center gap-2 border-l border-destructive/30 pl-2">
                  <Mic className="h-4 w-4" />
                  <span>Audio Active</span>
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
            }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrimaryButtonClick}
              size="lg"
              className="min-w-[180px]"
            >
              {recordingState === "idle" && (
                <>
                  <Video className="h-5 w-5" />
                  <span className="ml-2">Start Recording</span>
                </>
              )}
              {recordingState === "recording" && (
                <>
                  <Pause className="h-5 w-5" />
                  <span className="ml-2">Pause Recording</span>
                </>
              )}
              {recordingState === "paused" && (
                <>
                  <Play className="h-5 w-5" />
                  <span className="ml-2">Resume Recording</span>
                </>
              )}
            </Button>
            {recordingState !== "idle" && (
              <Button
                onClick={stopRecording}
                variant="destructive"
                size="lg"
                className="min-w-[180px]"
              >
                <Square className="h-5 w-5" />
                <span className="ml-2">Stop Recording</span>
              </Button>
            )}
            <Button
              onClick={() => {}}
              variant="outline"
              size="lg"
              disabled
              className="min-w-[160px]"
            >
              <Mic className="h-5 w-5" />
              <span className="ml-2">Audio Always On</span>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-background p-3">
              <div className="text-2xl font-bold">{codeEvents.length}</div>
              <div className="text-xs text-muted-foreground">Code Events</div>
            </div>
            <div className="rounded-lg bg-background p-3">
              <div className="text-2xl font-bold">{audioEvents.length}</div>
              <div className="text-xs text-muted-foreground">Audio Events</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
