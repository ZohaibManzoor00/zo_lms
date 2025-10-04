"use client";

import { useState, useRef, useCallback } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Square, Pause, Play, Video } from "lucide-react";

interface CodeEvent {
  timestamp: number;
  type: "keypress" | "delete" | "paste";
  data: string;
  position?: number;
}

interface AudioRecorderProps {
  onRecordingComplete: (
    audioBlob: Blob,
    duration: number,
    codeEvents: CodeEvent[],
    initialCode: string,
    finalCode: string
  ) => void;
}

type RecordingState = "idle" | "recording" | "paused" | "stopped";

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [, setIsPaused] = useState(false);
  const [code, setCode] = useState("// Start coding here...\n");

  // Refs for MediaRecorder and timing
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const totalPausedDurationRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);

  // Code recording refs
  const codeEventsRef = useRef<CodeEvent[]>([]);
  const initialCodeRef = useRef<string>("");
  const lastRecordedCodeRef = useRef<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Get relative timestamp for events
  const getRelativeTimestamp = useCallback((): number => {
    const currentTime = Date.now();
    const elapsedTime = currentTime - recordingStartTimeRef.current;
    const activeRecordingTime = elapsedTime - totalPausedDurationRef.current;
    return Math.max(0, activeRecordingTime);
  }, []);

  // Handle code changes during recording
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (!value) return;
      setCode(value);

      if (recordingState !== "recording") return;
      if (value === lastRecordedCodeRef.current) return;

      const timestamp = getRelativeTimestamp();
      const newEvent: CodeEvent = {
        timestamp,
        type: "keypress",
        data: value,
      };

      codeEventsRef.current.push(newEvent);
      lastRecordedCodeRef.current = value;

      console.log("Code event recorded:", {
        timestamp,
        codeLength: value.length,
        totalEvents: codeEventsRef.current.length,
      });
    },
    [recordingState, getRelativeTimestamp]
  );

  // Handle editor mount
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = useCallback((editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      console.log("Starting recording...");

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Create MediaRecorder
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/mp4";
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        console.log("Data available:", event.data.size);
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        console.log("Recording stopped, chunks:", chunksRef.current.length);

        if (chunksRef.current.length === 0) {
          console.warn("No audio data recorded");
          return;
        }

        const audioBlob = new Blob(chunksRef.current, { type: mimeType });

        // Calculate actual recording duration (excluding paused time)
        const totalElapsedTime = Date.now() - recordingStartTimeRef.current;
        const actualRecordingDuration =
          totalElapsedTime - totalPausedDurationRef.current;

        console.log("Recording complete:", {
          size: audioBlob.size,
          totalElapsed: totalElapsedTime,
          pausedDuration: totalPausedDurationRef.current,
          actualDuration: actualRecordingDuration,
          type: audioBlob.type,
          codeEvents: codeEventsRef.current.length,
          initialCode: initialCodeRef.current.length,
          finalCode: code.length,
        });

        onRecordingComplete(
          audioBlob,
          actualRecordingDuration,
          codeEventsRef.current,
          initialCodeRef.current,
          code
        );

        // Reset state
        setRecordingTime(0);
        totalPausedDurationRef.current = 0;
        pauseStartTimeRef.current = 0;
        recordingStartTimeRef.current = 0;
        codeEventsRef.current = [];
        initialCodeRef.current = "";
        lastRecordedCodeRef.current = "";
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
      };

      // Start recording
      recordingStartTimeRef.current = Date.now();
      totalPausedDurationRef.current = 0;
      pauseStartTimeRef.current = 0;

      // Initialize code recording
      initialCodeRef.current = code;
      lastRecordedCodeRef.current = code;
      codeEventsRef.current = [];

      // Record initial code state
      const initialCodeEvent: CodeEvent = {
        timestamp: 0,
        type: "keypress",
        data: code,
      };
      codeEventsRef.current.push(initialCodeEvent);

      mediaRecorder.start(100); // Collect data every 100ms
      setRecordingState("recording");
      setIsPaused(false);

      // Start timer - only count active recording time
      timerRef.current = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - recordingStartTimeRef.current;
        const activeRecordingTime =
          elapsedTime - totalPausedDurationRef.current;
        setRecordingTime(Math.floor(activeRecordingTime / 1000));
      }, 1000);

      console.log("Recording started successfully");
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Failed to start recording. Please check microphone permissions.");
    }
  }, [onRecordingComplete, code]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      console.log("Pausing recording...");

      // Capture current code state before pausing
      if (code !== lastRecordedCodeRef.current) {
        const pauseTimestamp = getRelativeTimestamp();
        const finalPauseEvent: CodeEvent = {
          timestamp: pauseTimestamp,
          type: "keypress",
          data: code,
        };
        codeEventsRef.current.push(finalPauseEvent);
        lastRecordedCodeRef.current = code;
      }

      mediaRecorderRef.current.pause();
      pauseStartTimeRef.current = Date.now();
      setRecordingState("paused");
      setIsPaused(true);

      // Stop timer during pause
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [recordingState, code, getRelativeTimestamp]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === "paused") {
      console.log("Resuming recording...");

      mediaRecorderRef.current.resume();

      // Add paused duration to total
      if (pauseStartTimeRef.current > 0) {
        const pauseDuration = Date.now() - pauseStartTimeRef.current;
        totalPausedDurationRef.current += pauseDuration;
        console.log(
          "Added pause duration:",
          pauseDuration,
          "Total paused:",
          totalPausedDurationRef.current
        );
        pauseStartTimeRef.current = 0;
      }

      // Capture current editor state immediately on resume
      // This ensures any changes made during pause are recorded
      if (code !== lastRecordedCodeRef.current) {
        const resumeTimestamp = getRelativeTimestamp();
        const resumeEvent: CodeEvent = {
          timestamp: resumeTimestamp,
          type: "keypress",
          data: code,
        };
        codeEventsRef.current.push(resumeEvent);
        console.log("Resume code event recorded:", {
          timestamp: resumeTimestamp,
          codeLength: code.length,
          totalEvents: codeEventsRef.current.length,
        });
      }

      // Update the last recorded code reference
      lastRecordedCodeRef.current = code;

      setRecordingState("recording");
      setIsPaused(false);

      // Restart timer - continue counting active recording time
      timerRef.current = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - recordingStartTimeRef.current;
        const activeRecordingTime =
          elapsedTime - totalPausedDurationRef.current;
        setRecordingTime(Math.floor(activeRecordingTime / 1000));
      }, 1000);
    }
  }, [recordingState, code, getRelativeTimestamp]);

  // Stop recording
  const stopRecording = useCallback(() => {
    console.log("Stopping recording...");

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setRecordingState("stopped");
  }, []);

  // Handle primary button click
  const handlePrimaryButtonClick = useCallback(() => {
    if (recordingState === "idle") {
      startRecording();
    } else if (recordingState === "recording") {
      pauseRecording();
    } else if (recordingState === "paused") {
      resumeRecording();
    }
  }, [recordingState, startRecording, pauseRecording, resumeRecording]);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">
            {recordingState === "idle" && "Code Walkthrough Recorder"}
            {recordingState === "recording" && "Recording Walkthrough..."}
            {recordingState === "paused" && "Recording Paused"}
          </CardTitle>
          {recordingState !== "idle" && (
            <div className="flex items-center gap-3 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive">
              <div className="h-2 w-2 rounded-full bg-destructive animate-pulse"></div>
              <span>{formatTime(recordingTime)}</span>
              <div className="flex items-center gap-2 border-l border-destructive/30 pl-2">
                <Mic className="h-4 w-4" />
                <span>Audio Active</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Code Editor */}
        <div className="h-96 w-full">
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={handleCodeChange}
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
            }}
          />
        </div>

        {/* Controls */}
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
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-background p-3">
              <div className="text-2xl font-bold">
                {codeEventsRef.current.length}
              </div>
              <div className="text-xs text-muted-foreground">Code Events</div>
            </div>
            <div className="rounded-lg bg-background p-3">
              <div className="text-2xl font-bold">
                {chunksRef.current.length}
              </div>
              <div className="text-xs text-muted-foreground">Audio Chunks</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type { CodeEvent };
