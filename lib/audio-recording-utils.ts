import type {
  AudioCodeSession,
  CodeEvent,
} from "@/hooks/use-audio-code-recorder";
import { adminCreateWalkthrough } from "@/app/data/admin/admin-create-walkthrough";
import type { AdminWalkthroughType } from "@/app/data/admin/admin-get-walkthroughs";

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

export async function convertSessionToWalkthroughFormat(
  session: AudioCodeSession,
  name: string,
  description?: string
): Promise<Parameters<typeof adminCreateWalkthrough>[0]> {
  const audioBase64 = await blobToBase64(session.audioBlob);

  // Convert code events to walkthrough steps format
  const steps = session.codeEvents.map((event) => ({
    code: event.data || "",
    timestamp: event.timestamp / 1000, // Convert milliseconds to seconds
  }));

  // Determine audio file extension based on MIME type
  const mimeType = session.audioBlob.type;
  let extension = "webm";
  if (mimeType.includes("mp4")) extension = "mp4";
  else if (mimeType.includes("wav")) extension = "wav";
  else if (mimeType.includes("mp3")) extension = "mp3";

  return {
    name,
    description,
    steps,
    audioBase64,
    audioMimeType: mimeType,
    audioFileName: `${name.replace(/[^a-zA-Z0-9]/g, "_")}.${extension}`,
  };
}

export function convertWalkthroughToSession(
  walkthrough: AdminWalkthroughType[0],
  audioUrl: string
): AudioCodeSession {
  // Convert walkthrough steps to code events
  const codeEvents: CodeEvent[] = walkthrough.steps.map((step) => ({
    timestamp: step.timestamp * 1000, // Convert seconds to milliseconds
    type: "keypress" as const,
    data: step.code,
  }));

  // Sort events by timestamp to ensure proper order
  codeEvents.sort((a, b) => a.timestamp - b.timestamp);

  // Get initial and final code
  const initialCode = codeEvents.length > 0 ? codeEvents[0].data : "";
  const finalCode =
    codeEvents.length > 0
      ? codeEvents[codeEvents.length - 1].data
      : initialCode;

  // Calculate duration from the last event timestamp
  const duration =
    codeEvents.length > 0
      ? Math.max(codeEvents[codeEvents.length - 1].timestamp, 1000)
      : 5000;

  // Create a mock audio blob from the URL (this will be handled by the playback component)
  const mockAudioBlob = new Blob([], { type: "audio/webm" });

  return {
    id: walkthrough.id,
    startTime: 0,
    endTime: duration,
    codeEvents,
    initialCode,
    finalCode,
    audioBlob: mockAudioBlob, // This won't be used since we have the URL
    duration,
    audioUrl, // Add this custom property for the URL
  } as AudioCodeSession & { audioUrl: string };
}
