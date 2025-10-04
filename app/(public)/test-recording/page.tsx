"use client";

import { useState } from "react";
import { AudioRecorder } from "./components/audio-recorder";
import { AudioPlayback } from "./components";

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

export default function TestRecordingPage() {
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [selectedRecording, setSelectedRecording] =
    useState<AudioRecording | null>(null);

  const handleRecordingComplete = (
    audioBlob: Blob,
    duration: number,
    codeEvents: CodeEvent[],
    initialCode: string,
    finalCode: string
  ) => {
    const newRecording: AudioRecording = {
      id: `recording-${Date.now()}`,
      audioBlob,
      duration,
      codeEvents,
      initialCode,
      finalCode,
      createdAt: new Date(),
      language: "python", // Default to python since that's what the editor uses
    };

    setRecordings((prev) => [newRecording, ...prev]);
    setSelectedRecording(newRecording);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Audio Recording Test</h1>
          <p className="text-muted-foreground">
            Testing clean MediaRecorder API implementation
          </p>
        </div>

        {/* Audio Recorder */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Record Audio</h2>
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
        </div>

        {/* Recordings List */}
        {recordings.length > 0 && (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Recordings</h2>
            <div className="space-y-2">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${
                    selectedRecording?.id === recording.id
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                  onClick={() => setSelectedRecording(recording)}
                >
                  <div>
                    <div className="font-medium">
                      Recording {recordings.indexOf(recording) + 1}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {recording.createdAt.toLocaleTimeString()} •{" "}
                      {Math.round(recording.duration / 1000)}s •{" "}
                      {recording.codeEvents.length} events
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {(recording.audioBlob.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio Playback */}
        {selectedRecording && (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Playback</h2>
            <AudioPlayback recording={selectedRecording} />
          </div>
        )}
      </div>
    </div>
  );
}
