"use client";

import { useState, useRef, useEffect } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { RecordingSession, AudioEvent } from "./CodeRecorder";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Square, Edit3, RotateCcw, Lightbulb } from "lucide-react";

export interface CodeEvent {
  timestamp: number;
  type: "keypress" | "delete" | "paste";
  data?: string;
  position?: number;
}

interface CodePlaybackProps {
  session: RecordingSession;
}

export default function CodePlayback({ session }: CodePlaybackProps) {
  const [currentCode, setCurrentCode] = useState(session.initialCode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, _setPlaybackSpeed] = useState(1);
  const playbackSpeedRef = useRef(playbackSpeed);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [originalCode, setOriginalCode] = useState(session.finalCode);
  const [userEditedCode, setUserEditedCode] = useState(session.finalCode);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentEventIndexRef = useRef(0);

  const setPlaybackSpeed = (speed: number) => {
    playbackSpeedRef.current = speed;
    _setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Create audio URL from blob or use provided URL
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
        const { data, type } = session.audioBlob as any;

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

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Handle code changes during interactive mode
  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;

    if (isInteractiveMode) {
      setCurrentCode(value);
      setUserEditedCode(value);
    }
  };

  // Start playback
  const startPlayback = () => {
    if (isPlaying) return;

    let timeToStartFrom = currentTime;

    // If playback is at or near the end, reset to play from the beginning
    if (timeToStartFrom >= totalDuration) {
      timeToStartFrom = 0;
      setCurrentTime(0);
      currentEventIndexRef.current = 0;
      setCurrentCode(session.initialCode);
      if (editorRef.current) {
        editorRef.current.setPosition({ lineNumber: 1, column: 1 });
      }
    }

    setIsPlaying(true);

    if (audioRef.current && audioUrl) {
      audioRef.current.playbackRate = playbackSpeedRef.current;
      audioRef.current.currentTime = timeToStartFrom / 1000;
      audioRef.current
        .play()
        .catch((error) => console.error("Error playing audio:", error));
    }

    const startWallTime = Date.now();
    const startRecordingTime = timeToStartFrom;

    playbackTimerRef.current = setInterval(() => {
      const elapsedWallTime = Date.now() - startWallTime;
      const currentRecordingTime =
        startRecordingTime + elapsedWallTime * playbackSpeedRef.current;

      setCurrentTime(currentRecordingTime);

      const sessionStartTime = session.startTime;
      const allEvents = [...session.codeEvents, ...session.audioEvents].sort(
        (a, b) => a.timestamp - b.timestamp
      );

      while (
        currentEventIndexRef.current < allEvents.length &&
        allEvents[currentEventIndexRef.current].timestamp - sessionStartTime <=
          currentRecordingTime
      ) {
        const event = allEvents[currentEventIndexRef.current];
        processEvent(event);
        currentEventIndexRef.current++;
      }

      if (currentRecordingTime >= totalDuration) {
        stopPlayback(true); // Stop but keep final state
      }
    }, 15);
  };

  // Stop playback
  const stopPlayback = (finished = false) => {
    setIsPlaying(false);

    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      if (!finished) {
        audioRef.current.currentTime = 0;
      }
    }

    if (finished) {
      setCurrentTime(totalDuration);
      setCurrentCode(session.finalCode);
    } else {
      setCurrentTime(0);
      currentEventIndexRef.current = 0;
      setCurrentCode(session.initialCode);
      if (editorRef.current) {
        editorRef.current.setPosition({ lineNumber: 1, column: 1 });
      }
    }
  };

  // Pause playback
  const pausePlayback = () => {
    setIsPlaying(false);

    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Toggle interactive mode
  const toggleInteractiveMode = () => {
    if (isInteractiveMode) {
      setIsInteractiveMode(false);
      setCurrentCode(userEditedCode);
      startPlayback();
    } else {
      setIsInteractiveMode(true);
      setUserEditedCode(currentCode);
      pausePlayback();
    }
  };

  // Resume playback with original code
  const resumeWithOriginalCode = () => {
    setIsInteractiveMode(false);
    setCurrentCode(originalCode);
    startPlayback();
  };

  // Process individual events
  const processEvent = (event: CodeEvent | AudioEvent) => {
    if ("data" in event) {
      if (event.type === "keypress" && event.data) {
        setCurrentCode(event.data);
      }
    }
  };

  // Seek to specific time
  const seekTo = (time: number) => {
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      pausePlayback();
    }

    setCurrentTime(time);

    // Re-process events up to the seek time
    let tempCode = session.initialCode;
    const sessionStartTime = session.startTime;
    const allEvents = [...session.codeEvents, ...session.audioEvents].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    let lastCodeEventIndex = -1;
    for (let i = 0; i < allEvents.length; i++) {
      const event = allEvents[i];
      if (event.timestamp - sessionStartTime <= time) {
        if ("data" in event && event.type === "keypress" && event.data) {
          tempCode = event.data;
        }
        lastCodeEventIndex = i;
      } else {
        break;
      }
    }
    currentEventIndexRef.current = lastCodeEventIndex + 1;
    setCurrentCode(tempCode);

    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = time / 1000;
    }

    if (wasPlaying) {
      startPlayback();
    }
  };

  // Format time for display
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle playback speed change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  // Calculate total duration
  const totalDuration = session.endTime - session.startTime;
  const progressPercentage =
    totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Audio element (hidden) */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onError={(e) => console.error("Audio playback error:", e)}
        />
      )}

      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <Lightbulb className="h-5 w-5 flex-shrink-0 text-primary" />
        <div>
          <h4 className="font-semibold text-primary">
            How to Use This Walkthrough
          </h4>
          <p className="text-sm text-muted-foreground">
            Watch the instructor's code being typed in real-time with
            synchronized audio narration. You can pause at any time to edit the
            code and experiment, then resume to see the original solution.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="space-y-4 border-b bg-muted/30 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={isPlaying ? pausePlayback : startPlayback}
                size="sm"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span className="ml-2">{isPlaying ? "Pause" : "Play"}</span>
              </Button>
              <Button
                onClick={() => stopPlayback()}
                variant="outline"
                size="sm"
              >
                <Square className="h-4 w-4" />
                <span className="ml-2">Stop</span>
              </Button>
              <Button
                onClick={toggleInteractiveMode}
                variant={isInteractiveMode ? "secondary" : "outline"}
                size="sm"
              >
                <Edit3 className="h-4 w-4" />
                <span className="ml-2">
                  {isInteractiveMode ? "Exit Edit" : "Edit Mode"}
                </span>
              </Button>
              {isInteractiveMode && (
                <Button
                  onClick={resumeWithOriginalCode}
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="ml-2">Reset</span>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="speed-select"
                className="text-sm font-medium text-muted-foreground"
              >
                Speed:
              </label>
              <select
                id="speed-select"
                value={playbackSpeed}
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                className="h-9 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <span className="text-sm font-mono text-muted-foreground w-12 text-center">
              {formatTime(currentTime / playbackSpeed)}
            </span>
            <div className="relative w-full">
              <Progress value={progressPercentage} className="h-2" />
              <input
                type="range"
                min="0"
                max={totalDuration}
                value={currentTime}
                onInput={(e) =>
                  seekTo(Number((e.target as HTMLInputElement).value))
                }
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
            <span className="text-sm font-mono text-muted-foreground w-12 text-center">
              {formatTime(totalDuration / playbackSpeed)}
            </span>
          </div>
        </div>

        <div className="h-96 w-full">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={currentCode}
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
              readOnly: !isInteractiveMode,
              wordWrap: "on",
              folding: true,
              showFoldingControls: "always",
              padding: { top: 16, bottom: 16 },
            }}
          />
        </div>
      </Card>

      {isInteractiveMode && (
        <div className="flex items-center gap-3 rounded-lg border border-secondary/20 bg-secondary/5 p-4">
          <Edit3 className="h-5 w-5 flex-shrink-0 text-secondary-foreground" />
          <div>
            <h4 className="font-semibold text-secondary-foreground">
              You are in Interactive Mode
            </h4>
            <p className="text-sm text-muted-foreground">
              Feel free to edit the code. Click "Exit Edit" to continue the
              walkthrough with your changes, or "Reset" to revert to the
              original.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
