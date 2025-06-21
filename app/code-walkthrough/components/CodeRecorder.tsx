"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Editor, { Monaco } from "@monaco-editor/react";

// Extend Window interface for our callback
declare global {
  interface Window {
    createSessionAfterAudio?: () => void;
  }
}

export interface CodeEvent {
  timestamp: number;
  type: "keypress" | "delete" | "paste" | "cursor" | "selection";
  data?: string;
  position?: number;
  selection?: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  cursor?: {
    lineNumber: number;
    column: number;
  };
}

export interface AudioEvent {
  timestamp: number;
  type: "start" | "stop" | "pause" | "resume";
}

export interface RecordingSession {
  id: string;
  startTime: number;
  endTime: number;
  codeEvents: CodeEvent[];
  audioEvents: AudioEvent[];
  initialCode: string;
  finalCode: string;
  audioBlob?: Blob;
}

interface CodeRecorderProps {
  onSessionComplete?: (session: RecordingSession) => void;
}

export default function CodeRecorder({ onSessionComplete }: CodeRecorderProps) {
  const [code, setCode] = useState("// Start coding here...\n");
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [codeEvents, setCodeEvents] = useState<CodeEvent[]>([]);
  const [audioEvents, setAudioEvents] = useState<AudioEvent[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const audioBlobRef = useRef<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Capture cursor position changes with throttling
  const handleCursorPositionChanged = useCallback(() => {
    if (!isRecording || !editorRef.current) return;

    const position = editorRef.current.getPosition();
    const newEvent: CodeEvent = {
      timestamp: Date.now(),
      type: "cursor",
      cursor: {
        lineNumber: position.lineNumber,
        column: position.column,
      },
    };

    setCodeEvents((prev) => {
      // Only add cursor event if it's significantly different from the last one
      const lastEvent = prev[prev.length - 1];
      if (lastEvent && lastEvent.type === "cursor" && lastEvent.cursor) {
        const lastPos = lastEvent.cursor;
        const newPos = newEvent.cursor!;
        // Only record if cursor moved more than 1 character or to a different line
        if (
          Math.abs(newPos.column - lastPos.column) <= 1 &&
          newPos.lineNumber === lastPos.lineNumber
        ) {
          return prev;
        }
      }
      return [...prev, newEvent];
    });
  }, [isRecording]);

  // Capture selection changes with throttling
  const handleSelectionChanged = useCallback(() => {
    if (!isRecording || !editorRef.current) return;

    const selection = editorRef.current.getSelection();
    if (!selection) return;

    const newEvent: CodeEvent = {
      timestamp: Date.now(),
      type: "selection",
      selection: {
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn,
      },
    };

    setCodeEvents((prev) => {
      // Only add selection event if it's different from the last one
      const lastEvent = prev[prev.length - 1];
      if (lastEvent && lastEvent.type === "selection" && lastEvent.selection) {
        const lastSel = lastEvent.selection;
        const newSel = newEvent.selection!;
        // Only record if selection actually changed
        if (
          lastSel.startLineNumber === newSel.startLineNumber &&
          lastSel.startColumn === newSel.startColumn &&
          lastSel.endLineNumber === newSel.endLineNumber &&
          lastSel.endColumn === newSel.endColumn
        ) {
          return prev;
        }
      }
      return [...prev, newEvent];
    });
  }, [isRecording]);

  // Handle code changes with more granular tracking
  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;

    // Always update the current code display
    setCode(value);

    // Only record events if we're recording
    if (!isRecording) return;

    const newEvent: CodeEvent = {
      timestamp: Date.now(),
      type: "keypress",
      data: value,
    };

    setCodeEvents((prev) => [...prev, newEvent]);
  };

  // Start audio recording
  const startAudioRecording = async () => {
    try {
      setAudioBlob(null);
      audioBlobRef.current = null;
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("MediaRecorder onstop triggered");
        console.log("chunksRef.current:", chunksRef.current);
        console.log("chunks length:", chunksRef.current.length);

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        console.log("Created blob:", blob);
        console.log("Blob size:", blob.size);
        console.log("Blob type:", blob.type);

        setAudioBlob(blob);
        audioBlobRef.current = blob;

        console.log("Audio blob set in state and ref");

        // Trigger session creation after blob is ready
        if (window.createSessionAfterAudio) {
          window.createSessionAfterAudio();
        }
      };

      mediaRecorder.start();
      setIsAudioRecording(true);

      // Use the session start time as reference for audio events
      const audioStartTime = sessionStartTime || Date.now();
      setAudioEvents((prev) => [
        ...prev,
        { timestamp: audioStartTime, type: "start" },
      ]);
    } catch (error) {
      console.error("Error starting audio recording:", error);
      alert(
        "Failed to start audio recording. Please check microphone permissions."
      );
    }
  };

  // Stop audio recording
  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isAudioRecording) {
      mediaRecorderRef.current.stop();
      setIsAudioRecording(false);
      setAudioEvents((prev) => [
        ...prev,
        { timestamp: Date.now(), type: "stop" },
      ]);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // Start/stop code recording
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setSessionStartTime(0);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        setRecordingTime(0);
      }

      // Stop audio recording if it's still running
      if (isAudioRecording) {
        stopAudioRecording();
      }

      // Wait for audio blob to be created, then create session
      const createSession = () => {
        const finalAudioBlob = audioBlobRef.current || audioBlob;

        console.log("Creating session...");
        console.log("audioBlobRef.current:", audioBlobRef.current);
        console.log("audioBlob state:", audioBlob);
        console.log("finalAudioBlob:", finalAudioBlob);
        console.log(
          "finalAudioBlob instanceof Blob:",
          finalAudioBlob instanceof Blob
        );

        const session: RecordingSession = {
          id: `session-${Date.now()}`,
          startTime: sessionStartTime,
          endTime: Date.now(),
          codeEvents,
          audioEvents,
          initialCode: "// Start coding here...\n",
          finalCode: code,
          audioBlob: finalAudioBlob || undefined,
        };

        console.log("Created session:", session);
        onSessionComplete?.(session);
      };

      // Set up callback for when audio blob is ready
      window.createSessionAfterAudio = createSession;

      // If we already have an audio blob, create session immediately
      if (audioBlobRef.current || audioBlob) {
        createSession();
      } else {
        // Wait for audio blob to be created (increased timeout)
        setTimeout(() => {
          if (!audioBlobRef.current && !audioBlob) {
            console.log(
              "Audio blob not ready after timeout, creating session anyway"
            );
            createSession();
          }
        }, 1000);
      }
    } else {
      // Start recording
      const startTime = Date.now();
      setIsRecording(true);
      setSessionStartTime(startTime);
      setCodeEvents([]);
      setAudioEvents([]);
      setAudioBlob(null);
      audioBlobRef.current = null;
      chunksRef.current = [];

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Start audio recording immediately to ensure perfect synchronization
      startAudioRecording();
    }
  };

  // Set up editor event listeners
  useEffect(() => {
    if (!editorRef.current || !isRecording) return;

    const editor = editorRef.current;

    // Add event listeners for cursor and selection changes
    const cursorDisposable = editor.onDidChangeCursorPosition(
      handleCursorPositionChanged
    );
    const selectionDisposable = editor.onDidChangeCursorSelection(
      handleSelectionChanged
    );

    return () => {
      cursorDisposable.dispose();
      selectionDisposable.dispose();
    };
  }, [isRecording, handleCursorPositionChanged, handleSelectionChanged]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-4 flex-wrap mb-4">
          <button
            onClick={toggleRecording}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isRecording
                ? "bg-red-500 text-white hover:bg-red-600 shadow-lg"
                : "bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl"
            }`}
          >
            {isRecording ? "⏹️ Stop Recording" : "🎬 Start Recording"}
          </button>

          <button
            onClick={
              isAudioRecording ? stopAudioRecording : startAudioRecording
            }
            disabled={!isRecording}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isAudioRecording
                ? "bg-red-500 text-white hover:bg-red-600 shadow-lg"
                : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isAudioRecording ? "🔇 Stop Audio" : "🎤 Start Audio"}
          </button>

          {isRecording && (
            <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700">
                Recording... {formatTime(recordingTime)}
              </span>
              {isAudioRecording && (
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-red-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-700">Audio Active</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        {isRecording && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-700 mb-1">Code Events</div>
              <div className="text-2xl font-bold text-blue-600">
                {codeEvents.length}
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="font-medium text-green-700 mb-1">
                Audio Events
              </div>
              <div className="text-2xl font-bold text-green-600">
                {audioEvents.length}
              </div>
            </div>
          </div>
        )}

        {/* Audio Status */}
        {audioBlob && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">
                ✅ Audio recorded successfully (
                {audioBlob.size > 1024
                  ? `${(audioBlob.size / 1024).toFixed(1)} KB`
                  : `${audioBlob.size} bytes`}
                )
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Monaco Editor */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b">
          <h3 className="font-medium text-gray-700 flex items-center gap-2">
            <span className="text-blue-500">📝</span>
            Code Editor
          </h3>
        </div>
        <div className="h-96">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
              folding: true,
              showFoldingControls: "always",
            }}
          />
        </div>
      </div>

      {/* Events Log */}
      {isRecording && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <h3 className="font-medium text-gray-700 flex items-center gap-2">
              <span className="text-purple-500">📊</span>
              Live Events Log
            </h3>
          </div>
          <div className="p-4 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {[...codeEvents, ...audioEvents]
                .sort((a, b) => a.timestamp - b.timestamp)
                .slice(-20) // Show last 20 events
                .map((event, index) => (
                  <div
                    key={index}
                    className={`text-sm p-3 rounded-lg border ${
                      "data" in event
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : "bg-green-50 text-green-800 border-green-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs opacity-75">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-xs font-medium">
                        {"data" in event ? "Code" : "Audio"}: {event.type}
                      </span>
                    </div>
                    {event.cursor && (
                      <div className="text-xs opacity-75 mt-1">
                        Cursor: Line {event.cursor.lineNumber}, Column{" "}
                        {event.cursor.column}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
