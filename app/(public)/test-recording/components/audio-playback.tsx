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
} from "lucide-react";

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
}

interface AudioPlaybackProps {
  recording: AudioRecording;
}

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

  // Available playback speeds
  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

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

      console.log("Audio loaded:", {
        audioDuration: audioDuration,
        recordedDuration: recordedDuration,
        isFinite: isFinite(audioDuration),
        isNull: audioDuration === null,
        isNaN: isNaN(audioDuration),
      });

      // Use recorded duration as fallback when audio duration is invalid
      let finalDuration = recordedDuration;
      if (isFinite(audioDuration) && audioDuration > 0) {
        // Use the recorded duration as it's more accurate for our use case
        finalDuration = recordedDuration;
        console.log("Using recorded duration:", finalDuration);
      } else {
        console.log(
          "Audio duration invalid, using recorded duration:",
          finalDuration
        );
      }

      setDuration(finalDuration);
      setIsLoading(false);
    };

    const handleLoadedData = () => {
      console.log("Audio data loaded");
    };

    const handleCanPlay = () => {
      console.log("Audio can play");
    };

    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setIsLoading(false);
    };

    const handleEnded = () => {
      console.log("Audio ended");
      setIsPlaying(false);
      setCurrentTime(0);
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

  // Update current time during playback
  const updateTime = useCallback(() => {
    if (audioRef.current && isPlaying && !isSeeking) {
      const newTime = audioRef.current.currentTime;
      setCurrentTime(newTime);

      // Update code based on current time (only when not user editing)
      if (!isUserEditing) {
        const timeMs = newTime * 1000; // Convert to milliseconds
        const codeAtTime = getCodeAtTime(timeMs);
        if (codeAtTime !== currentCode) {
          setCurrentCode(codeAtTime);
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  }, [isPlaying, isSeeking, currentCode, isUserEditing]);

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
      console.log("Audio playing at", playbackRate + "x speed");
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }, [playbackRate, currentTime, getCodeAtTime, isUserEditing]);

  // Pause audio
  const pause = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setIsPlaying(false);
    console.log("Audio paused");
  }, []);

  // Stop audio
  const stop = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setCurrentCode(recording.initialCode); // Reset to initial code
    setIsPlaying(false);
    setIsUserEditing(false);
    setUserEditedCode(null);
    console.log("Audio stopped");
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

      // Update code to match the seeked time
      const timeMs = targetTime * 1000;
      const codeAtTime = getCodeAtTime(timeMs);
      setCurrentCode(codeAtTime);

      console.log(
        "Seeked to:",
        targetTime,
        "Duration:",
        duration,
        "Speed:",
        playbackRate + "x"
      );
    },
    [duration, playbackRate, getCodeAtTime]
  );

  // Handle slider change start (when user starts dragging)
  const handleSliderChangeStart = useCallback(() => {
    console.log("Seeking started, isPlaying:", isPlaying);
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
    console.log("Seeking ended, wasPlaying:", wasPlayingBeforeSeek);
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

    console.log("Playback speed changed to:", nextSpeed + "x");
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

  const progress =
    duration > 0 && isFinite(duration) ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : ""
      }`}
    >
      <Card
        className={`border-0 shadow-lg overflow-hidden ${
          isFullscreen ? "w-full h-full rounded-xl flex flex-col" : "rounded-xl"
        }`}
      >
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Code Walkthrough
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {formatTime(currentTime)} /{" "}
                {isFinite(duration) ? formatTime(duration) : "--:--"}
              </Badge>
              {!isPlaying && (
                <Badge variant="secondary" className="text-xs">
                  {isUserEditing ? "Editing" : "Paused"}
                </Badge>
              )}
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
            className={`w-full border-b ${isFullscreen ? "flex-1" : "h-96"}`}
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
          </div>

          {/* Controls */}
          <div
            className={`p-4 bg-muted/20 ${isFullscreen ? "flex-shrink-0" : ""}`}
          >
            {/* Progress Bar */}
            <div className="space-y-2 mb-4">
              <Slider
                value={[progress]}
                max={100}
                step={0.1}
                onValueChange={handleSliderChange}
                onValueCommit={handleSliderChangeEnd}
                onPointerDown={handleSliderChangeStart}
                className="w-full"
                disabled={!isFinite(duration) || duration <= 0}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0:00</span>
                <span>
                  {isFinite(duration) ? formatTime(duration) : "--:--"}
                </span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-between items-center">
              {/* Left: Reset */}
              <Button onClick={() => seekTo(0)} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
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
                className="font-mono min-w-[70px]"
              >
                <Gauge className="h-4 w-4 mr-1" />
                {playbackRate}x
              </Button>
            </div>

            {/* Help Text */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
