"use server";

import { adminSaveTestRecording } from "@/app/data/admin/admin-save-test-recording";
import { ApiResponse } from "@/lib/types";
import { tryCatch } from "@/hooks/try-catch";

interface SaveTestRecordingInput {
  name: string;
  description?: string;
  language?: string;
  audioBase64: string;
  audioMimeType: string;
  duration: number;
  codeEvents: Array<{
    timestamp: number;
    type: "keypress" | "delete" | "paste";
    data: string;
    position?: number;
  }>;
  initialCode: string;
  finalCode: string;
}

export async function saveTestRecording(
  input: SaveTestRecordingInput
): Promise<ApiResponse> {
  const { error, data } = await tryCatch(
    (async () => {
      const result = await adminSaveTestRecording({
        name: input.name,
        description: input.description,
        language: input.language,
        audioBase64: input.audioBase64,
        audioMimeType: input.audioMimeType,
        duration: input.duration,
        codeEvents: input.codeEvents,
        initialCode: input.initialCode,
        finalCode: input.finalCode,
      });

      return result;
    })()
  );

  if (error) {
    return {
      status: "error",
      message: error.message || "Failed to save recording",
    };
  }

  return {
    status: "success",
    message: "Recording saved successfully",
    data,
  };
}
