"use client";

import { useState } from "react";

export default function DemoGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-blue-900">
          How to Use Code Walkthrough
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {isExpanded ? "Hide" : "Show"} Guide
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-3 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-1">🎯 Recording a Session:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>
                Click "Start Recording" to begin capturing your coding session
              </li>
              <li>Optionally click "Start Audio" to record voice narration</li>
              <li>
                Code in the Monaco editor - all keystrokes, cursor movements,
                and selections will be captured
              </li>
              <li>Click "Stop Recording" when you're done</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium mb-1">▶️ Playing Back a Session:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Switch to "Playback Sessions" mode</li>
              <li>Select a recorded session from the list</li>
              <li>
                Use the playback controls to play, pause, or seek through the
                session
              </li>
              <li>Adjust playback speed as needed</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium mb-1">💡 Features:</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Real-time capture:</strong> Every keystroke, cursor
                movement, and selection
              </li>
              <li>
                <strong>Audio synchronization:</strong> Voice narration with
                code changes
              </li>
              <li>
                <strong>Playback controls:</strong> Play, pause, stop, and seek
                functionality
              </li>
              <li>
                <strong>Speed control:</strong> Adjust playback speed (0.5x to
                2x)
              </li>
              <li>
                <strong>Session management:</strong> Save, export, and manage
                multiple sessions
              </li>
            </ul>
          </div>

          <div className="bg-blue-100 p-3 rounded">
            <p className="font-medium">💭 Perfect for:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Creating interactive coding tutorials</li>
              <li>Recording debugging sessions</li>
              <li>Sharing coding workflows with team members</li>
              <li>Creating educational content</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
