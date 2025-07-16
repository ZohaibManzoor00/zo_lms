"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { adminCreateWalkthrough } from "@/app/data/admin/admin-create-walkthrough";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface Step {
  code: string;
  timestamp: number;
}

export default function WalkthroughRecorderPage() {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [code, setCode] = useState<string>(
    "// Start coding your walkthrough here\n"
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const editorRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStart = async () => {
    audioChunksRef.current = [];
    setSteps([]);
    setAudioUrl(null);
    setRecording(true);
    setPaused(false);
    setStartTime(Date.now());
    setPreviewing(false);
    // @ts-ignore
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new window.MediaRecorder(stream);
    setMediaRecorder(recorder);
    recorder.start();
    recorder.ondataavailable = (e: BlobEvent) => {
      audioChunksRef.current.push(e.data);
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
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioUrl(URL.createObjectURL(audioBlob));
        setPreviewing(true);
        audioChunksRef.current = [];
      };
      mediaRecorder.stop();
      setRecording(false);
      setPaused(false);
      setStartTime(null);
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

  const handleSave = async () => {
    if (!audioUrl || !name.trim()) {
      alert("Please provide a name and record audio.");
      return;
    }
    setSaving(true);
    try {
      const audioBlob = await fetch(audioUrl).then((r) => r.blob());
      const arrayBuffer = await audioBlob.arrayBuffer();
      // @ts-ignore
      const audioBuffer = Buffer.from(arrayBuffer);
      const audioMimeType = audioBlob.type;
      const audioFileName = `walkthrough.webm`;
      const stepsToSend = steps.map((s) => ({
        code: s.code,
        timestamp: s.timestamp,
      }));
      const result = await adminCreateWalkthrough({
        name,
        description,
        steps: stepsToSend,
        audioBuffer,
        audioMimeType,
        audioFileName,
      });
      alert("Walkthrough saved! ID: " + result.id);
      // Reset state after save
      setAudioUrl(null);
      setSteps([]);
      setCode("// Start coding your walkthrough here\n");
      setName("");
      setDescription("");
      setPreviewing(false);
    } catch (err: any) {
      alert("Failed to save: " + (err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setAudioUrl(null);
    setSteps([]);
    setCode("// Start coding your walkthrough here\n");
    setName("");
    setDescription("");
    setPreviewing(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Record Code Walkthrough</h1>
      {!previewing ? (
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
            <Button onClick={handleStart} disabled={recording || saving}>
              Start
            </Button>
            <Button
              onClick={handlePause}
              disabled={!recording || paused || saving}
            >
              Pause
            </Button>
            <Button
              onClick={handleResume}
              disabled={!recording || !paused || saving}
            >
              Resume
            </Button>
            <Button onClick={handleStop} disabled={!recording || saving}>
              Stop
            </Button>
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
        </>
      ) : (
        <>
          {audioUrl && (
            <div className="mb-4">
              <audio controls src={audioUrl} style={{ width: "100%" }} />
            </div>
          )}
          <div className="mb-4 h-96 border rounded">
            <MonacoEditor
              height="100%"
              defaultLanguage="python"
              value={steps.length > 0 ? steps[steps.length - 1].code : code}
              options={{ readOnly: true, minimap: { enabled: false } }}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              Save
            </Button>
            <Button
              onClick={handleDiscard}
              variant="destructive"
              disabled={saving}
            >
              Discard
            </Button>
          </div>
        </>
      )}
      {!previewing && (
        <div>
          <h2 className="font-semibold mb-2">Steps ({steps.length})</h2>
          <ol className="list-decimal pl-6">
            {steps.map((step, i) => (
              <li key={i} className="mb-1 text-xs">
                t={step.timestamp.toFixed(2)}s, code: {step.code.slice(0, 30)}
                {step.code.length > 30 ? "..." : ""}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
