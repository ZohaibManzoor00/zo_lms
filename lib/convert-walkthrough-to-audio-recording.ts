import { AdminWalkthroughType } from "@/app/data/admin/admin-get-walkthroughs";
import { AudioRecording, CodeEvent } from "@/components/audio-code-walkthrough";

export function convertWalkthroughToAudioRecording(
  walkthrough: AdminWalkthroughType[0],
  audioUrl: string
): AudioRecording {
  // Convert database steps to CodeEvents
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

  // Create a mock audio blob from the URL (we'll use the URL directly in the hook)
  const mockAudioBlob = new Blob([], { type: "audio/webm" });

  return {
    id: walkthrough.name, // Use name as display ID
    audioBlob: mockAudioBlob, // This won't be used since we have the URL
    duration,
    codeEvents,
    initialCode,
    finalCode,
    createdAt: new Date(walkthrough.createdAt),
    language: "python", // Default language
    // Add custom property for the URL
    audioUrl,
  } as AudioRecording & { audioUrl: string };
}
