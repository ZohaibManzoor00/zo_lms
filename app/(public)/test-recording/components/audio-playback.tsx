"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Gauge,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  Copy,
  Check,
} from "lucide-react";
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
  language?: string; // Add language property
}

interface AudioPlaybackProps {
  recording: AudioRecording;
}

// Language color mapping (same as code snippet card)
const languageColors: Record<string, string> = {
  javascript: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  typescript: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  python: "bg-green-500/10 text-green-700 border-green-500/20",
  java: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  cpp: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  c: "bg-gray-500/10 text-gray-700 border-gray-500/20",
  rust: "bg-red-500/10 text-red-700 border-red-500/20",
  go: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
  php: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  ruby: "bg-red-600/10 text-red-800 border-red-600/20",
  swift: "bg-orange-600/10 text-orange-800 border-orange-600/20",
  kotlin: "bg-purple-600/10 text-purple-800 border-purple-600/20",
  html: "bg-orange-400/10 text-orange-600 border-orange-400/20",
  css: "bg-blue-400/10 text-blue-600 border-blue-400/20",
  sql: "bg-teal-500/10 text-teal-700 border-teal-500/20",
  bash: "bg-gray-600/10 text-gray-800 border-gray-600/20",
  shell: "bg-gray-600/10 text-gray-800 border-gray-600/20",
  json: "bg-green-400/10 text-green-600 border-green-400/20",
  yaml: "bg-pink-500/10 text-pink-700 border-pink-500/20",
};

const getLanguageColor = (language: string) => {
  return (
    languageColors[language.toLowerCase()] ||
    "bg-gray-500/10 text-gray-700 border-gray-500/20"
  );
};

