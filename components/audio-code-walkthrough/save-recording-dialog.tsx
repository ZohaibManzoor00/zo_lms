"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface CodeEvent {
  timestamp: number;
  type: "keypress" | "delete" | "paste";
  data: string;
  position?: number;
}

interface AudioRecording {
  id: string;
  audioBlob: Blob;
  duration: number;
  codeEvents: CodeEvent[];
  initialCode: string;
  finalCode: string;
  createdAt: Date;
  language?: string;
}

interface SaveRecordingDialogProps {
  recording: AudioRecording;
  onSave: (
    recording: AudioRecording,
    name: string,
    description?: string
  ) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

export function SaveRecordingDialog({
  recording,
  onSave,
  onCancel,
  isOpen,
}: SaveRecordingDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name for the recording");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(recording, name.trim(), description.trim() || undefined);
      toast.success("Recording saved successfully!");
      setName("");
      setDescription("");
      onCancel();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save recording"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Save Recording</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Info */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {formatDuration(recording.duration)}
            </Badge>
            <Badge variant="outline">
              {recording.codeEvents.length} events
            </Badge>
            <Badge variant="outline">
              {(recording.audioBlob.size / 1024).toFixed(1)} KB
            </Badge>
            {recording.language && (
              <Badge variant="secondary">{recording.language}</Badge>
            )}
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter recording name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              maxLength={100}
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export type { CodeEvent, AudioRecording, SaveRecordingDialogProps };
