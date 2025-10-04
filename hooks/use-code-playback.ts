"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type {
  RecordingSession,
  CodeEvent,
  AudioEvent,
} from "./use-code-recording";

interface AudioBlobData {
  data: number[];
  type: string;
}

interface UseCodePlaybackOptions {
  session: RecordingSession;
}

export function useCodePlayback({ session }: UseCodePlaybackOptions) {
  const [currentCode, setCurrentCode] = useState(session.initialCode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [userEditedCode, setUserEditedCode] = useState(session.finalCode);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Refs for precise playback control
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentEventIndexRef = useRef(0);
  const playbackStartTimeRef = useRef<number>(0);
  const pausedAtTimeRef = useRef<number>(0);

  // Calculate total duration in milliseconds - use effective recording time
  let totalDuration = session.endTime - session.startTime;

  // For sessions with audio events (pause/resume), the duration should already be effective
  // For legacy sessions without audio events, calculate from last event
  if (totalDuration <= 0 && session.codeEvents.length > 0) {
    const lastEvent = session.codeEvents[session.codeEvents.length - 1];
    totalDuration = Math.max(lastEvent.timestamp, 5000); // Minimum 5 seconds
  }

  totalDuration = Math.max(totalDuration, 1000); // Minimum 1 second

  console.log("Session debug:", {
    startTime: session.startTime,
    endTime: session.endTime,
    calculatedDuration: totalDuration,
    codeEventsLength: session.codeEvents.length,
    audioEventsLength: session.audioEvents.length,
    hasAudio: !!session.audioUrl || !!session.audioBlob,
    firstEvent: session.codeEvents[0],
    lastEvent: session.codeEvents[session.codeEvents.length - 1],
  });

  // Memoize sorted code events to avoid recomputing on every render
  const sortedCodeEvents = useRef<CodeEvent[]>([]);
  const sortedAudioEvents = useRef<AudioEvent[]>([]);

  useEffect(() => {
    sortedCodeEvents.current = [...session.codeEvents].sort(
      (a, b) => a.timestamp - b.timestamp
    );
    sortedAudioEvents.current = [...session.audioEvents].sort(
      (a, b) => a.timestamp - b.timestamp
    );
  }, [session.codeEvents, session.audioEvents]);

  useEffect(() => {
    if (session.audioUrl) {
      setAudioUrl(session.audioUrl);
    } else if (session.audioBlob) {
      let blob: Blob;
      if (session.audioBlob instanceof Blob) {
        blob = session.audioBlob;
      } else if (
        session.audioBlob &&
        typeof session.audioBlob === "object" &&
        "data" in session.audioBlob
      ) {
        const { data, type } = session.audioBlob as AudioBlobData;
        if (!data || !Array.isArray(data)) {
          console.error("Invalid blob data format");
          return;
        }
        const uint8Array = new Uint8Array(data);
        blob = new Blob([uint8Array], { type: type || "audio/webm" });
      } else {
        console.warn("Invalid audioBlob format:", session.audioBlob);
        return;
      }
      try {
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error("Error creating audio URL:", error);
      }
    } else {
      setAudioUrl(null);
    }
  }, [session.audioBlob, session.audioUrl]);

  // Create a mapping function to convert audio time to effective recording time
  const audioTimeToEffectiveTime = useCallback((audioTime: number): number => {
    const audioEvents = sortedAudioEvents.current;
    if (audioEvents.length === 0) {
      return audioTime; // No pause events, time is 1:1
    }

    let effectiveTime = audioTime;
    let totalPausedDuration = 0;
    let currentPauseStart = 0;
    let isPaused = false;

    for (const audioEvent of audioEvents) {
      if (audioEvent.timestamp > audioTime) break;

      if (audioEvent.type === "pause") {
        currentPauseStart = audioEvent.timestamp;
        isPaused = true;
      } else if (audioEvent.type === "resume" && isPaused) {
        totalPausedDuration += audioEvent.timestamp - currentPauseStart;
        isPaused = false;
      }
    }

    // If we're currently in a paused section, subtract that duration
    if (isPaused && currentPauseStart > 0) {
      totalPausedDuration += audioTime - currentPauseStart;
    }

    return audioTime - totalPausedDuration;
  }, []);

  // Create reverse mapping: effective time to audio time
  const effectiveTimeToAudioTime = useCallback(
    (effectiveTime: number): number => {
      const audioEvents = sortedAudioEvents.current;
      if (audioEvents.length === 0) {
        return effectiveTime; // No pause events, time is 1:1
      }

      let audioTime = effectiveTime;
      let addedPauseDuration = 0;
      let currentPauseStart = 0;
      let isPaused = false;

      for (const audioEvent of audioEvents) {
        if (audioEvent.type === "pause") {
          if (audioEvent.timestamp <= effectiveTime + addedPauseDuration) {
            currentPauseStart = audioEvent.timestamp;
            isPaused = true;
          } else {
            break;
          }
        } else if (audioEvent.type === "resume" && isPaused) {
          if (audioEvent.timestamp <= effectiveTime + addedPauseDuration) {
            addedPauseDuration += audioEvent.timestamp - currentPauseStart;
            isPaused = false;
          } else {
            break;
          }
        }
      }

      return effectiveTime + addedPauseDuration;
    },
    []
  );
  // Find the code state at a specific effective time
  const getCodeAtTime = useCallback(
    (effectiveTime: number): string => {
      const events = sortedCodeEvents.current;
      let code = session.initialCode;

      console.log("Getting code at effective time:", {
        effectiveTime,
        eventsCount: events.length,
      });

      // Find the latest code event that should be applied at this effective time
      // Code events are already stored in effective time (excluding pauses)
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        if (event.timestamp <= effectiveTime && event.data) {
          code = event.data;
        } else {
          break;
        }
      }

      return code;
    },
    [session.initialCode]
  );

  // Update playback state using requestAnimationFrame for smooth updates
  const updatePlayback = useCallback(() => {
    console.log("updatePlayback called, isPlaying:", isPlaying);

    if (!isPlaying) {
      console.log("Not playing, stopping animation frame");
      return;
    }

    let effectiveTime: number;

    if (audioRef.current && audioUrl) {
      // Get current time from audio element and convert to effective time
      const audioTime = audioRef.current.currentTime * 1000; // Convert to milliseconds
      effectiveTime = audioTimeToEffectiveTime(audioTime);
      console.log("Audio time mapping:", {
        audioTime,
        effectiveTime,
        audioSeconds: audioRef.current.currentTime,
      });
    } else {
      // No audio - use performance timing (already in effective time)
      const elapsed = performance.now() - playbackStartTimeRef.current;
      effectiveTime = pausedAtTimeRef.current + elapsed;
      console.log("Using performance timing:", {
        elapsed,
        pausedAt: pausedAtTimeRef.current,
        effectiveTime,
      });
    }

    effectiveTime = Math.min(effectiveTime, totalDuration);

    console.log("Update playback:", {
      effectiveTime,
      totalDuration,
      hasAudio: !!audioUrl,
      audioCurrentTime: audioRef.current?.currentTime,
    });

    setCurrentTime(effectiveTime);

    // Update code based on effective time
    const newCode = getCodeAtTime(effectiveTime);
    if (newCode !== currentCode) {
      console.log("Code changed at effective time", effectiveTime);
      setCurrentCode(newCode);
    }

    // Check if playback is complete
    if (effectiveTime >= totalDuration) {
      console.log("Playback complete");
      setIsPlaying(false);
      setCurrentTime(totalDuration);
      setCurrentCode(session.finalCode);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // Continue updating
    console.log("Scheduling next animation frame");
    animationFrameRef.current = requestAnimationFrame(updatePlayback);
  }, [
    isPlaying,
    totalDuration,
    getCodeAtTime,
    session.finalCode,
    audioUrl,
    currentCode,
    audioTimeToEffectiveTime,
  ]);

  const startPlayback = useCallback(async () => {
    if (isPlaying || isTransitioning) return;

    console.log("Starting playback...");

    let effectiveTimeToStartFrom = currentTime;
    if (effectiveTimeToStartFrom >= totalDuration) {
      effectiveTimeToStartFrom = 0;
      setCurrentTime(0);
    }

    // Set initial code state
    const initialCode = getCodeAtTime(effectiveTimeToStartFrom);
    setCurrentCode(initialCode);
    setIsPlaying(true);

    console.log("Playback setup:", {
      effectiveTimeToStartFrom,
      hasAudio: !!audioUrl,
      totalDuration,
    });

    // Always start the animation loop regardless of audio
    playbackStartTimeRef.current = performance.now();
    pausedAtTimeRef.current = effectiveTimeToStartFrom;

    // Start audio at the correct position if available
    if (audioUrl && audioRef.current) {
      // Convert effective time to audio time for seeking
      const audioTimeToSeek = effectiveTimeToAudioTime(
        effectiveTimeToStartFrom
      );
      audioRef.current.currentTime = audioTimeToSeek / 1000;
      console.log("Audio seek:", {
        effectiveTime: effectiveTimeToStartFrom,
        audioTime: audioTimeToSeek,
        audioSeconds: audioTimeToSeek / 1000,
      });
      try {
        await audioRef.current.play();
        console.log("Audio started successfully");
      } catch (error) {
        console.error("Error playing audio:", error);
        // Don't stop playback if audio fails, continue with visual playback
      }
    }

    // Start the animation frame loop
    console.log("Starting animation frame loop");
    const frameId = requestAnimationFrame(updatePlayback);
    animationFrameRef.current = frameId;
    console.log("Animation frame scheduled with ID:", frameId);
  }, [
    isPlaying,
    isTransitioning,
    currentTime,
    totalDuration,
    audioUrl,
    getCodeAtTime,
    updatePlayback,
    effectiveTimeToAudioTime,
  ]);

  const stopPlayback = useCallback(
    (finished = false) => {
      console.log("stopPlayback called, finished:", finished);
      setIsPlaying(false);

      // Cancel animation frame
      if (animationFrameRef.current) {
        console.log("Canceling animation frame:", animationFrameRef.current);
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Stop audio
      if (audioRef.current) {
        console.log("Stopping audio");
        audioRef.current.pause();
        if (!finished) {
          audioRef.current.currentTime = 0;
        }
      }

      // Set final state
      if (finished) {
        console.log("Setting finished state");
        setCurrentTime(totalDuration);
        setCurrentCode(session.finalCode);
      } else {
        console.log("Resetting to initial state");
        setCurrentTime(0);
        setCurrentCode(session.initialCode);
      }

      // Reset timing references
      playbackStartTimeRef.current = 0;
      pausedAtTimeRef.current = 0;
    },
    [totalDuration, session.finalCode, session.initialCode]
  );

  const pausePlayback = useCallback(() => {
    console.log("pausePlayback called");
    setIsPlaying(false);

    // Cancel animation frame
    if (animationFrameRef.current) {
      console.log("Canceling animation frame:", animationFrameRef.current);
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Pause audio
    if (audioRef.current) {
      console.log("Pausing audio");
      audioRef.current.pause();
    }

    // Store current time for resume
    pausedAtTimeRef.current = currentTime;
    console.log("Paused at time:", currentTime);
  }, [currentTime]);

  const seekTo = useCallback(
    async (effectiveTime: number) => {
      const targetEffectiveTime = Math.max(
        0,
        Math.min(effectiveTime, totalDuration)
      );
      const wasPlaying = isPlaying;

      // Stop current playback
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      setCurrentTime(targetEffectiveTime);

      // Find the correct code state at this effective time
      const newCode = getCodeAtTime(targetEffectiveTime);
      setCurrentCode(newCode);

      // Seek audio to the correct position (convert to audio time)
      if (audioRef.current && audioUrl) {
        const audioTimeToSeek = effectiveTimeToAudioTime(targetEffectiveTime);
        audioRef.current.currentTime = audioTimeToSeek / 1000;
        console.log("Seek audio:", {
          targetEffectiveTime,
          audioTimeToSeek,
          audioSeconds: audioTimeToSeek / 1000,
        });
      }

      // Resume playback if it was playing
      if (wasPlaying) {
        // Small delay to ensure audio seeking is complete
        setTimeout(() => {
          startPlayback();
        }, 100);
      } else {
        // Update timing references for paused state
        playbackStartTimeRef.current = performance.now();
        pausedAtTimeRef.current = targetEffectiveTime;
      }
    },
    [
      isPlaying,
      audioUrl,
      totalDuration,
      getCodeAtTime,
      startPlayback,
      effectiveTimeToAudioTime,
    ]
  );

  const toggleInteractiveMode = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    if (isInteractiveMode) {
      // Exiting interactive mode
      setIsInteractiveMode(false);
      setCurrentCode(userEditedCode);
      setTimeout(() => {
        setIsTransitioning(false);
        startPlayback();
      }, 100);
    } else {
      // Entering interactive mode
      pausePlayback();
      setUserEditedCode(currentCode);
      setTimeout(() => {
        setIsInteractiveMode(true);
        setIsTransitioning(false);
      }, 100);
    }
  }, [
    isInteractiveMode,
    isTransitioning,
    userEditedCode,
    currentCode,
    startPlayback,
    pausePlayback,
  ]);

  const resumeWithOriginalCode = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setIsInteractiveMode(false);
    setCurrentCode(session.finalCode);
    setTimeout(() => {
      setIsTransitioning(false);
      startPlayback();
    }, 100);
  }, [isTransitioning, session.finalCode, startPlayback]);

  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (!value || !isInteractiveMode) return;
      setCurrentCode(value);
      setUserEditedCode(value);
    },
    [isInteractiveMode]
  );

  // Monitor isPlaying state and ensure animation loop is running
  useEffect(() => {
    console.log("isPlaying changed to:", isPlaying);
    if (isPlaying && !animationFrameRef.current) {
      console.log(
        "isPlaying is true but no animation frame running, starting one"
      );
      const frameId = requestAnimationFrame(updatePlayback);
      animationFrameRef.current = frameId;
    }
  }, [isPlaying, updatePlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const formatTime = useCallback((milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  return {
    // State
    currentCode,
    isPlaying,
    currentTime,
    audioUrl,
    isInteractiveMode,
    userEditedCode,
    isTransitioning,
    totalDuration,

    // Refs
    audioRef,

    // Actions
    startPlayback,
    stopPlayback,
    pausePlayback,
    seekTo,
    toggleInteractiveMode,
    resumeWithOriginalCode,
    handleCodeChange,

    // Utilities
    formatTime,
  };
}
