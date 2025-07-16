"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { adminCreateWalkthrough } from "@/app/data/admin/admin-create-walkthrough";
import { z } from "zod";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Step {
  code: string;
  timestamp: number;
}

export default function WalkthroughRecorderPage() {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [code, setCode] = useState<string>("// Start coding your walkthrough here\n");
  const editorRef = useRef<any>(null);

  const handleStart = async () => {
    setAudioChunks([]);
    setSteps([]);
    setAudioUrl(null);
    setRecording(true);
    setPaused(false);
    setStartTime(Date.now());
    // @ts-ignore
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new window.MediaRecorder(stream);
    setMediaRecorder(recorder);
    recorder.start();
    recorder.ondataavailable = (e: BlobEvent) => {
      setAudioChunks((prev) => [...prev, e.data]);
    };
    setSteps([{ code, timestamp: 0 }]);
  };

  const handlePause = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      setPaused(true);
    }
  };

  const handleResume = () => {
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      setPaused(false);
    }
  };

  const handleStop = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      setPaused(false);
      setStartTime(null);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(audioBlob));
      };
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!recording || paused || !startTime) {
      setCode(value || "");
      return;
    }
    const now = Date.now();
    setCode(value || "");
    setSteps((prev) => [
      ...prev,
      { code: value || "", timestamp: (now - startTime) / 1000 },
    ]);
  };

  const handleSave = () => {
    alert("Save not implemented yet. Steps: " + steps.length);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Record Code Walkthrough</h1>
      <div className="mb-4 flex gap-2">
        <Button onClick={handleStart} disabled={recording}>Start</Button>
        <Button onClick={handlePause} disabled={!recording || paused}>Pause</Button>
        <Button onClick={handleResume} disabled={!recording || !paused}>Resume</Button>
        <Button onClick={handleStop} disabled={!recording}>Stop</Button>
        <Button onClick={handleSave} disabled={recording || !audioUrl}>Save</Button>
      </div>
      <div className="mb-4 h-96 border rounded">
        <MonacoEditor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={handleCodeChange}
          options={{
            readOnly: recording && paused,
            minimap: { enabled: false },
          }}
          onMount={(editor) => (editorRef.current = editor)}
        />
      </div>
      {audioUrl && (
        <div className="mb-4">
          <audio controls src={audioUrl} />
        </div>
      )}
      <div>
        <h2 className="font-semibold mb-2">Steps ({steps.length})</h2>
        <ol className="list-decimal pl-6">
          {steps.map((step, i) => (
            <li key={i} className="mb-1 text-xs">
              t={step.timestamp.toFixed(2)}s, code: {step.code.slice(0, 30)}{step.code.length > 30 ? "..." : ""}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
