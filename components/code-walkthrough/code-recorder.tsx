"use client";

import { useState, useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Pause, Play, Square, Video } from "lucide-react";

export interface CodeEvent {
  timestamp: number;
  type: "keypress" | "delete" | "paste";
  data?: string;
  position?: number;
  audioUrl?: string;
}

export interface AudioEvent {
  timestamp: number;
  type: "start" | "stop" | "pause" | "resume";
}

export interface RecordingSession {
  id: string;
  startTime: number;
  endTime: number;
  codeEvents: CodeEvent[];
  audioEvents: AudioEvent[];
  initialCode: string;
  finalCode: string;
  audioBlob?: Blob;
  audioUrl?: string;
}

interface CodeRecorderProps {
  onSessionComplete?: (session: RecordingSession) => void;
}

type RecordingState = "idle" | "recording" | "paused";

declare global {
  interface Window {
    createSessionAfterAudio?: () => void;
  }
}

export function CodeRecorder({ onSessionComplete }: CodeRecorderProps) {
  const [code, setCode] = useState("// Add your starter code here...\n");
  const [initialCode, setInitialCode] = useState("");
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [codeEvents, setCodeEvents] = useState<CodeEvent[]>([]);
  const [audioEvents, setAudioEvents] = useState<AudioEvent[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const audioBlobRef = useRef<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<MonacoEditor>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const lastRecordedCodeRef = useRef<string>("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type MonacoEditor = any;

  const handleEditorDidMount = (editor: MonacoEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    setCode(value);
    if (recordingState !== "recording") return;

    if (value === initialCode) return;

    if (value === lastRecordedCodeRef.current) return;

    const newEvent: CodeEvent = {
      timestamp: Date.now(),
      type: "keypress",
      data: value,
    };
    setCodeEvents((prev) => [...prev, newEvent]);
    lastRecordedCodeRef.current = value;
  };

  const startAudioRecording = async () => {
    try {
      setAudioBlob(null);
      audioBlobRef.current = null;
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
      }
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        if (chunksRef.current.length === 0) return;
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        audioBlobRef.current = blob;
        if (window.createSessionAfterAudio) {
          window.createSessionAfterAudio();
        }
      };
      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
      };
      mediaRecorder.start(1000);
      setIsAudioRecording(true);
      const audioStartTime = sessionStartTime || Date.now();
      setAudioEvents((prev) => [
        ...prev,
        { timestamp: audioStartTime, type: "start" },
      ]);
    } catch (error) {
      console.error("Error starting audio recording:", error);
      alert(
        "Failed to start audio recording. Please check microphone permissions."
      );
    }
  };

  const stopAudioRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setAudioEvents((prev) => [
        ...prev,
        { timestamp: Date.now(), type: "stop" },
      ]);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsAudioRecording(false);
  };

  const startRecording = () => {
    const startTime = Date.now();
    setInitialCode(code);
    setRecordingState("recording");
    setSessionStartTime(startTime);
    setCodeEvents([]);
    setAudioEvents([]);
    setAudioBlob(null);
    audioBlobRef.current = null;
    chunksRef.current = [];
    lastRecordedCodeRef.current = code;

    const initialCodeEvent: CodeEvent = {
      timestamp: startTime,
      type: "keypress",
      data: code,
    };
    setCodeEvents([initialCodeEvent]);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    startAudioRecording();
  };

  const pauseRecording = () => {
    if (recordingState !== "recording") return;
    setRecordingState("paused");
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause();
      setAudioEvents((prev) => [
        ...prev,
        { timestamp: Date.now(), type: "pause" },
      ]);
    }
  };

  const resumeRecording = () => {
    if (recordingState !== "paused") return;
    setRecordingState("recording");
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused"
    ) {
      mediaRecorderRef.current.resume();
      setAudioEvents((prev) => [
        ...prev,
        { timestamp: Date.now(), type: "resume" },
      ]);
    }
  };

  const stopRecording = () => {
    setRecordingState("idle");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    if (isAudioRecording) {
      stopAudioRecording();
    }
    lastRecordedCodeRef.current = "";
    const createSession = () => {
      const finalAudioBlob = audioBlobRef.current || audioBlob;
      const session: RecordingSession = {
        id: `session-${Date.now()}`,
        startTime: sessionStartTime,
        endTime: Date.now(),
        codeEvents,
        audioEvents,
        initialCode: initialCode,
        finalCode: code,
        audioBlob: finalAudioBlob || undefined,
        audioUrl: undefined,
      };
      onSessionComplete?.(session);
    };
    window.createSessionAfterAudio = createSession;
    if (audioBlobRef.current || audioBlob) {
      createSession();
    } else {
      setTimeout(() => {
        if (!audioBlobRef.current && !audioBlob) {
          createSession();
        }
      }, 1000);
    }
  };

  const handlePrimaryButtonClick = () => {
    if (recordingState === "idle") {
      startRecording();
    } else if (recordingState === "recording") {
      pauseRecording();
    } else if (recordingState === "paused") {
      resumeRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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
