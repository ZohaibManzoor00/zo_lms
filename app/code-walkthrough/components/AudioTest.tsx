"use client";

import { useState, useRef } from "react";

export default function AudioTest() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startTestRecording = async () => {
    try {
      setError(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Audio test error:", error);
      setError(
        "Failed to start audio recording. Please check microphone permissions."
      );
    }
  };

  const stopTestRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = "audio-test.webm";
      a.click();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
        <span className="text-purple-500">🎤</span>
        Audio Test
      </h3>

      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={isRecording ? stopTestRecording : startTestRecording}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isRecording
                ? "bg-red-500 text-white hover:bg-red-600 shadow-lg"
                : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl"
            }`}
          >
            {isRecording ? "⏹️ Stop Test" : "🎬 Start Test Recording"}
          </button>

          {audioUrl && (
            <button
              onClick={downloadAudio}
              className="px-6 py-3 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              📥 Download Audio
            </button>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">
              Recording... Speak into your microphone
            </span>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {audioUrl && (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-500">✅</span>
                <span className="font-medium">Test recording completed!</span>
              </div>
              <p>Play it back to verify audio quality:</p>
            </div>
            <audio
              controls
              className="w-full"
              src={audioUrl}
              onError={(e) => console.error("Audio playback error:", e)}
            />
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-500">💡</span>
            <span className="font-medium">Tip:</span>
          </div>
          This test helps verify that your microphone is working correctly and
          audio recording is functioning properly before starting a full
          session.
        </div>
      </div>
    </div>
  );
}
