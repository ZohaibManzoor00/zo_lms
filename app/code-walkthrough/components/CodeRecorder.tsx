"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Pause, Play, Square, Video } from "lucide-react";

// Extend Window interface for our callback
declare global {
  interface Window {
    createSessionAfterAudio?: () => void;
  }
}

export interface CodeEvent {
  timestamp: number;
  type: "keypress" | "delete" | "paste";
  data?: string;
  position?: number;
  audioUrl?: string; // URL to audio file in Tigris
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
  audioUrl?: string; // URL to audio file in Tigris
}

interface CodeRecorderProps {
  onSessionComplete?: (session: RecordingSession) => void;
}

type RecordingState = "idle" | "recording" | "paused";

export default function CodeRecorder({ onSessionComplete }: CodeRecorderProps) {
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
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Capture cursor position changes with throttling
  const handleCursorPositionChanged = useCallback(() => {
    // Disabled cursor tracking to reduce events
    // Only track essential code changes, not cursor movements
    return;
  }, []);

  // Capture selection changes with throttling
  const handleSelectionChanged = useCallback(() => {
    // Disabled selection tracking to reduce events
    // Only track essential code changes, not selections
    return;
  }, []);

  // Handle code changes with more granular tracking
  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    setCode(value);

    // Only record events if we are actively recording
    if (recordingState !== "recording") return;

    const newEvent: CodeEvent = {
      timestamp: Date.now(),
      type: "keypress",
      data: value,
    };

    setCodeEvents((prev) => [...prev, newEvent]);
  };

  // Start audio recording
  const startAudioRecording = async () => {
    try {
      setAudioBlob(null);
      audioBlobRef.current = null;
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Check available MIME types
      const mimeTypes = MediaRecorder.isTypeSupported;

      // Choose the best available MIME type
      let mimeType = "audio/webm;codecs=opus";
      if (!mimeTypes("audio/webm;codecs=opus")) {
        if (mimeTypes("audio/webm")) {
          mimeType = "audio/webm";
        } else if (mimeTypes("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (mimeTypes("audio/ogg;codecs=opus")) {
          mimeType = "audio/ogg;codecs=opus";
        } else {
          mimeType = ""; // Let MediaRecorder choose
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length === 0) {
          return;
        }

        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        setAudioBlob(blob);
        audioBlobRef.current = blob;

        // Trigger session creation after blob is ready
        if (window.createSessionAfterAudio) {
          window.createSessionAfterAudio();
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
      };

      // Start recording with 1-second timeslice to get data more frequently
      mediaRecorder.start(1000);
      setIsAudioRecording(true);

      // Use the session start time as reference for audio events
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

  // Stop audio recording
  const stopAudioRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop(); // This will trigger the 'ondataavailable' and 'onstop' events
      setAudioEvents((prev) => [
        ...prev,
        { timestamp: Date.now(), type: "stop" },
      ]);
    }
    // Stop tracks and release microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsAudioRecording(false);
  };

  // Start/stop code recording
  const startRecording = () => {
    // Start recording
    const startTime = Date.now();
    setInitialCode(code); // Capture the current code as the initial code
    setRecordingState("recording");
    setSessionStartTime(startTime);
    setCodeEvents([]);
    setAudioEvents([]);
    setAudioBlob(null);
    audioBlobRef.current = null;
    chunksRef.current = [];

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    // Start audio recording immediately to ensure perfect synchronization
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

    // Stop audio recording if it's still running
    if (isAudioRecording) {
      stopAudioRecording();
    }

    // Wait for audio blob to be created, then create session
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
        audioUrl: undefined, // Assuming no URL for now
      };

      onSessionComplete?.(session);
    };

    // Set up callback for when audio blob is ready
    window.createSessionAfterAudio = createSession;

    // If we already have an audio blob, create session immediately
    if (audioBlobRef.current || audioBlob) {
      createSession();
    } else {
      // Wait for audio blob to be created (increased timeout)
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

  // Start/stop audio recording
  const toggleAudioRecording = () => {
    if (isAudioRecording) {
      stopAudioRecording();
    } else {
      startAudioRecording();
    }
  };

  // Set up editor event listeners
  useEffect(() => {
    // Removed cursor and selection event listeners to reduce events
    // Only tracking essential code changes now
    return () => {
      // No cleanup needed since we removed the listeners
    };
  }, []);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b bg-muted/30">
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
            defaultLanguage="javascript"
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
              onClick={toggleAudioRecording}
              variant="outline"
              size="lg"
              disabled={recordingState === "paused"}
              className="min-w-[160px]"
            >
              {isAudioRecording ? (
                <>
                  <MicOff className="h-5 w-5" />
                  <span className="ml-2">Stop Audio</span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  <span className="ml-2">Start Audio</span>
                </>
              )}
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
