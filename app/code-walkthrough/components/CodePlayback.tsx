"use client";

import { useState, useRef, useEffect } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { RecordingSession, CodeEvent, AudioEvent } from "./CodeRecorder";

interface CodePlaybackProps {
  session: RecordingSession;
}

export default function CodePlayback({ session }: CodePlaybackProps) {
  const [currentCode, setCurrentCode] = useState(session.initialCode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [originalCode, setOriginalCode] = useState(session.finalCode);
  const [userEditedCode, setUserEditedCode] = useState(session.finalCode);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentEventIndexRef = useRef(0);

  // Create audio URL from blob
  useEffect(() => {
    if (session.audioBlob) {
      console.log("Processing audioBlob:", session.audioBlob);

      // Handle both Blob objects and serialized blob data
      let blob: Blob;

      if (session.audioBlob instanceof Blob) {
        // It's already a Blob object
        console.log("AudioBlob is already a Blob");
        blob = session.audioBlob;
      } else if (
        session.audioBlob &&
        typeof session.audioBlob === "object" &&
        "data" in session.audioBlob
      ) {
        // It's serialized blob data - reconstruct the Blob
        console.log("Reconstructing Blob from serialized data");
        const { data, type } = session.audioBlob as any;
        console.log("Blob data length:", data?.length, "type:", type);

        if (!data || !Array.isArray(data)) {
          console.error("Invalid blob data format");
          return;
        }

        const uint8Array = new Uint8Array(data);
        blob = new Blob([uint8Array], { type: type || "audio/webm" });
        console.log("Reconstructed blob size:", blob.size, "type:", blob.type);
      } else {
        console.warn("Invalid audioBlob format:", session.audioBlob);
        return;
      }

      try {
        const url = URL.createObjectURL(blob);
        console.log("Created audio URL:", url);
        setAudioUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error("Error creating audio URL:", error);
      }
    } else {
      console.log("No audioBlob found in session");
    }
  }, [session.audioBlob]);

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

    setIsPlaying(true);

    // Don't reset if we're resuming from a pause
    if (currentEventIndexRef.current === 0) {
      currentEventIndexRef.current = 0;
      setCurrentCode(session.initialCode);

      // Reset editor position
      if (editorRef.current) {
        editorRef.current.setPosition({ lineNumber: 1, column: 1 });
      }
    }

    // Start audio if available
    if (audioRef.current && audioUrl) {
      console.log("Starting audio playback, URL:", audioUrl);
      console.log("Audio element:", audioRef.current);

      audioRef.current
        .play()
        .then(() => {
          console.log("Audio playback started successfully");
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
          // Continue playback even if audio fails
        });
    } else {
      console.log(
        "Audio not available - audioRef:",
        !!audioRef.current,
        "audioUrl:",
        !!audioUrl
      );
    }

    // Start playback timer with higher precision
    const startTime = Date.now() - currentTime / playbackSpeed;
    playbackTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) * playbackSpeed;
      setCurrentTime(elapsed);

      // Process events that should have occurred by now
      const sessionStartTime = session.startTime;
      const allEvents = [...session.codeEvents, ...session.audioEvents].sort(
        (a, b) => a.timestamp - b.timestamp
      );

      // Process all events that should have occurred
      while (
        currentEventIndexRef.current < allEvents.length &&
        allEvents[currentEventIndexRef.current].timestamp - sessionStartTime <=
          elapsed
      ) {
        const event = allEvents[currentEventIndexRef.current];
        processEvent(event);
        currentEventIndexRef.current++;
      }

      // Check if playback is complete
      if (currentEventIndexRef.current >= allEvents.length) {
        stopPlayback();
      }
    }, 8); // Higher frequency for better sync (120fps)
  };

  // Stop playback
  const stopPlayback = () => {
    setIsPlaying(false);

    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setCurrentTime(0);
    currentEventIndexRef.current = 0;
    setCurrentCode(session.initialCode);

    // Reset editor position
    if (editorRef.current) {
      editorRef.current.setPosition({ lineNumber: 1, column: 1 });
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
      // Exit interactive mode - restore original code and resume playback
      setIsInteractiveMode(false);
      setCurrentCode(userEditedCode); // Keep user's edits for now

      // Resume playback from where we left off
      startPlayback();
    } else {
      // Enter interactive mode - pause playback and save current state
      setIsInteractiveMode(true);
      setUserEditedCode(currentCode);
      pausePlayback();
    }
  };

  // Resume playback with original code
  const resumeWithOriginalCode = () => {
    setIsInteractiveMode(false);
    setCurrentCode(originalCode);

    // Resume playback from where we left off
    startPlayback();
  };

  // Process individual events
  const processEvent = (event: CodeEvent | AudioEvent) => {
    if ("data" in event) {
      // Code event
      if (event.type === "keypress" && event.data) {
        setCurrentCode(event.data);
      } else if (event.type === "cursor" && event.cursor && editorRef.current) {
        // Move cursor to position
        editorRef.current.setPosition({
          lineNumber: event.cursor.lineNumber,
          column: event.cursor.column,
        });
      } else if (
        event.type === "selection" &&
        event.selection &&
        editorRef.current
      ) {
        // Set selection
        editorRef.current.setSelection({
          startLineNumber: event.selection.startLineNumber,
          startColumn: event.selection.startColumn,
          endLineNumber: event.selection.endLineNumber,
          endColumn: event.selection.endColumn,
        });
      }
    } else {
      // Audio event - these are handled by the audio element
      // but we can log them for debugging
      console.log("Audio event:", event.type, "at", event.timestamp);
    }
  };

  // Seek to specific time with optimized processing
  const seekTo = (time: number) => {
    if (isPlaying) {
      pausePlayback();
    }

    setCurrentTime(time);
    currentEventIndexRef.current = 0;
    setCurrentCode(session.initialCode);

    // Process all events up to the seek time efficiently
    const sessionStartTime = session.startTime;
    const allEvents = [...session.codeEvents, ...session.audioEvents].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    // Use a more efficient loop for seeking
    for (let i = 0; i < allEvents.length; i++) {
      const event = allEvents[i];
      if (event.timestamp - sessionStartTime <= time) {
        processEvent(event);
        currentEventIndexRef.current = i + 1;
      } else {
        break;
      }
    }

    // Update audio position if available
    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = time / 1000; // Convert to seconds
    }
  };

  // Format time for display
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate total duration
  const totalDuration = session.endTime - session.startTime;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Playback Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-4 flex-wrap mb-4">
          <button
            onClick={isPlaying ? pausePlayback : startPlayback}
            className="px-6 py-3 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isPlaying ? "⏸️ Pause" : "▶️ Play"}
          </button>

          <button
            onClick={stopPlayback}
            className="px-6 py-3 rounded-lg font-medium bg-gray-500 text-white hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            ⏹️ Stop
          </button>

          <button
            onClick={toggleInteractiveMode}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isInteractiveMode
                ? "bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg"
                : "bg-purple-500 text-white hover:bg-purple-600 shadow-lg hover:shadow-xl"
            }`}
          >
            {isInteractiveMode ? "✏️ Keep Edits" : "✏️ Edit Mode"}
          </button>

          {isInteractiveMode && (
            <button
              onClick={resumeWithOriginalCode}
              className="px-6 py-3 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ▶️ Resume Original
            </button>
          )}

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Speed:</label>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>

          <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <input
            type="range"
            min="0"
            max={totalDuration}
            value={currentTime}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                (currentTime / totalDuration) * 100
              }%, #e5e7eb ${
                (currentTime / totalDuration) * 100
              }%, #e5e7eb 100%)`,
            }}
          />
        </div>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-green-500">🎵</span>
            Audio Playback
          </h3>
          <audio
            ref={audioRef}
            controls
            className="w-full"
            src={audioUrl}
            onError={(e) => console.error("Audio playback error:", e)}
            onLoadStart={() => console.log("Audio loading started")}
            onCanPlay={() => console.log("Audio can play")}
            onPlay={() => console.log("Audio play event")}
            onPause={() => console.log("Audio pause event")}
          />
          <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <span className="font-medium">Audio file:</span>{" "}
            {session.audioBlob && "size" in session.audioBlob
              ? session.audioBlob.size > 1024
                ? `${(session.audioBlob.size / 1024).toFixed(1)} KB`
                : `${session.audioBlob.size} bytes`
              : "Audio available"}
          </div>
        </div>
      )}

      {/* Code Editor */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b">
          <h3 className="font-medium text-gray-700 flex items-center gap-2">
            <span className="text-blue-500">📝</span>
            Code Playback
            {isInteractiveMode && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                ✏️ Interactive Mode
              </span>
            )}
          </h3>
        </div>
        <div className="h-96">
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
              readOnly: !isInteractiveMode, // Only editable in interactive mode
              wordWrap: "on",
              folding: true,
              showFoldingControls: "always",
            }}
          />
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
          <span className="text-purple-500">📊</span>
          Session Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <span className="font-medium text-blue-700">Duration:</span>
            <div className="text-lg font-bold text-blue-600">
              {formatTime(totalDuration)}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <span className="font-medium text-green-700">Code Events:</span>
            <div className="text-lg font-bold text-green-600">
              {session.codeEvents.length}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <span className="font-medium text-purple-700">Audio Events:</span>
            <div className="text-lg font-bold text-purple-600">
              {session.audioEvents.length}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <span className="font-medium text-gray-700">Session ID:</span>
            <div className="text-sm font-mono text-gray-600">{session.id}</div>
          </div>
          {session.audioBlob && (
            <div className="col-span-2 bg-green-50 p-4 rounded-lg border border-green-200">
              <span className="font-medium text-green-700">Audio:</span>
              <div className="text-sm text-green-600">
                ✅ Available (
                {session.audioBlob && "size" in session.audioBlob
                  ? session.audioBlob.size > 1024
                    ? `${(session.audioBlob.size / 1024).toFixed(1)} KB`
                    : `${session.audioBlob.size} bytes`
                  : "Serialized data"}
                )
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Audio URL: {audioUrl ? "✅ Set" : "❌ Not set"}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Mode Instructions */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-purple-500 text-lg">💡</div>
            <div>
              <h4 className="font-medium text-purple-700 mb-1">
                Interactive Mode
              </h4>
              <p className="text-sm text-purple-600">
                {isInteractiveMode
                  ? "You're in edit mode! Make changes to the code, then click 'Keep Edits' to continue with your changes or 'Resume Original' to restore the recorded code."
                  : "Click 'Edit Mode' to pause playback and make changes to the code. You can then choose to keep your edits or resume with the original recording."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
