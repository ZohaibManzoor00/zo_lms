"use client";

import { useState, useRef, useCallback, useEffect } from "react";
// @ts-ignore - react-audio-voice-recorder types issue
import { useAudioRecorder } from "react-audio-voice-recorder";

export interface CodeEvent {
  timestamp: number;
  type: "keypress" | "delete" | "paste";
  data: string;
  position?: number;
}

export interface AudioCodeSession {
  id: string;
  startTime: number;
  endTime: number;
  codeEvents: CodeEvent[];
  initialCode: string;
  finalCode: string;
  audioBlob: Blob;
  duration: number; // in milliseconds
}

interface UseAudioCodeRecorderOptions {
  onSessionComplete?: (session: AudioCodeSession) => void;
  initialCode?: string;
}

export function useAudioCodeRecorder({
  onSessionComplete,
  initialCode = "// Start coding here...\n",
}: UseAudioCodeRecorderOptions = {}) {
  // Audio recorder hook from react-audio-voice-recorder
  const {
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    togglePauseResume,
    recordingBlob,
    isRecording: isAudioRecording,
    isPaused,
    recordingTime,
    mediaRecorder,
  } = useAudioRecorder();

  // State for code recording
  const [code, setCode] = useState(initialCode);
  const [isRecording, setIsRecording] = useState(false);
  const [codeEvents, setCodeEvents] = useState<CodeEvent[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [recordingStartCode, setRecordingStartCode] = useState(initialCode);

  // Refs for tracking
  const lastRecordedCodeRef = useRef<string>("");
  const recordingStartTimeRef = useRef<number>(0);
  const processedBlobRef = useRef<Blob | null>(null);

  // Get high-precision timestamp relative to recording start
  const getRelativeTimestamp = useCallback((): number => {
    return performance.now() - recordingStartTimeRef.current;
  }, []);

  // Handle code changes during recording
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (!value) return;
      setCode(value);

      if (!isRecording) return;
      if (value === recordingStartCode) return;
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
    [isRecording, recordingStartCode, getRelativeTimestamp]
  );

  // Start recording both audio and code
  const startRecording = useCallback(async () => {
    try {
      const startTime = performance.now();
      recordingStartTimeRef.current = startTime;
      setSessionStartTime(startTime);
      setRecordingStartCode(code);
      setIsRecording(true);
      setCodeEvents([]);
      lastRecordedCodeRef.current = code;
      processedBlobRef.current = null; // Reset processed blob ref

      // Record initial code state at timestamp 0
      const initialCodeEvent: CodeEvent = {
        timestamp: 0,
        type: "keypress",
        data: code,
      };
      setCodeEvents([initialCodeEvent]);

      // Start audio recording
      startAudioRecording();
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      throw error;
    }
  }, [code, startAudioRecording]);

  // Stop recording
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    stopAudioRecording();
    lastRecordedCodeRef.current = "";
  }, [stopAudioRecording]);

  // Pause/Resume recording
  const pauseResumeRecording = useCallback(() => {
    togglePauseResume();
  }, [togglePauseResume]);

  // Handle recording completion when audio blob is available
  useEffect(() => {
    if (!recordingBlob || codeEvents.length === 0 || isRecording) return;

    // Prevent processing the same blob multiple times
    if (processedBlobRef.current === recordingBlob) {
      return;
    }

    processedBlobRef.current = recordingBlob;

    // Calculate duration from the last code event timestamp
    const lastEvent = codeEvents[codeEvents.length - 1];
    const duration = lastEvent ? Math.max(lastEvent.timestamp, 1000) : 5000;

    const session: AudioCodeSession = {
      id: `session-${Date.now()}`,
      startTime: 0, // Normalized to 0
      endTime: duration,
      codeEvents,
      initialCode: recordingStartCode,
      finalCode: code,
      audioBlob: recordingBlob,
      duration,
    };

    onSessionComplete?.(session);
  }, [
    recordingBlob,
    codeEvents,
    isRecording,
    sessionStartTime,
    recordingStartCode,
    code,
    onSessionComplete,
  ]);

  // Format time for display
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
    isRecording,
    isAudioRecording,
    isPaused,
    recordingTime,
    codeEvents,

    // Actions
    startRecording,
    stopRecording,
    pauseResumeRecording,
    handleCodeChange,

    // Utilities
    formatTime,

    // Audio recorder reference
    mediaRecorder,
  };
}
