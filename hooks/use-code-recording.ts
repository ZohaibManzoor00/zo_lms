"use client";

import { useState, useRef, useCallback, useEffect } from "react";

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

type RecordingState = "idle" | "recording" | "paused";

interface UseCodeRecordingOptions {
  onSessionComplete?: (session: RecordingSession) => void;
}

export function useCodeRecording({
  onSessionComplete,
}: UseCodeRecordingOptions = {}) {
  // State
  const [code, setCode] = useState("// Add your starter code here...\n");
  const [initialCode, setInitialCode] = useState("");
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [codeEvents, setCodeEvents] = useState<CodeEvent[]>([]);
  const [audioEvents, setAudioEvents] = useState<AudioEvent[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Refs for precise timing and audio management
  const audioBlobRef = useRef<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const lastRecordedCodeRef = useRef<string>("");

  // High-precision timing refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const audioStartTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const totalPausedDurationRef = useRef<number>(0);

  // Initialize high-precision timing
  useEffect(() => {
    if (typeof window !== "undefined" && window.AudioContext) {
      audioContextRef.current = new AudioContext();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Get high-precision timestamp relative to recording start
  const getRelativeTimestamp = useCallback((): number => {
    if (!audioContextRef.current || recordingStartTimeRef.current === 0) {
      return (
        Date.now() -
        recordingStartTimeRef.current -
        totalPausedDurationRef.current
      );
    }

    // Use AudioContext's currentTime for high precision (microsecond accuracy)
    const audioTime = audioContextRef.current.currentTime;
    const relativeTime = (audioTime - audioStartTimeRef.current) * 1000; // Convert to milliseconds
    return Math.max(0, relativeTime - totalPausedDurationRef.current);
  }, []);

  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (!value) return;
      setCode(value);

      if (recordingState !== "recording") return;
      if (value === initialCode) return;
      if (value === lastRecordedCodeRef.current) return;

      const timestamp = getRelativeTimestamp();

      const newEvent: CodeEvent = {
        timestamp,
        type: "keypress",
        data: value,
      };

      setCodeEvents((prev) => [...prev, newEvent]);
      lastRecordedCodeRef.current = value;
    },
    [recordingState, initialCode, getRelativeTimestamp]
  );

  const startAudioRecording = useCallback(async () => {
    try {
      setAudioBlob(null);
      audioBlobRef.current = null;
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000, // High quality audio
      });

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
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
      };

      // Start recording with high precision timing
      if (audioContextRef.current) {
        audioStartTimeRef.current = audioContextRef.current.currentTime;
      }

      mediaRecorder.start(100); // Collect data every 100ms for better precision
      setIsAudioRecording(true);

      const audioStartEvent: AudioEvent = {
        timestamp: 0, // Audio always starts at 0
        type: "start",
      };

      setAudioEvents((prev) => [...prev, audioStartEvent]);
    } catch (error) {
      console.error("Error starting audio recording:", error);
      throw error;
    }
  }, []);

  const stopAudioRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      const stopTimestamp = getRelativeTimestamp();

      mediaRecorderRef.current.stop();
      setAudioEvents((prev) => [
        ...prev,
        { timestamp: stopTimestamp, type: "stop" },
      ]);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsAudioRecording(false);
  }, [getRelativeTimestamp]);

  const startRecording = useCallback(async () => {
    try {
      const startTime = Date.now();

      // Initialize high-precision timing
      recordingStartTimeRef.current = startTime;
      if (audioContextRef.current) {
        // Resume AudioContext if suspended
        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume();
        }
        audioStartTimeRef.current = audioContextRef.current.currentTime;
      }

      setInitialCode(code);
      setRecordingState("recording");
      setSessionStartTime(startTime);
      setCodeEvents([]);
      setAudioEvents([]);
      setAudioBlob(null);
      audioBlobRef.current = null;
      chunksRef.current = [];
      lastRecordedCodeRef.current = code;

      // Reset pause tracking
      pausedTimeRef.current = 0;
      totalPausedDurationRef.current = 0;

      // Record initial code state at timestamp 0
      const initialCodeEvent: CodeEvent = {
        timestamp: 0,
        type: "keypress",
        data: code,
      };
      setCodeEvents([initialCodeEvent]);

      // Start timer for UI
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Start audio recording
      await startAudioRecording();
    } catch (error) {
      console.error("Error starting recording:", error);
      setRecordingState("idle");
      throw error;
    }
  }, [code, startAudioRecording]);

  const pauseRecording = useCallback(() => {
    if (recordingState !== "recording") return;

    const pauseTimestamp = getRelativeTimestamp();
    pausedTimeRef.current = performance.now(); // Store when we paused
    setRecordingState("paused");

    // Capture the current editor state before pausing
    if (code !== lastRecordedCodeRef.current) {
      const finalPauseEvent: CodeEvent = {
        timestamp: pauseTimestamp,
        type: "keypress",
        data: code,
      };
      setCodeEvents((prev) => [...prev, finalPauseEvent]);
      lastRecordedCodeRef.current = code;
    }

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
        { timestamp: pauseTimestamp, type: "pause" },
      ]);
    }
  }, [recordingState, getRelativeTimestamp, code]);

  const resumeRecording = useCallback(() => {
    if (recordingState !== "paused") return;

    // Calculate how long we were paused and add to total paused duration
    if (pausedTimeRef.current > 0) {
      const pauseDuration = performance.now() - pausedTimeRef.current;
      totalPausedDurationRef.current += pauseDuration;
      pausedTimeRef.current = 0;
    }

    const resumeTimestamp = getRelativeTimestamp();
    setRecordingState("recording");

    // Ensure we continue from the current editor state
    lastRecordedCodeRef.current = code;

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
        { timestamp: resumeTimestamp, type: "resume" },
      ]);
    }
  }, [recordingState, getRelativeTimestamp, code]);

  const stopRecording = useCallback(() => {
    // Calculate the effective recording duration (excluding paused time)
    const effectiveEndTime = getRelativeTimestamp();

    setRecordingState("idle");

    if (timerRef.current) {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }

    if (isAudioRecording) {
      stopAudioRecording();
    }

    lastRecordedCodeRef.current = "";

    // Create session after a short delay to ensure audio blob is ready
    setTimeout(() => {
      const finalAudioBlob = audioBlobRef.current || audioBlob;

      const session: RecordingSession = {
        id: `session-${Date.now()}`,
        startTime: 0, // Always start from 0 for effective time
        endTime: effectiveEndTime, // Use effective recording time
        codeEvents,
        audioEvents,
        initialCode,
        finalCode: code,
        audioBlob: finalAudioBlob || undefined,
        audioUrl: undefined,
      };

      onSessionComplete?.(session);
    }, 500); // Give audio processing time to complete
  }, [
    getRelativeTimestamp,
    isAudioRecording,
    stopAudioRecording,
    audioBlob,
    codeEvents,
    audioEvents,
    initialCode,
    code,
    onSessionComplete,
  ]);

  const handlePrimaryButtonClick = useCallback(() => {
    if (recordingState === "idle") {
      startRecording().catch((error) => {
        console.error("Failed to start recording:", error);
        alert(
          "Failed to start recording. Please check microphone permissions."
        );
      });
    } else if (recordingState === "recording") {
      pauseRecording();
    } else if (recordingState === "paused") {
      resumeRecording();
    }
  }, [recordingState, startRecording, pauseRecording, resumeRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  return {
    // State
    code,
    setCode,
    recordingState,
    isAudioRecording,
    codeEvents,
    audioEvents,
    recordingTime,
    audioBlob,

    // Actions
    handleCodeChange,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    handlePrimaryButtonClick,

    // Utilities
    formatTime,
  };
}
