"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

import { Button } from "@/components/ui/button";
import {
  AlertCircleIcon,
  ImageIcon,
  Loader2,
  UploadIcon,
  XIcon,
} from "lucide-react";

interface UploaderProps {
  id: string | null;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
  fileType: "image" | "video";
}

export default function FileUploader() {
  const [fileState, setFileState] = useState<UploaderProps>({
    id: null,
    file: null,
    uploading: false,
    progress: 0,
    key: undefined,
    isDeleting: false,
    error: false,
    fileType: "image",
  });

  const uploadFile = async (file: File) => {
    setFileState((prev) => ({
      ...prev,
      uploading: true,
      progress: 0,
    }));

    try {
      const presignedResponse = await fetch("/api/s3/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
          isImage: true,
        }),
      });

      if (!presignedResponse.ok) {
        toast.error("Failed to generate presigned URL");
        setFileState((prev) => ({
          ...prev,
          uploading: false,
          progress: 0,
          error: true,
        }));
        return;
      }

      const { presignedUrl, key } = await presignedResponse.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentageCompleted = (event.loaded / event.total) * 100;
            setFileState((prev) => ({
              ...prev,
              progress: Math.round(percentageCompleted),
            }));
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            setFileState((prev) => ({
              ...prev,
              uploading: false,
              progress: 100,
              key,
            }));
            toast.success("File uploaded successfully");
            resolve();
          } else {
            reject(new Error("Failed to upload file"));
          }
        };
        xhr.onerror = () => {
          reject(new Error("Failed to upload file"));
        };
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch {
      toast.error("Failed to upload file");
      setFileState((prev) => ({
        ...prev,
        progress: 0,
        error: true,
        uploading: false,
      }));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileState({
        id: uuid(),
        file,
        isDeleting: false,
        error: false,
        uploading: false,
        progress: 0,
        objectUrl: URL.createObjectURL(file),
        fileType: "image",
      });
      uploadFile(file);
    }
  }, []);

  const renderContent = () => {
    if (fileState.uploading) {
      return (
        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
          <div className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
          <p className="mb-1.5 text-sm font-medium">Uploading...</p>
          <p className="text-muted-foreground text-xs">
            {fileState.progress}% complete
          </p>
        </div>
      );
    }

    if (fileState.error) {
      return (
        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
          <div className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircleIcon className="size-5 text-destructive" />
          </div>
          <p className="mb-1.5 text-sm font-medium text-destructive">
            Upload failed
          </p>
          <p className="text-muted-foreground text-xs">Please try again</p>
        </div>
      );
    }

    if (fileState.objectUrl) {
      return (
        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
          <div className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full bg-green-500/10">
            <ImageIcon className="size-5 text-green-600" />
          </div>
          <p className="mb-1.5 text-sm font-medium">
            File uploaded successfully
          </p>
          <p className="text-muted-foreground text-xs">
            {fileState.file?.name}
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
        <div
          className={`mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
            isDragActive
              ? "bg-primary/10 border-primary scale-110"
              : "bg-background border-border"
          }`}
          aria-hidden="true"
        >
          <ImageIcon
            className={`size-5 transition-all duration-200 ${
              isDragActive ? "text-primary scale-110" : "opacity-60"
            }`}
          />
        </div>
        <p
          className={`mb-1.5 -mt-1 text-sm font-medium transition-colors duration-200 ${
            isDragActive ? "text-primary" : ""
          }`}
        >
          {isDragActive ? "Drop your image here" : "Drop your image here"}
        </p>
        <p className="text-muted-foreground text-xs">
          SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
        </p>
        {!isDragActive && (
          <Button
            variant="outline"
            className="mt-4 cursor-pointer"
            onClick={open}
            type="button"
          >
            <UploadIcon
              className="-ms-1 size-4 opacity-60"
              aria-hidden="true"
            />
            Select image
          </Button>
        )}
      </div>
    );
  };

  const maxSizeMB = 5;
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    maxSize: maxSizeMB * 1024 * 1024, // 5MB
  });

  return (
    <div className="flex flex-col gap-2" {...getRootProps()}>
      <div className="relative">
        <div
          className={`relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-all duration-200 ${
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
              : "border-input hover:border-ring/50 hover:bg-accent/30"
          }`}
        >
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label="Upload image file"
          />
          {renderContent()}
        </div>

        {fileState.objectUrl && (
          <div className="absolute top-4 right-4">
            <Button
              type="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
              onClick={() =>
                setFileState((prev) => ({
                  ...prev,
                  isDeleting: true,
                  file: null,
                  objectUrl: undefined,
                  id: null,
                }))
              }
              aria-label="Remove image"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
