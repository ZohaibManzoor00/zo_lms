"use client";

import React, { useState, useCallback } from "react";
import { AudioCodeRecorder } from "@/components/audio-code-recorder/audio-code-recorder";
import type { AudioCodeSession } from "@/hooks/use-audio-code-recorder";
import { convertSessionToWalkthroughFormat } from "@/lib/audio-recording-utils";
import { adminCreateWalkthrough } from "@/app/data/admin/admin-create-walkthrough";

interface NewWalkthroughRecorderClientProps {
  saveWalkthrough: (
    data: Parameters<typeof adminCreateWalkthrough>[0]
  ) => Promise<Awaited<ReturnType<typeof adminCreateWalkthrough>>>;
}

export function NewWalkthroughRecorderClient({
  saveWalkthrough,
}: NewWalkthroughRecorderClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSessionComplete = useCallback((session: AudioCodeSession) => {
    console.log("Session completed:", session);
    setError(null);
    setSuccess(null);
  }, []);

  const handleSessionSaved = useCallback(
    async (session: AudioCodeSession, name: string, description?: string) => {
      setError(null);
      setSuccess(null);

      try {
        const walkthroughData = await convertSessionToWalkthroughFormat(
          session,
          name,
          description
        );

        const result = await saveWalkthrough(walkthroughData);
        setSuccess(`Walkthrough saved successfully! ID: ${result.id}`);
        return result.id;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        throw err;
      }
    },
    [saveWalkthrough]
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Record Code Walkthrough</h1>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md dark:bg-green-900/20 dark:border-green-800">
          {success}
        </div>
      )}

      <AudioCodeRecorder
        onSessionComplete={handleSessionComplete}
        onSessionSaved={handleSessionSaved}
        initialCode="// Start coding your walkthrough here...\n"
        showSaveForm={true}
      />
    </div>
  );
}
