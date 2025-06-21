"use client";

import { useState } from "react";
import { RecordingSession } from "./CodeRecorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, CheckCircle, XCircle, Loader } from "lucide-react";

interface SessionUploadProps {
  session: RecordingSession;
  onUploadComplete?: (sessionId: string) => void;
}

export default function SessionUpload({
  session,
  onUploadComplete,
}: SessionUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [metadata, setMetadata] = useState({
    title: "",
    description: "",
    courseId: "",
    chapterId: "",
    lessonId: "",
    instructorId: "zdNe4AAaPGkV4L3HxLsfPBJpQH6pCPuj", // Default instructor ID
  });

  const handleUpload = async () => {
    if (
      !metadata.title ||
      !metadata.courseId ||
      !metadata.chapterId ||
      !metadata.lessonId
    ) {
      setUploadStatus("Please fill in all required fields");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Starting upload...");

    try {
      let audioFileKey: string | null = null;
      let audioContentType: string | null = null;
      let audioSize: number | null = null;

      if (session.audioBlob && session.audioBlob instanceof Blob) {
        try {
          setUploadStatus("Getting audio presigned URL...");
          const presignedResponse = await fetch("/api/s3/upload-audio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: `walkthrough-audio-${Date.now()}.webm`,
              contentType: session.audioBlob.type,
              size: session.audioBlob.size,
            }),
          });

          if (!presignedResponse.ok)
            throw new Error("Failed to get presigned URL");

          const { presignedUrl, key } = await presignedResponse.json();

          setUploadStatus("Uploading audio to cloud storage...");
          const uploadResponse = await fetch(presignedUrl, {
            method: "PUT",
            body: session.audioBlob,
            headers: { "Content-Type": session.audioBlob.type },
          });

          if (!uploadResponse.ok)
            throw new Error("Failed to upload audio to cloud storage");

          audioFileKey = key;
          audioContentType = session.audioBlob.type;
          audioSize = session.audioBlob.size;
        } catch (error) {
          console.error("Error uploading audio:", error);
          setUploadStatus(
            "Warning: Audio upload failed. Continuing without audio."
          );
        }
      }

      setUploadStatus("Saving walkthrough to database...");
      const walkthroughMetadata = {
        ...metadata,
        audioFileKey,
        audioContentType,
        audioSize,
      };

      const sessionData = { ...session, audioBlob: undefined };
      const response = await fetch("/api/code-walkthroughs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: sessionData,
          metadata: walkthroughMetadata,
        }),
      });

      if (!response.ok) throw new Error("Failed to save walkthrough");

      const result = await response.json();
      setUploadStatus(
        `✅ Session uploaded successfully! ID: ${result.walkthroughId}`
      );
      onUploadComplete?.(result.walkthroughId);
    } catch (error) {
      console.error("Upload error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      setUploadStatus(`❌ Failed to upload session: ${message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="h-6 w-6" />
          Upload Session to Course
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-muted/50 p-4">
          <h4 className="font-medium text-foreground mb-2">Session Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              {
                label: "Duration",
                value: `${Math.round(
                  (session.endTime - session.startTime) / 1000
                )}s`,
              },
              { label: "Code Events", value: session.codeEvents.length },
              { label: "Audio Events", value: session.audioEvents.length },
              {
                label: "Audio Size",
                value: session.audioBlob
                  ? `${(session.audioBlob.size / 1024).toFixed(1)} KB`
                  : "No audio",
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <span className="text-muted-foreground">{label}:</span>
                <div className="font-semibold text-foreground">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              value={metadata.title}
              onChange={(e) =>
                setMetadata({ ...metadata, title: e.target.value })
              }
              placeholder="e.g., Introduction to React Hooks"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={metadata.description}
              onChange={(e) =>
                setMetadata({ ...metadata, description: e.target.value })
              }
              placeholder="Brief description of what this walkthrough covers..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseId">Course ID *</Label>
              <Input
                id="courseId"
                type="text"
                value={metadata.courseId}
                onChange={(e) =>
                  setMetadata({ ...metadata, courseId: e.target.value })
                }
                placeholder="e.g., react-basics"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapterId">Chapter ID *</Label>
              <Input
                id="chapterId"
                type="text"
                value={metadata.chapterId}
                onChange={(e) =>
                  setMetadata({ ...metadata, chapterId: e.target.value })
                }
                placeholder="e.g., chapter-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonId">Lesson ID *</Label>
              <Input
                id="lessonId"
                type="text"
                value={metadata.lessonId}
                onChange={(e) =>
                  setMetadata({ ...metadata, lessonId: e.target.value })
                }
                placeholder="e.g., lesson-1"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4 mr-2" />
            )}
            {isUploading ? "Uploading..." : "Upload Session"}
          </Button>

          {uploadStatus && (
            <div className="flex items-center gap-2 text-sm">
              {uploadStatus.startsWith("✅") && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {uploadStatus.startsWith("❌") && (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              {isUploading && <Loader className="h-4 w-4 animate-spin" />}
              <span
                className={
                  uploadStatus.startsWith("❌")
                    ? "text-destructive"
                    : "text-muted-foreground"
                }
              >
                {uploadStatus}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
