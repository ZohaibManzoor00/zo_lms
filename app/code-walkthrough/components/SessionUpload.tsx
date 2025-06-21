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
    instructorId: "instructor-1", // Default instructor ID
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
      console.log("Uploading session:", session);
      console.log("Session audioBlob:", session.audioBlob);
      console.log("AudioBlob type:", typeof session.audioBlob);
      console.log(
        "AudioBlob instanceof Blob:",
        session.audioBlob instanceof Blob
      );

      // Prepare session data with serialized audioBlob
      const sessionData = { ...session };

      if (session.audioBlob && session.audioBlob instanceof Blob) {
        console.log("Processing audioBlob for upload...");
        // Convert Blob to serializable format
        const arrayBuffer = await session.audioBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        sessionData.audioBlob = {
          data: Array.from(uint8Array), // Convert to regular array for JSON serialization
          type: session.audioBlob.type,
          size: session.audioBlob.size,
        };
        console.log("Serialized audioBlob:", sessionData.audioBlob);
      } else {
        console.warn("No valid audioBlob found for upload");
        sessionData.audioBlob = null;
      }

      const sessionMetadata: SessionMetadata = {
        id: session.id,
        title: metadata.title,
        description: metadata.description,
        courseId: metadata.courseId,
        chapterId: metadata.chapterId,
        lessonId: metadata.lessonId,
        instructorId: metadata.instructorId,
        duration: session.endTime - session.startTime,
        codeEvents: session.codeEvents.length,
        audioEvents: session.audioEvents.length,
        audioSize: session.audioBlob?.size || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata: sessionMetadata,
          session: sessionData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload session");
      }

      const result = await response.json();
      setUploadStatus(
        `✅ Session uploaded successfully! ID: ${result.sessionId}`
      );
      onUploadComplete?.(result.sessionId);
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
