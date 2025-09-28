"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { AudioCodeSession, CodeEvent } from "./use-audio-code-recorder";

interface UseAudioCodePlaybackOptions {
  session: AudioCodeSession;
}

export function useAudioCodePlayback({ session }: UseAudioCodePlaybackOptions) {
  const [currentCode, setCurrentCode] = useState(session.initialCode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Refs for playback control
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Memoize sorted code events
  const sortedCodeEvents = useRef<CodeEvent[]>([]);

  useEffect(() => {
    sortedCodeEvents.current = [...session.codeEvents].sort(
      (a, b) => a.timestamp - b.timestamp
    );
  }, [session.codeEvents]);

  // Create audio URL from blob
  useEffect(() => {
    if (session.audioBlob) {
      const url = URL.createObjectURL(session.audioBlob);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [session.audioBlob]);

  // Find the code state at a specific time
  const getCodeAtTime = useCallback(
    (time: number): string => {
      const events = sortedCodeEvents.current;
      let code = session.initialCode;

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        if (event.timestamp <= time && event.data) {
          code = event.data;
        } else {
          break;
        }
      }

      return code;
    },
    [session.initialCode]
  );

  // Update playback state using requestAnimationFrame
  const updatePlayback = useCallback(() => {
    if (!isPlaying) return;

    let playbackTime: number;

    if (audioRef.current && audioUrl) {
      // Get current time from audio element (in milliseconds)
      playbackTime = audioRef.current.currentTime * 1000;
    } else {
      // No audio - use performance timing
      const elapsed = performance.now() - startTimeRef.current;
      playbackTime = elapsed;
    }

    const clampedTime = Math.min(playbackTime, session.duration);
    setCurrentTime(clampedTime);

    // Update code based on current time
    const newCode = getCodeAtTime(clampedTime);
    setCurrentCode(newCode);

    // Check if playback is complete
    if (clampedTime >= session.duration) {
      setIsPlaying(false);
      setCurrentTime(session.duration);
      setCurrentCode(session.finalCode);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // Continue updating
    animationFrameRef.current = requestAnimationFrame(updatePlayback);
  }, [isPlaying, session.duration, session.finalCode, getCodeAtTime, audioUrl]);

  // Start playback
  const startPlayback = useCallback(async () => {
    if (isPlaying) return;

    let timeToStartFrom = currentTime;
    if (timeToStartFrom >= session.duration) {
      timeToStartFrom = 0;
      setCurrentTime(0);
    }

    // Set initial code state
    const initialCode = getCodeAtTime(timeToStartFrom);
    setCurrentCode(initialCode);
    setIsPlaying(true);

    // Set start time for performance timing
    startTimeRef.current = performance.now() - timeToStartFrom;

    // Start audio at the correct position if available
    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = timeToStartFrom / 1000;
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    }

    // Always start the animation frame loop
    animationFrameRef.current = requestAnimationFrame(updatePlayback);
  }, [
    isPlaying,
    currentTime,
    session.duration,
    audioUrl,
    getCodeAtTime,
    updatePlayback,
  ]);

  // Pause playback
  const pausePlayback = useCallback(() => {
    setIsPlaying(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Stop playback
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setCurrentTime(0);
    setCurrentCode(session.initialCode);
  }, [session.initialCode]);

  // Seek to specific time
  const seekTo = useCallback(
    async (time: number) => {
      const targetTime = Math.max(0, Math.min(time, session.duration));
      const wasPlaying = isPlaying;

      // Pause current playback
      if (wasPlaying) {
        setIsPlaying(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }

      setCurrentTime(targetTime);

      // Find the correct code state at this time
      const newCode = getCodeAtTime(targetTime);
      setCurrentCode(newCode);

      // Seek audio to the correct position
      if (audioRef.current && audioUrl) {
        audioRef.current.currentTime = targetTime / 1000;
      }

      // Update start time reference for performance timing
      startTimeRef.current = performance.now() - targetTime;

      // Resume playback if it was playing
      if (wasPlaying) {
        setIsPlaying(true);
        if (audioRef.current && audioUrl) {
          try {
            await audioRef.current.play();
          } catch (error) {
            console.error("Error resuming audio:", error);
          }
        }
        animationFrameRef.current = requestAnimationFrame(updatePlayback);
      }
    },
    [isPlaying, session.duration, audioUrl, getCodeAtTime, updatePlayback]
  );

  // Ensure animation loop runs when playing
  useEffect(() => {
    if (isPlaying && !animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(updatePlayback);
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

  // Format time for display
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
    totalDuration: session.duration,

    // Refs
    audioRef,

    // Actions
    startPlayback,
    pausePlayback,
    stopPlayback,
    seekTo,

    // Utilities
    formatTime,
  };
}
