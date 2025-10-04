"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Monaco } from "@monaco-editor/react";
import { toast } from "sonner";

interface CodeEvent {
  timestamp: number;
  type: "keypress" | "delete" | "paste";
  data: string;
  position?: number;
}

interface AudioRecording {
  id: string;
  audioBlob: Blob;
  duration: number;
  codeEvents: CodeEvent[];
  initialCode: string;
  finalCode: string;
  createdAt: Date;
  language?: string;
}

export function useAudioCodePlayback(recording: AudioRecording) {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [wasPlayingBeforeSeek, setWasPlayingBeforeSeek] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progressWidth, setProgressWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Code state
  const [currentCode, setCurrentCode] = useState(recording.initialCode);
  const [userEditedCode, setUserEditedCode] = useState<string | null>(null);
  const [isUserEditing, setIsUserEditing] = useState(false);

  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Available playback speeds
  const playbackSpeeds = [1, 1.5, 2, 2.5];

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const sortedCodeEvents = useRef<CodeEvent[]>([]);

  // Sort code events on mount
  useEffect(() => {
    sortedCodeEvents.current = [...recording.codeEvents].sort(
      (a, b) => a.timestamp - b.timestamp
    );
  }, [recording.codeEvents]);

  // Create audio URL and setup audio element
  useEffect(() => {
    const url = URL.createObjectURL(recording.audioBlob);
    setAudioUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [recording.audioBlob]);

  // Setup audio element when URL is ready
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      const audioDuration = audio.duration;
      const recordedDuration = recording.duration / 1000; // Convert to seconds

      // Use recorded duration as fallback when audio duration is invalid
      let finalDuration = recordedDuration;
      if (isFinite(audioDuration) && audioDuration > 0) {
        // Use the recorded duration as it's more accurate for our use case
        finalDuration = recordedDuration;
      }

      setDuration(finalDuration);
      setIsLoading(false);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      // Set progress to 100% when audio ends
      setCurrentTime(duration);
      setProgressWidth(100);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, [audioUrl, recording.duration, duration]);

  // Get code at specific time
  const getCodeAtTime = useCallback(
    (timeMs: number) => {
      let code = recording.initialCode;

      for (const event of sortedCodeEvents.current) {
        if (event.timestamp <= timeMs) {
          code = event.data;
        } else {
          break;
        }
      }

      return code;
    },
    [recording.initialCode]
  );

  // Update current time during playback
  const updateTime = useCallback(() => {
    if (audioRef.current && isPlaying && !isSeeking && !isDragging) {
      const newTime = audioRef.current.currentTime;
      setCurrentTime(newTime);

      // Calculate and update progress width (only when not dragging)
      const newProgress = duration > 0 ? (newTime / duration) * 100 : 0;
      setProgressWidth(newProgress);

      // Update code based on current time (only when not user editing)
      if (!isUserEditing) {
        const timeMs = newTime * 1000; // Convert to milliseconds
        const codeAtTime = getCodeAtTime(timeMs);
        if (codeAtTime !== currentCode) {
          setCurrentCode(codeAtTime);

          // Auto-scroll to show the active line at 80% down from top
          if (editorRef.current && monacoRef.current) {
            // Find the line where the change occurred by comparing old and new code
            const oldLines = currentCode.split("\n");
            const newLines = codeAtTime.split("\n");

            let changedLineNumber = newLines.length; // Default to last line

            // Find the first line that's different
            for (
              let i = 0;
              i < Math.max(oldLines.length, newLines.length);
              i++
            ) {
              if (oldLines[i] !== newLines[i]) {
                changedLineNumber = i + 1; // Monaco uses 1-based line numbers
                break;
              }
            }

            // If no differences found in existing lines, use the last line with content
            if (changedLineNumber === newLines.length) {
              // Find the last non-empty line
              for (let i = newLines.length - 1; i >= 0; i--) {
                if (newLines[i].trim() !== "") {
                  changedLineNumber = i + 1;
                  break;
                }
              }
            }

            // Use revealLineNearTop to position line at 80% from top
            // This positions the line closer to the bottom while keeping context above
            setTimeout(() => {
              if (editorRef.current) {
                // Custom scroll to position the changed line at 80% from top
                const editorHeight = editorRef.current.getLayoutInfo().height;
                const lineHeight = editorRef.current.getOption(
                  monacoRef.current?.editor.EditorOption.lineHeight
                );
                const targetScrollTop = Math.max(
                  0,
                  (changedLineNumber - 1) * lineHeight - editorHeight * 0.8
                );

                editorRef.current.setScrollTop(targetScrollTop);

                // Position cursor at end of the changed line
                const position = {
                  lineNumber: changedLineNumber,
                  column: newLines[changedLineNumber - 1]?.length + 1 || 1,
                };
                editorRef.current.setPosition(position);
              }
            }, 50);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  }, [
    isPlaying,
    isSeeking,
    isDragging,
    currentCode,
    isUserEditing,
    getCodeAtTime,
    duration,
  ]);

  // Handle editor mount
  const handleEditorDidMount = useCallback((editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }, []);

  // Handle code changes when user edits
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (!isPlaying && value !== undefined) {
        setUserEditedCode(value);
        setIsUserEditing(true);
      }
    },
    [isPlaying]
  );

  // Start time updates when playing
  useEffect(() => {
    if (isPlaying && !isSeeking) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isSeeking, updateTime]);

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Play audio
  const play = useCallback(async () => {
    if (!audioRef.current) return;

    // Revert to original code state when starting playback
    if (isUserEditing) {
      const timeMs = currentTime * 1000;
      const originalCodeAtTime = getCodeAtTime(timeMs);
      setCurrentCode(originalCodeAtTime);
      setIsUserEditing(false);
      setUserEditedCode(null);
    }

    try {
      // Set playback rate before playing
      audioRef.current.playbackRate = playbackRate;
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }, [playbackRate, currentTime, getCodeAtTime, isUserEditing]);

  // Pause audio
  const pause = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  // Stop audio
  const stop = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setProgressWidth(0);
    setCurrentCode(recording.initialCode); // Reset to initial code
    setIsPlaying(false);
    setIsUserEditing(false);
    setUserEditedCode(null);
  }, [recording.initialCode]);

  // Seek to specific time
  const seekTo = useCallback(
    (time: number) => {
      if (!audioRef.current || !isFinite(duration) || duration <= 0) return;

      const targetTime = Math.max(0, Math.min(time, duration));
      audioRef.current.currentTime = targetTime;
      // Maintain playback rate after seeking
      audioRef.current.playbackRate = playbackRate;
      setCurrentTime(targetTime);

      // Update progress and code to match the seeked time
      const newProgress = duration > 0 ? (targetTime / duration) * 100 : 0;
      setProgressWidth(newProgress);
      const timeMs = targetTime * 1000;
      const codeAtTime = getCodeAtTime(timeMs);
      setCurrentCode(codeAtTime);
    },
    [duration, playbackRate, getCodeAtTime]
  );

  // Toggle playback speed
  const togglePlaybackSpeed = useCallback(() => {
    const currentIndex = playbackSpeeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % playbackSpeeds.length;
    const nextSpeed = playbackSpeeds[nextIndex];

    setPlaybackRate(nextSpeed);

    // Update audio element if it exists
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  }, [playbackRate, playbackSpeeds]);

  // Skip functions
  const skipForward = useCallback(() => {
    if (audioRef.current && isFinite(duration)) {
      const newTime = Math.min(currentTime + 10, duration);
      seekTo(newTime);
    }
  }, [currentTime, duration, seekTo]);

  const skipBackward = useCallback(() => {
    if (audioRef.current && isFinite(duration)) {
      const newTime = Math.max(currentTime - 10, 0);
      seekTo(newTime);
    }
  }, [currentTime, seekTo]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Copy code functionality
  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setIsCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setIsCopied(false), 1500);
    } catch {
      toast.error("Failed to copy code");
    }
  }, [currentCode]);

  // Progress bar dragging handlers
  const handleProgressMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setWasPlayingBeforeSeek(isPlaying);
      setIsSeeking(true);
      if (isPlaying) {
        pause();
      }

      // Handle initial click/drag position
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = (clickX / rect.width) * 100;
      const newTime = (percentage / 100) * duration;
      if (isFinite(newTime)) {
        seekTo(newTime);
        setProgressWidth(percentage);
      }
    },
    [isPlaying, pause, duration, seekTo]
  );

  const handleProgressMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const moveX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (moveX / rect.width) * 100));
      const newTime = (percentage / 100) * duration;

      if (isFinite(newTime)) {
        seekTo(newTime);
        setProgressWidth(percentage);
      }
    },
    [isDragging, duration, seekTo]
  );

  const handleProgressMouseUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    setIsSeeking(false);

    if (wasPlayingBeforeSeek) {
      setTimeout(() => {
        play();
      }, 50);
    }
  }, [isDragging, wasPlayingBeforeSeek, play]);

  // Global mouse event listeners for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const progressBar = document.querySelector(
        "[data-progress-bar]"
      ) as HTMLElement;
      if (!progressBar) return;

      const rect = progressBar.getBoundingClientRect();
      const moveX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (moveX / rect.width) * 100));
      const newTime = (percentage / 100) * duration;

      if (isFinite(newTime)) {
        seekTo(newTime);
        setProgressWidth(percentage);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsSeeking(false);

      if (wasPlayingBeforeSeek) {
        setTimeout(() => {
          play();
        }, 50);
      }
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, duration, seekTo, wasPlayingBeforeSeek, play]);

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    isLoading,
    isSeeking,
    playbackRate,
    progressWidth,
    isDragging,
    currentCode,
    isUserEditing,
    isFullscreen,
    isCopied,
    playbackSpeeds,

    // Refs
    editorRef,
    monacoRef,

    // Functions
    play,
    pause,
    stop,
    seekTo,
    togglePlaybackSpeed,
    skipForward,
    skipBackward,
    togglePlayPause,
    toggleFullscreen,
    handleCopyCode,
    handleEditorDidMount,
    handleCodeChange,
    handleProgressMouseDown,
    handleProgressMouseMove,
    handleProgressMouseUp,
    formatTime,
  };
}
