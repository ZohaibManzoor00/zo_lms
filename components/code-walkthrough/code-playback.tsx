"use client";

import { useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square, Edit3, RotateCcw } from "lucide-react";
import type { RecordingSession } from "./code-recorder";
import { CopyButton } from "@/components/ui/copy-button";
import { useCodePlayback } from "@/hooks/use-code-playback";

interface CodePlaybackProps {
  session: RecordingSession;
}

// Export formatTime for backward compatibility
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
}: CodePlaybackProps) {
  const {
    currentCode,
    isPlaying,
    currentTime,
    audioUrl,
    isInteractiveMode,
    isTransitioning,
    totalDuration,
    audioRef,
    startPlayback,
    stopPlayback,
    pausePlayback,
    seekTo,
    toggleInteractiveMode,
    resumeWithOriginalCode,
    handleCodeChange,
    formatTime,
  } = useCodePlayback({ session });

  // Debug the hook values
  console.log("CodePlayback render:", {
    isPlaying,
    currentTime,
    totalDuration,
    isTransitioning,
    hasAudio: !!audioUrl,
    codeLength: currentCode.length,
    sessionId: session.id,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type MonacoEditor = any;

  const editorRef = useRef<MonacoEditor>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const handleEditorDidMount = (editor: MonacoEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleScrubberInput = (e: React.FormEvent<HTMLInputElement>) => {
    const time = Number((e.target as HTMLInputElement).value);
    console.log("Scrubber input:", time);
    seekTo(time);
  };

  const handlePlayPause = () => {
    console.log("Play/Pause clicked, current state:", {
      isPlaying,
      isTransitioning,
    });
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  };

  const handleStop = () => {
    console.log("Stop clicked");
    stopPlayback();
  };

  return (
    <div className="space-y-4">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onError={(e) => console.error("Audio playback error:", e)}
        />
      )}
      <Card className="overflow-hidden  pt-4 pb-0">
        <div className="space-y-4 px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handlePlayPause}
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
                onClick={handleStop}
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
          {/* Debug info */}
        </div>
        <div className="h-[calc(100vh-200px)] w-full">
          <Editor
            height="100%"
            width="100%"
            defaultLanguage="python"
            value={currentCode}
            onMount={handleEditorDidMount}
            onChange={handleCodeChange}
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
    </div>
  );
}
