"use client";

import { useRef, useEffect } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Square } from "lucide-react";
import type { AudioCodeSession } from "@/hooks/use-audio-code-recorder";
import { useAudioCodePlaybackUrl } from "@/hooks/use-audio-code-playback-url";

interface AudioCodePlaybackUrlProps {
  session: AudioCodeSession & { audioUrl?: string };
}

export function AudioCodePlaybackUrl({ session }: AudioCodePlaybackUrlProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const {
    currentCode,
    isPlaying,
    currentTime,
    audioUrl,
    totalDuration,
    audioRef,
    startPlayback,
    stopPlayback,
    pausePlayback,
    seekTo,
    formatTime,
  } = useAudioCodePlaybackUrl({ session });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor for better playback experience
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 1.5,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      automaticLayout: true,
    });
  };

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.dispose();
        } catch (error) {
          // Ignore disposal errors
          console.warn("Editor disposal warning:", error);
        }
        editorRef.current = null;
      }
      monacoRef.current = null;
    };
  }, []);

  const handleScrubberInput = (e: React.FormEvent<HTMLInputElement>) => {
    const time = Number((e.target as HTMLInputElement).value);
    seekTo(time);
  };

  return (
    <Card className="border shadow-lg bg-card/50 backdrop-blur-sm gap-0">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <CardTitle className="text-lg font-semibold text-foreground">
              Walkthrough Playback
            </CardTitle>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={isPlaying ? pausePlayback : startPlayback}
              size="sm"
              className="shadow-sm"
            >
              {isPlaying ? (
                <>
                  <Pause className="size-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Play
                </>
              )}
            </Button>
            <Button
              onClick={stopPlayback}
              variant="outline"
              size="sm"
              className="shadow-sm"
            >
              <Square className="size-4" />
              Stop
            </Button>
          </div>
        </div>

        {/* Progress Bar and Scrubber */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-sm font-mono text-muted-foreground w-12 text-center">
            {formatTime(currentTime)}
          </span>
          <div className="relative w-full">
            {/* Background track */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                />
              </div>
            </div>
            {/* Range input */}
            <input
              type="range"
              min="0"
              max={totalDuration}
              value={currentTime}
              onInput={handleScrubberInput}
              className="relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10
                [&::-webkit-slider-track]:bg-transparent [&::-webkit-slider-track]:h-2
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background
                [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:h-2 [&::-moz-range-track]:border-0
                [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 
                [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-none
                focus:outline-none"
            />
          </div>
          <span className="text-sm font-mono text-muted-foreground w-12 text-center">
            {formatTime(totalDuration)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Hidden audio element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            className="hidden"
          />
        )}

        {/* Code Editor */}
        <div className="h-[600px] border-0">
          <Editor
            key={session.id} // Force remount when session changes
            value={currentCode}
            language="javascript"
            theme="vs-dark"
            onMount={handleEditorDidMount}
            loading={
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading editor...
              </div>
            }
            options={{
              padding: { top: 16, bottom: 16 },
              readOnly: true, // Always read-only during playback
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
