"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square, Edit3, RotateCcw, Lightbulb } from "lucide-react";
import type { RecordingSession, AudioEvent, CodeEvent } from "./code-recorder";
import { CopyButton } from "@/components/ui/copy-button";

interface AudioBlobData {
  data: number[];
  type: string;
}

interface CodePlaybackProps {
  session: RecordingSession;
  showGuide?: boolean;
}

export const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export default function CodePlayback({
  session,
  showGuide = false,
}: CodePlaybackProps) {
  const [currentCode, setCurrentCode] = useState(session.initialCode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [userEditedCode, setUserEditedCode] = useState(session.finalCode);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type MonacoEditor = any;

  const editorRef = useRef<MonacoEditor>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentEventIndexRef = useRef(0);

  // Calculate total duration
  const totalDuration = session.endTime - session.startTime;

  // Memoize sorted events to avoid recomputing on every render
  const sortedEvents = useRef<(CodeEvent | AudioEvent)[]>([]);

  useEffect(() => {
    sortedEvents.current = [...session.codeEvents, ...session.audioEvents].sort(
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

  const handleEditorDidMount = (editor: MonacoEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (!value || !isInteractiveMode) return;
      setCurrentCode(value);
      setUserEditedCode(value);
    },
    [isInteractiveMode]
  );

  const processEvent = useCallback((event: CodeEvent | AudioEvent) => {
    if ("data" in event && event.type === "keypress" && event.data) {
      setCurrentCode(event.data);
    }
  }, []);

  const startPlayback = useCallback(() => {
    if (isPlaying || isTransitioning) return;

    let timeToStartFrom = currentTime;
    if (timeToStartFrom >= totalDuration) {
      timeToStartFrom = 0;
      setCurrentTime(0);
      currentEventIndexRef.current = 0;
    }

    if (timeToStartFrom === 0) {
      setCurrentCode(session.initialCode);
      currentEventIndexRef.current = 0;
      if (editorRef.current) {
        editorRef.current.setPosition({ lineNumber: 1, column: 1 });
      }
    }

    setIsPlaying(true);

    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = timeToStartFrom / 1000;
      audioRef.current
        .play()
        .catch((error) => console.error("Error playing audio:", error));
    }

    const startWallTime = Date.now();
    const startRecordingTime = timeToStartFrom;

    playbackTimerRef.current = setInterval(() => {
      const elapsedWallTime = Date.now() - startWallTime;
      const currentRecordingTime = startRecordingTime + elapsedWallTime;
      setCurrentTime(currentRecordingTime);

      const sessionStartTime = session.startTime;
      const events = sortedEvents.current;

      while (
        currentEventIndexRef.current < events.length &&
        events[currentEventIndexRef.current].timestamp - sessionStartTime <=
          currentRecordingTime
      ) {
        const event = events[currentEventIndexRef.current];
        processEvent(event);
        currentEventIndexRef.current++;
      }

      if (currentRecordingTime >= totalDuration) {
        stopPlayback(true);
      }
    }, 50); // Increased from 15ms to 50ms for better performance
  }, [
    isPlaying,
    isTransitioning,
    currentTime,
    totalDuration,
    session,
    audioUrl,
    processEvent,
  ]);

  const stopPlayback = useCallback(
    (finished = false) => {
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
    },
    [totalDuration, session.finalCode, session.initialCode]
  );

  const pausePlayback = useCallback(() => {
    setIsPlaying(false);
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

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

  // Immediate seeking function
  const seekTo = useCallback(
    (time: number) => {
      const targetTime = time;
      const wasPlaying = isPlaying;

      // Stop current playback timer if running
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }

      setCurrentTime(targetTime);
      let tempCode = session.initialCode;
      const sessionStartTime = session.startTime;
      const events = sortedEvents.current;

      let lastCodeEventIndex = -1;
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        if (event.timestamp - sessionStartTime <= targetTime) {
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
        audioRef.current.currentTime = targetTime / 1000;
      }

      // Restart playback from the new position if it was playing
      if (wasPlaying) {
        const startWallTime = Date.now();
        const startRecordingTime = targetTime;

        if (audioRef.current && audioUrl) {
          audioRef.current
            .play()
            .catch((error) => console.error("Error playing audio:", error));
        }

        playbackTimerRef.current = setInterval(() => {
          const elapsedWallTime = Date.now() - startWallTime;
          const currentRecordingTime = startRecordingTime + elapsedWallTime;
          setCurrentTime(currentRecordingTime);

          const sessionStartTime = session.startTime;
          const events = sortedEvents.current;

          while (
            currentEventIndexRef.current < events.length &&
            events[currentEventIndexRef.current].timestamp - sessionStartTime <=
              currentRecordingTime
          ) {
            const event = events[currentEventIndexRef.current];
            if ("data" in event && event.type === "keypress" && event.data) {
              setCurrentCode(event.data);
            }
            currentEventIndexRef.current++;
          }

          if (currentRecordingTime >= totalDuration) {
            setIsPlaying(false);
            if (playbackTimerRef.current) {
              clearInterval(playbackTimerRef.current);
              playbackTimerRef.current = null;
            }
            setCurrentTime(totalDuration);
            setCurrentCode(session.finalCode);
          }
        }, 50);
      }
    },
    [isPlaying, session, audioUrl, totalDuration]
  );

  const handleScrubberInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const time = Number((e.target as HTMLInputElement).value);
      seekTo(time); // Immediate seeking with no debounce
    },
    [seekTo]
  );

  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onError={(e) => console.error("Audio playback error:", e)}
        />
      )}
      {showGuide && (
        <div className="pt-4 px-4">
          <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4">
            <Lightbulb className="h-5 w-5 flex-shrink-0 text-primary" />
            <div>
              <h4 className="font-semibold text-primary">
                How to Use This Walkthrough
              </h4>
              <p className="text-sm text-muted-foreground">
                Watch the instructor&apos;s code being typed in real-time with
                synchronized audio narration. You can pause at any time to edit
                the code and experiment, then resume to see the original
                solution.
              </p>
            </div>
          </div>
        </div>
      )}
      <Card className="overflow-hidden rounded-none border-none pt-4 pb-0">
        <div className="space-y-4 px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={isPlaying ? pausePlayback : startPlayback}
                size="sm"
                disabled={isTransitioning}
              >
                {isPlaying ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
                <span>{isPlaying ? "Pause" : "Play"}</span>
              </Button>
              <Button
                onClick={() => stopPlayback()}
                variant="outline"
                size="sm"
                disabled={isTransitioning}
              >
                <Square className="size-4" />
                <span>Stop</span>
              </Button>
              <Button
                onClick={toggleInteractiveMode}
                variant={isInteractiveMode ? "secondary" : "outline"}
                size="sm"
                disabled={isTransitioning}
              >
                <Edit3 className="size-4" />
                <span>
                  {isTransitioning
                    ? "..."
                    : isInteractiveMode
                    ? "Exit Edit"
                    : "Edit Mode"}
                </span>
              </Button>
              {isInteractiveMode && (
                <Button
                  onClick={resumeWithOriginalCode}
                  variant="outline"
                  size="sm"
                  disabled={isTransitioning}
                >
                  <RotateCcw className="size-4" />
                  <span>Reset</span>
                </Button>
              )}
              <CopyButton textToCopy={currentCode} size="sm" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <span className="text-sm font-mono text-muted-foreground w-12 text-center">
              {formatTime(currentTime)}
            </span>
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <input
                  type="range"
                  min="0"
                  max={totalDuration}
                  value={currentTime}
                  onInput={handleScrubberInput}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
            <span className="text-sm font-mono text-muted-foreground w-12 text-center">
              {formatTime(totalDuration)}
            </span>
          </div>
        </div>
        <div className="h-[calc(100vh-200px)] w-full">
          <Editor
            height="100%"
            width="100%"
            defaultLanguage="python"
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
              smoothScrolling: true,
              cursorSmoothCaretAnimation: "on",
            }}
          />
          </div>
      </Card>
      {isInteractiveMode && showGuide && (
        <div className="p-4 -mt-3">
          <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4">
            <Edit3 className="h-5 w-5 flex-shrink-0 text-primary" />
            <div>
              <h4 className="font-semibold text-primary">
                You are in Interactive Mode
              </h4>
              <p className="text-sm text-muted-foreground">
                Feel free to edit the code. Click &quot;Exit Edit&quot; to
                continue the walkthrough with your changes, or &quot;Reset&quot;
                to revert to the original.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
