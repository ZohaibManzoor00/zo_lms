import { AdminWalkthroughType } from "@/app/data/admin/admin-get-walkthroughs";
import { RecordingSession } from "@/components/code-walkthrough/code-recorder";

export const buildRecordingSession = (
  walkthrough: AdminWalkthroughType[0],
  getAudioUrl: (key: string) => string
): RecordingSession => {
  const steps = walkthrough.steps || [];

  if (steps.length === 0) {
    return {
      id: walkthrough.id,
      startTime: 0,
      endTime: 0,
      codeEvents: [],
      audioEvents: [],
      initialCode: "",
      finalCode: "",
      audioUrl: walkthrough.audioKey
        ? getAudioUrl(walkthrough.audioKey)
        : undefined,
      audioBlob: undefined,
    };
  }

  // Convert timestamps from seconds back to milliseconds and create proper session timing
  const startTime = 0;
  const endTime = steps[steps.length - 1].timestamp * 1000;

  const codeEvents = steps.map((step) => ({
    timestamp: step.timestamp * 1000, // Convert seconds back to milliseconds
    type: "keypress" as const,
    data: step.code,
  }));

  return {
    id: walkthrough.id,
    startTime,
    endTime,
    codeEvents,
    audioEvents: [],
    initialCode: steps[0].code || "",
    finalCode: steps[steps.length - 1].code || "",
    audioUrl: walkthrough.audioKey
      ? getAudioUrl(walkthrough.audioKey)
      : undefined,
    audioBlob: undefined,
  };
};
