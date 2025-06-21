"use client";

import { useState } from "react";
import { RecordingSession } from "./CodeRecorder";
import { SessionMetadata } from "@/app/api/sessions/route";

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
    setUploadStatus("Uploading session...");

    try {
      let audioFileKey: string | null = null;
      let audioContentType: string | null = null;
      let audioSize: number | null = null;

      // Upload audio to Tigris if available
      if (session.audioBlob && session.audioBlob instanceof Blob) {
        try {
          setUploadStatus("Uploading audio to cloud storage...");

          // Get presigned URL for audio upload
          const presignedResponse = await fetch("/api/s3/upload-audio", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filename: `walkthrough-audio-${Date.now()}.webm`,
              contentType: session.audioBlob.type,
              size: session.audioBlob.size,
            }),
          });

          if (!presignedResponse.ok) {
            throw new Error("Failed to get presigned URL for audio upload");
          }

          const { presignedUrl, key } = await presignedResponse.json();

          // Upload audio blob directly to Tigris
          const uploadResponse = await fetch(presignedUrl, {
            method: "PUT",
            body: session.audioBlob,
            headers: {
              "Content-Type": session.audioBlob.type,
            },
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload audio to cloud storage");
          }

          audioFileKey = key;
          audioContentType = session.audioBlob.type;
          audioSize = session.audioBlob.size;
        } catch (error) {
          console.error("Error uploading audio:", error);
          setUploadStatus(
            "Warning: Audio upload failed, continuing without audio..."
          );
          // Continue without audio if upload fails
        }
      }

      setUploadStatus("Saving walkthrough to database...");

      // Prepare metadata for database (without the blob)
      const walkthroughMetadata = {
        title: metadata.title,
        description: metadata.description,
        courseId: metadata.courseId,
        chapterId: metadata.chapterId,
        lessonId: metadata.lessonId,
        instructorId: metadata.instructorId,
        audioFileKey,
        audioContentType,
        audioSize,
      };

      // Create session data without the blob
      const sessionData = {
        ...session,
        audioBlob: undefined, // Don't send the blob to the API
      };

      const response = await fetch("/api/code-walkthroughs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: sessionData,
          metadata: walkthroughMetadata,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload session");
      }

      const result = await response.json();
      setUploadStatus(
        `✅ Session uploaded successfully! ID: ${result.walkthroughId}`
      );
      onUploadComplete?.(result.walkthroughId);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("❌ Failed to upload session. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
        <span className="text-green-500">📤</span>
        Upload Session to Course
      </h3>

      <div className="space-y-4">
        {/* Session Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-700 mb-2">Session Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Duration:</span>
              <div className="font-medium">
                {Math.round((session.endTime - session.startTime) / 1000)}s
              </div>
            </div>
            <div>
              <span className="text-blue-600">Code Events:</span>
              <div className="font-medium">{session.codeEvents.length}</div>
            </div>
            <div>
              <span className="text-blue-600">Audio Events:</span>
              <div className="font-medium">{session.audioEvents.length}</div>
            </div>
            <div>
              <span className="text-blue-600">Audio Size:</span>
              <div className="font-medium">
                {session.audioBlob
                  ? `${(session.audioBlob.size / 1024).toFixed(1)} KB`
                  : "No audio"}
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) =>
                setMetadata({ ...metadata, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Introduction to React Hooks"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={metadata.description}
              onChange={(e) =>
                setMetadata({ ...metadata, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Brief description of what this walkthrough covers..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course ID *
              </label>
              <input
                type="text"
                value={metadata.courseId}
                onChange={(e) =>
                  setMetadata({ ...metadata, courseId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., react-basics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chapter ID *
              </label>
              <input
                type="text"
                value={metadata.chapterId}
                onChange={(e) =>
                  setMetadata({ ...metadata, chapterId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., chapter-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson ID *
              </label>
              <input
                type="text"
                value={metadata.lessonId}
                onChange={(e) =>
                  setMetadata({ ...metadata, lessonId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., lesson-1"
              />
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "📤 Uploading..." : "📤 Upload Session"}
          </button>

          {uploadStatus && (
            <div
              className={`text-sm ${
                uploadStatus.includes("✅")
                  ? "text-green-600"
                  : uploadStatus.includes("❌")
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              {uploadStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
