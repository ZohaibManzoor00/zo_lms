"use client";

import { useState } from "react";
import {
  AudioRecorder,
  AudioPlayback,
  SaveRecordingDialog,
  CodeEvent,
  AudioRecording,
} from "@/components/audio-code-walkthrough";
import { saveTestRecording } from "./actions";
import { Button } from "@/components/ui/button";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function TestRecordingPage() {
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [selectedRecording, setSelectedRecording] =
    useState<AudioRecording | null>(null);
  const [recordingToSave, setRecordingToSave] = useState<AudioRecording | null>(
    null
  );
  const [savedRecordings, setSavedRecordings] = useState<Set<string>>(
    new Set()
  );

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

  const handleSaveRecording = async (
    recording: AudioRecording,
    name: string,
    description?: string
  ) => {
    // Convert blob to base64 on client-side
    const audioBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(recording.audioBlob);
    });

    const response = await saveTestRecording({
      name,
      description,
      language: recording.language,
      audioBase64,
      audioMimeType: recording.audioBlob.type,
      duration: recording.duration,
      codeEvents: recording.codeEvents,
      initialCode: recording.initialCode,
      finalCode: recording.finalCode,
    });

    if (response.status === "error") {
      throw new Error(response.message);
    }

    setSavedRecordings((prev) => new Set([...prev, recording.id]));
  };

  const handleDeleteRecording = (recordingId: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== recordingId));
    if (selectedRecording?.id === recordingId) {
      setSelectedRecording(null);
    }
    toast.success("Recording deleted");
  };

  return (
    <div className="">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Test Recording Studio</h1>
          <p className="text-muted-foreground">
            Create recordings, test them, and save the ones you want to keep
          </p>
        </div>

        {/* Audio Recorder */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Record New Walkthrough</h2>
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
        </div>

        {/* Recordings List */}
        {recordings.length > 0 && (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Test Recordings</h2>
            <div className="space-y-2">
              {recordings.map((recording, index) => (
                <div
                  key={recording.id}
                  className={`flex items-center justify-between p-3 rounded border transition-colors ${
                    selectedRecording?.id === recording.id
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedRecording(recording)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="font-medium">Recording {index + 1}</div>
                      {savedRecordings.has(recording.id) && (
                        <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Saved
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {recording.createdAt.toLocaleTimeString()} •{" "}
                      {Math.round(recording.duration / 1000)}s •{" "}
                      {recording.codeEvents.length} events •{" "}
                      {(recording.audioBlob.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRecordingToSave(recording)}
                      disabled={savedRecordings.has(recording.id)}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {savedRecordings.has(recording.id) ? "Saved" : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteRecording(recording.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio Playback */}
        {selectedRecording && (
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Playback</h2>
              <Button
                variant="outline"
                onClick={() => setRecordingToSave(selectedRecording)}
                disabled={savedRecordings.has(selectedRecording.id)}
              >
                <Save className="h-4 w-4 mr-2" />
                {savedRecordings.has(selectedRecording.id)
                  ? "Saved"
                  : "Save Recording"}
              </Button>
            </div>
            <AudioPlayback recording={selectedRecording} />
          </div>
        )}

        {/* Save Dialog */}
        <SaveRecordingDialog
          recording={recordingToSave!}
          onSave={handleSaveRecording}
          onCancel={() => setRecordingToSave(null)}
          isOpen={!!recordingToSave}
        />
      </div>
    </div>
  );
}
