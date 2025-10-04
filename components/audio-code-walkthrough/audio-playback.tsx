"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  RotateCcw,
  Gauge,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { useAudioCodePlayback } from "@/hooks/use-audio-code-playback-v2";

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

interface AudioPlaybackProps {
  recording: AudioRecording;
}

// const getLanguageColor = (language: string) => {
//   return (
//     languageColors[language.toLowerCase()] ||
//     "bg-gray-500/10 text-gray-700 border-gray-500/20"
//   );
// };

export function AudioPlayback({ recording }: AudioPlaybackProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    isLoading,
    playbackRate,
    progressWidth,
    isDragging,
    currentCode,
    isFullscreen,
    isCopied,

    togglePlayPause,
    skipForward,
    skipBackward,
    togglePlaybackSpeed,
    toggleFullscreen,
    handleCopyCode,
    handleEditorDidMount,
    handleCodeChange,
    handleProgressMouseDown,
    formatTime,
    seekTo,
  } = useAudioCodePlayback(recording);

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
        isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : "rounded-none"
      }`}
    >
      <Card
        className={`border-0 shadow-lg overflow-hidden py-0 gap-0 rounded-none pb-0 ${
          isFullscreen && "w-full h-full rounded-xl flex flex-col"
        }`}
      >
        {/* Header */}
        {/* <CardHeader className="bg-gradient-to-r pt-2 from-primary/5 to-transparent border-b [.border-b]:pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{recording.id}</CardTitle>
              <Badge
                variant="secondary"
                className={`text-xs ${getLanguageColor(
                  recording.language || "python"
                )}`}
              >
                {capitalizeFirstLetterInWord(recording.language || "python")}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
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
        </CardHeader> */}

        <CardContent
          className={`p-0 rounded-none ${isFullscreen ? "flex-1 flex flex-col" : ""}`}
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
                  transition: "none",
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

              {/* Right: Speed and Controls */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={togglePlaybackSpeed}
                  variant="outline"
                  size="sm"
                  className="font-mono w-[75px] flex-shrink-0 justify-between"
                >
                  <Gauge className="h-4 w-4" />
                  <span>{playbackRate}x</span>
                </Button>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export type { CodeEvent, AudioRecording, AudioPlaybackProps };