export function AudioPlayback({ recording }: AudioPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [wasPlayingBeforeSeek, setWasPlayingBeforeSeek] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentCode, setCurrentCode] = useState(recording.initialCode);
  const [userEditedCode, setUserEditedCode] = useState<string | null>(null);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Available playback speeds
  const playbackSpeeds = [1, 1.5, 2, 2.5];

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Sorted code events for efficient lookup
  const sortedCodeEvents = useRef<CodeEvent[]>([]);

  useEffect(() => {
    sortedCodeEvents.current = [...recording.codeEvents].sort(
      (a, b) => a.timestamp - b.timestamp
    );
  }, [recording.codeEvents]);

  // Create audio URL from blob
  useEffect(() => {
    const url = URL.createObjectURL(recording.audioBlob);
    setAudioUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [recording.audioBlob]);

  // Setup audio element
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
  }, [audioUrl, recording.duration]);

  // Get code state at specific time
  const getCodeAtTime = useCallback(
    (timeMs: number): string => {
      const events = sortedCodeEvents.current;
      let code = recording.initialCode;

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        if (event.timestamp <= timeMs && event.data) {
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

  // Handle user code changes during pause
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (!value || isPlaying) return;

      setUserEditedCode(value);
      setCurrentCode(value);
      setIsUserEditing(true);
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
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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

  // Handle slider change start (when user starts dragging)
  const handleSliderChangeStart = useCallback(() => {
    setWasPlayingBeforeSeek(isPlaying);
    setIsSeeking(true);

    if (isPlaying) {
      pause();
    }
  }, [isPlaying, pause]);

  // Handle slider change (during dragging)
  const handleSliderChange = useCallback(
    (value: number[]) => {
      if (!isFinite(duration) || duration <= 0) return;

      const time = (value[0] / 100) * duration;
      seekTo(time);
    },
    [duration, seekTo]
  );

  // Handle slider change end (when user releases)
  const handleSliderChangeEnd = useCallback(() => {
    setIsSeeking(false);

    if (wasPlayingBeforeSeek) {
      // Small delay to ensure seeking is complete
      setTimeout(() => {
        play();
      }, 50);
    }
  }, [wasPlayingBeforeSeek, play]);

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
    if (audioRef.current) {
      const newTime = Math.max(currentTime - 10, 0);
      seekTo(newTime);
    }
  }, [currentTime, seekTo]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Copy code functionality
  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setIsCopied(true);
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

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Loading audio...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={`transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : ""
      }`}
    >
      <Card
        className={`border-0 shadow-lg overflow-hidden py-0 gap-0 pb-0 ${
          isFullscreen ? "w-full h-full rounded-xl flex flex-col" : "rounded-xl"
        }`}
      >
        {/* Header */}
        <CardHeader className="bg-gradient-to-r pt-2 from-primary/5 to-transparent border-b [.border-b]:pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{recording.id}</CardTitle>
              <Badge
                variant="secondary"
                className={`text-xs ${getLanguageColor(
                  recording.language || "python"
                )}`}
              >
                {recording.language || "Python"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {isFinite(duration)
                  ? formatTime(duration / playbackRate)
                  : "--:--"}{" "}
                at {playbackRate}x
              </Badge>
              {/* {!isPlaying && (
                <Badge variant="secondary" className="text-xs">
                  {isUserEditing ? "Editing" : "Paused"}
                </Badge>
              )} */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                className="h-8 w-8 p-0"
                disabled={isCopied}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent
          className={`p-0 ${isFullscreen ? "flex-1 flex flex-col" : ""}`}
        >
          {/* Code Editor */}
          <div
            className={`w-full ${
              isFullscreen ? "h-[calc(100vh-180px)]" : "h-96"
            } relative`}
          >
            <Editor
              height="100%"
              defaultLanguage="python"
              value={currentCode}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: isFullscreen ? 16 : 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                readOnly: isPlaying, // Only editable when paused
                fontFamily:
                  "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              }}
            />

            {/* Integrated Progress Bar */}
            <div
              data-progress-bar
              className="absolute bottom-0 left-0 right-0 h-1 bg-border/50 cursor-pointer group hover:h-3 transition-all duration-200 z-10"
              onMouseDown={handleProgressMouseDown}
              onMouseMove={(e) => {
                if (!isDragging) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const hoverX = e.clientX - rect.left;
                  const percentage = (hoverX / rect.width) * 100;
                  const hoverTime = (percentage / 100) * duration;
                  e.currentTarget.title = `Seek to ${formatTime(hoverTime)}`;
                }
              }}
            >
              {/* Progress Fill */}
              <div
                className="h-full bg-primary relative"
                style={{
                  width: `${Math.max(0, Math.min(100, progressWidth))}%`,
                  transition: isSeeking ? "none" : "none",
                }}
              >
                {/* Progress Handle - only visible on hover */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mr-1.5 shadow-lg border-2 border-background" />
              </div>

              {/* Time indicators on hover */}
              <div className="absolute -top-8 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-black/90 text-white px-2 py-1 rounded pointer-events-none">
                {formatTime(currentTime / playbackRate)}
              </div>
              <div className="absolute -top-8 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-black/90 text-white px-2 py-1 rounded pointer-events-none">
                {isFinite(duration)
                  ? formatTime(duration / playbackRate)
                  : "--:--"}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div
            className={`p-4 bg-muted/20 ${isFullscreen ? "flex-shrink-0" : ""}`}
          >
            {/* Control Buttons */}
            <div className="flex justify-between items-center">
              {/* Left: Reset */}
              <Button onClick={() => seekTo(0)} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>

              {/* Center: Skip Back, Play/Pause, Skip Forward */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={skipBackward}
                  className="h-12 w-12 p-0 rounded-full"
                >
                  <SkipBack className="h-5 w-5" />
                </Button>

                <Button
                  onClick={togglePlayPause}
                  size="lg"
                  className="h-14 w-14 p-0 rounded-full shadow-lg"
                  disabled={!isFinite(duration) || duration <= 0}
                >
                  {isPlaying ? (
                    <Pause className="h-7 w-7" />
                  ) : (
                    <Play className="h-7 w-7 ml-0.5" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={skipForward}
                  className="h-12 w-12 p-0 rounded-full"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              {/* Right: Speed */}
              <Button
                onClick={togglePlaybackSpeed}
                variant="outline"
                size="sm"
                className="font-mono w-[75px] flex-shrink-0 justify-between"
              >
                <Gauge className="h-4 w-4" />
                <span>{playbackRate}x</span>
              </Button>
            </div>

            {/* Help Text */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
