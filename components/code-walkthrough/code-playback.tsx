"use client";

import { useState, useRef, useEffect } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square, Edit3, RotateCcw, Lightbulb } from "lucide-react";
import type { RecordingSession, AudioEvent, CodeEvent } from "./code-recorder";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [playbackSpeed, _setPlaybackSpeed] = useState(1);
  const playbackSpeedRef = useRef(playbackSpeed);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [originalCode] = useState(session.finalCode);
  const [userEditedCode, setUserEditedCode] = useState(session.finalCode);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type MonacoEditor = any;

  const editorRef = useRef<MonacoEditor>(null);
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

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    if (isInteractiveMode) {
      setCurrentCode(value);
      setUserEditedCode(value);
    }
  };

  const startPlayback = () => {
    if (isPlaying) return;
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
        stopPlayback(true);
      }
    }, 15);
  };

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

  const resumeWithOriginalCode = () => {
    setIsInteractiveMode(false);
    setCurrentCode(originalCode);
    startPlayback();
  };

  const processEvent = (event: CodeEvent | AudioEvent) => {
    if ("data" in event) {
      if (event.type === "keypress" && event.data) {
        setCurrentCode(event.data);
      }
    }
  };

  const seekTo = (time: number) => {
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      pausePlayback();
    }
    setCurrentTime(time);
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

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const totalDuration = session.endTime - session.startTime;
  // const progressPercentage =
  //   totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

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
              >
                <Square className="size-4" />
                <span>Stop</span>
              </Button>
              <Button
                onClick={toggleInteractiveMode}
                variant={isInteractiveMode ? "secondary" : "outline"}
                size="sm"
              >
                <Edit3 className="size-4" />
                <span>{isInteractiveMode ? "Exit Edit" : "Edit Mode"}</span>
              </Button>
              {isInteractiveMode && (
                <Button
                  onClick={resumeWithOriginalCode}
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="size-4" />
                  <span>Reset</span>
                </Button>
              )}
              <CopyButton textToCopy={currentCode} size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={playbackSpeed.toString()}
                onValueChange={(value) => handleSpeedChange(Number(value))}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue placeholder="1x" />
                </SelectTrigger>
                <SelectContent className="w-20 min-w-20">
                  <SelectItem className="cursor-pointer" value="0.5">
                    0.5x
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="1">
                    1x
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="1.5">
                    1.5x
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="2">
                    2x
                  </SelectItem>
                </SelectContent>
              </Select>
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
                  onInput={(e) =>
                    seekTo(Number((e.target as HTMLInputElement).value))
                  }
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
            <span className="text-sm font-mono text-muted-foreground w-12 text-center">
              {formatTime(totalDuration)}
            </span>
          </div>
        </div>
        <div className="h-96 w-full">
          <Editor
            height="100%"
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
