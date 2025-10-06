"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Edit3,
  Headphones,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { useAudioCodePlayback } from "@/hooks/use-audio-code-playback-v2";
import { AdminWalkthroughType } from "@/app/data/admin/admin-get-walkthroughs";
import { convertWalkthroughToAudioRecording } from "@/lib/convert-walkthrough-to-audio-recording";
import { useConstructUrl } from "@/hooks/use-construct-url";

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
  audioUrl?: string;
}

interface CodeReviewPlaybackEditorV2Props {
  walkthroughs?: AdminWalkthroughType;
  defaultLanguage?: string;
  defaultCode?: string;
}

type EditorMode = "edit" | "playback";

const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
];

export function CodeReviewPlaybackEditorV2({
  walkthroughs = [],
  defaultLanguage = "python",
  defaultCode = "# Start coding here...\n",
}: CodeReviewPlaybackEditorV2Props) {
  // Editor state
  const [mode, setMode] = useState<EditorMode>("edit");
  const [language, setLanguage] = useState(defaultLanguage);
  const [code, setCode] = useState(defaultCode);
  const [selectedWalkthrough, setSelectedWalkthrough] = useState<
    AdminWalkthroughType[0] | null
  >(null);
  const [audioRecording, setAudioRecording] = useState<AudioRecording | null>(
    null
  );

  // Layout state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Editor ref
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  // Audio playback hook (always called, but handles null recording internally)
  const audioPlayback = useAudioCodePlayback(audioRecording);

  // S3 URL construction hook
  const constructUrl = useConstructUrl;

  // Handle walkthrough selection
  const handleWalkthroughSelect = useCallback(
    async (walkthrough: AdminWalkthroughType[0]) => {
      try {
        // If clicking the already selected walkthrough, switch back to edit mode
        if (selectedWalkthrough?.id === walkthrough.id) {
          setSelectedWalkthrough(null);
          setAudioRecording(null);
          setMode("edit");
          return;
        }

        setSelectedWalkthrough(walkthrough);

        // Get the audio URL from S3
        const audioUrl = constructUrl(walkthrough.audioKey);

        // Convert walkthrough to audio recording format
        const recording = convertWalkthroughToAudioRecording(
          walkthrough,
          audioUrl
        );

        setAudioRecording(recording);
        setMode("playback");

        // Set the language if available (you might want to add language to the walkthrough model)
        // For now, we'll keep the current language or default to python
      } catch (error) {
        console.error("Error loading walkthrough:", error);
      }
    },
    [constructUrl, selectedWalkthrough?.id]
  );

  // Handle code change in edit mode
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (mode === "edit" && value !== undefined) {
        setCode(value);
      }
    },
    [mode]
  );

  // Handle editor mount
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = useCallback((editor: any) => {
    editorRef.current = editor;
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Copy code functionality
  const [isCopied, setIsCopied] = useState(false);
  const handleCopyCode = useCallback(() => {
    const currentCode =
      mode === "edit" ? code : audioPlayback?.currentCode || "";
    navigator.clipboard.writeText(currentCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [mode, code, audioPlayback?.currentCode]);

  return (
    <div
      className={`transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : ""
      }`}
    >
      <Card
        className={`border shadow-lg overflow-hidden gap-0 py-0 pt-6 ${
          isFullscreen ? "w-full h-full flex flex-col" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-xl">
                Interactive Code Walkthrough
              </CardTitle>
              <Badge variant={mode === "edit" ? "default" : "secondary"}>
                <div className="flex items-center gap-1">
                  {mode === "edit" ? (
                    <Edit3 className="h-3 w-3" />
                  ) : (
                    <Headphones className="h-3 w-3" />
                  )}
                  {mode === "edit" ? "Edit Mode" : "Playback Mode"}
                </div>
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {mode === "edit" && (
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
          <div className={`flex flex-col ${isFullscreen ? "flex-1" : ""}`}>
            {/* Walkthroughs Collection Section */}
            {walkthroughs.length > 0 && (
              <div className="px-4 pb-4 border-b">
                <div className="flex flex-wrap gap-2">
                  {walkthroughs.map((walkthrough) => (
                    <Badge
                      key={walkthrough.id}
                      variant={
                        selectedWalkthrough?.id === walkthrough.id
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer transition-all hover:shadow-md px-3 py-2 text-sm ${
                        selectedWalkthrough?.id === walkthrough.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted/80"
                      }`}
                      onClick={() => handleWalkthroughSelect(walkthrough)}
                    >
                      <div className="flex items-center gap-2">
                        <Headphones className="h-3 w-3" />
                        {/* <span className="font-medium">{walkthrough.name}</span> */}
                        {/* {walkthrough.description && (
                          <>
                            <span className="text-xs opacity-70">•</span> */}
                        <span className="text-xs opacity-90 max-w-[200px] truncate">
                          {walkthrough.description}
                        </span>
                        {/* </>
                        )} */}
                      </div>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Editor Section */}
            <div
              className={`flex-1 flex flex-col min-h-0 ${
                isFullscreen ? "h-[calc(100vh-300px)]" : "h-96"
              }`}
            >
              <div className="flex-1 flex">
                <div className="flex-1 flex flex-col">
                  {/* Code Editor */}
                  <div className="flex-1 relative">
                    <Editor
                      height="30rem"
                      language={language}
                      value={
                        mode === "edit"
                          ? code
                          : audioPlayback?.currentCode || ""
                      }
                      onChange={
                        mode === "edit"
                          ? handleCodeChange
                          : audioPlayback?.handleCodeChange
                      }
                      onMount={
                        mode === "edit"
                          ? handleEditorDidMount
                          : audioPlayback?.handleEditorDidMount
                      }
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: isFullscreen ? 16 : 14,
                        lineNumbers: "on",
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 },
                        wordWrap: "on",
                        wordWrapColumn: 80,
                        wrappingIndent: "indent",
                        readOnly:
                          mode === "playback"
                            ? audioPlayback?.isPlaying
                            : false,
                        fontFamily:
                          "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                      }}
                    />

                    {/* Progress Bar (only in playback mode) */}
                    {mode === "playback" && audioPlayback && (
                      <div
                        data-progress-bar
                        className="absolute bottom-0 left-0 right-0 h-1 bg-border/50 cursor-pointer group hover:h-3 transition-all duration-200 z-10"
                        onMouseDown={audioPlayback.handleProgressMouseDown}
                        onMouseMove={(e) => {
                          if (!audioPlayback.isDragging) {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const hoverX = e.clientX - rect.left;
                            const percentage = (hoverX / rect.width) * 100;
                            const hoverTime =
                              (percentage / 100) * audioPlayback.duration;
                            e.currentTarget.title = `Seek to ${audioPlayback.formatTime(
                              hoverTime
                            )}`;
                          }
                        }}
                      >
                        {/* Progress Fill */}
                        <div
                          className="h-full bg-primary relative"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, audioPlayback.progressWidth)
                            )}%`,
                            transition: "none",
                          }}
                        >
                          {/* Progress Handle */}
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mr-1.5 shadow-lg border-2 border-background" />
                        </div>

                        {/* Time indicators */}
                        <div className="absolute -top-8 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-black/90 text-white px-2 py-1 rounded pointer-events-none">
                          {audioPlayback.formatTime(
                            audioPlayback.currentTime /
                              audioPlayback.playbackRate
                          )}
                        </div>
                        <div className="absolute -top-8 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-black/90 text-white px-2 py-1 rounded pointer-events-none">
                          {isFinite(audioPlayback.duration)
                            ? audioPlayback.formatTime(
                                audioPlayback.duration /
                                  audioPlayback.playbackRate
                              )
                            : "--:--"}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Controls (only in playback mode) */}
                  {mode !== "playback" && (
                    <div className="p-6">
                      <Button>Run Code</Button>
                    </div>
                  )}
                  {mode === "playback" && audioPlayback && (
                    <div className="p-4 bg-muted/20 border-t">
                      <div className="flex justify-between items-center">
                        {/* Left: Reset */}
                        <Button
                          onClick={() => audioPlayback.seekTo(0)}
                          variant="outline"
                          size="sm"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reset
                        </Button>

                        {/* Center: Skip Back, Play/Pause, Skip Forward */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={audioPlayback.skipBackward}
                            className="h-12 w-12 p-0 rounded-full"
                          >
                            <SkipBack className="h-5 w-5" />
                          </Button>

                          <Button
                            onClick={audioPlayback.togglePlayPause}
                            size="lg"
                            className="h-14 w-14 p-0 rounded-full shadow-lg"
                            disabled={
                              !isFinite(audioPlayback.duration) ||
                              audioPlayback.duration <= 0
                            }
                          >
                            {audioPlayback.isPlaying ? (
                              <Pause className="h-7 w-7" />
                            ) : (
                              <Play className="h-7 w-7 ml-0.5" />
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="lg"
                            onClick={audioPlayback.skipForward}
                            className="h-12 w-12 p-0 rounded-full"
                          >
                            <SkipForward className="h-5 w-5" />
                          </Button>
                        </div>

                        {/* Right: Speed */}
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={audioPlayback.togglePlaybackSpeed}
                            variant="outline"
                            size="sm"
                            className="font-mono w-[75px] flex-shrink-0 justify-between"
                          >
                            <Gauge className="h-4 w-4" />
                            <span>{audioPlayback.playbackRate}x</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export type { CodeEvent, AudioRecording };
