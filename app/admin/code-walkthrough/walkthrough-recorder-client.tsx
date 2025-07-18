"use client";

import React, { useState } from "react";
import {
  CodeRecorder,
  RecordingSession,
} from "../../../components/code-walkthrough/code-recorder";
import { Button } from "@/components/ui/button";
import CodePlayback from "@/components/code-walkthrough/code-playback";
import { adminCreateWalkthrough } from "@/app/data/admin/admin-create-walkthrough";

interface WalkthroughRecorderClientProps {
  saveWalkthrough: (
    data: Parameters<typeof adminCreateWalkthrough>[0]
  ) => Promise<Awaited<ReturnType<typeof adminCreateWalkthrough>>>;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function WalkthroughRecorderClient({
  saveWalkthrough,
}: WalkthroughRecorderClientProps) {
  const [session, setSession] = useState<RecordingSession | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSessionComplete = (s: RecordingSession) => {
    setSession(s);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    if (!session || !name.trim()) {
      setError("Please provide a name and record a session.");
      return;
    }

    setSaving(true);
    try {
      if (!session.audioBlob) {
        setError("No audio recorded");
        return;
      }

      const audioBase64 = await blobToBase64(session.audioBlob);
      const stepsToSend = session.codeEvents.map((e) => ({
        code: e.data || "",
        timestamp: (e.timestamp - session.startTime) / 1000,
      }));

      const result = await saveWalkthrough({
        name,
        description,
        steps: stepsToSend,
        audioBase64,
        audioMimeType: session.audioBlob.type,
        audioFileName: `${name}.webm`,
      });
      setSuccess("Walkthrough saved! ID: " + result.id);
      setSession(null);
      setName("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setSession(null);
    setName("");
    setDescription("");
    setError(null);
    setSuccess(null);
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Record Code Walkthrough</h1>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}
      {!session ? (
        <CodeRecorder onSessionComplete={handleSessionComplete} />
      ) : (
        <>
          <div className="mb-4 flex gap-2">
            <input
              className="border rounded px-2 py-1 text-sm"
              placeholder="Walkthrough name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
            <input
              className="border rounded px-2 py-1 text-sm"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={handleDiscard}
              variant="destructive"
              disabled={saving}
            >
              Discard
            </Button>
          </div>
          <CodePlayback session={session} />
        </>
      )}
    </>
  );
}
