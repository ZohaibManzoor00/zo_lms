"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  AlertCircleIcon,
  ImageIcon,
  Loader2,
  UploadIcon,
  VideoIcon,
  XIcon,
} from "lucide-react";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { cn } from "@/lib/utils";

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

interface iAppProps {
  value?: string;
  onChange?: (value: string) => void;
  fileTypeAccepted: "image" | "video";
}

export function Uploader({
  value,
  onChange,
  fileTypeAccepted,
}: iAppProps) {
  const fileUrl = useConstructUrl(value ?? "");
  const [fileState, setFileState] = useState<UploaderProps>({
    id: null,
    file: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    error: false,
    fileType: fileTypeAccepted,
    key: value,
    objectUrl: value ? fileUrl : undefined,
  });

  const uploadFile = useCallback(
    async (file: File) => {
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
            isImage: fileTypeAccepted === "image",
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
              onChange?.(key);
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
      } catch (error) {
        console.error(error);
        toast.error("Failed to upload file");
        setFileState((prev) => ({
          ...prev,
          progress: 0,
          error: true,
          uploading: false,
        }));
      }
    },
    [fileTypeAccepted, onChange]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
          URL.revokeObjectURL(fileState.objectUrl);
        }
        setFileState({
          id: uuid(),
          file,
          isDeleting: false,
          error: false,
          uploading: false,
          progress: 0,
          objectUrl: URL.createObjectURL(file),
          fileType: fileTypeAccepted,
        });
        uploadFile(file);
      }
    },
    [fileState.objectUrl, fileTypeAccepted, uploadFile]
  );

  const removeFile = async () => {
    if (fileState.isDeleting || !fileState.objectUrl) return;
    try {
      setFileState((prev) => ({
        ...prev,
        isDeleting: true,
      }));

      const response = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: fileState.key }),
      });

      if (!response.ok) {
        toast.error("Failed to delete file");
        setFileState((prev) => ({
          ...prev,
          isDeleting: false,
          error: true,
        }));
        return;
      }

      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectUrl);
      }

      onChange?.("");

      setFileState(() => ({
        file: null,
        objectUrl: undefined,
        id: null,
        isDeleting: false,
        error: false,
        uploading: false,
        progress: 0,
        fileType: fileTypeAccepted,
      }));

      toast.success("File deleted successfully");
    } catch {
      toast.error("Failed to delete file, please try again.");
      setFileState((prev) => ({
        ...prev,
        isDeleting: false,
        error: true,
      }));
    }
  };

  const maxSizeImageMB = 5;
  const maxSizeVideoMB = 500;

  const onDropRejected = useCallback(
    (rejectedFiles: any[]) => {
      const rejection = rejectedFiles[0];

      if (rejection.errors) {
        const error = rejection.errors[0];

        switch (error.code) {
          case "file-too-large":
            toast.error(`File is too large. Maximum size is ${fileTypeAccepted === 'image' ? maxSizeImageMB : maxSizeVideoMB}MB.`);
            break;
          case "file-invalid-type":
            toast.error(
              "File type not supported. Please upload an image file."
            );
            break;
          case "too-many-files":
            toast.error("You can only upload one file at a time.");
            break;
          default:
            toast.error("File upload failed. Please try again.");
        }
      }
    },
    [fileTypeAccepted]
  );

  const renderContent = () => {
    if (fileState.uploading) {
      return (
        <RenderUploadingState
          progress={fileState.progress}
          file={fileState.file as File}
        />
      );
    }

    if (fileState.error) {
      return <RenderErrorState />;
    }

    if (fileState.objectUrl) {
      return (
        <RenderSuccessState
          fileName={fileState.file?.name}
          previewUrl={fileState.objectUrl}
          isDeleting={fileState.isDeleting}
          handleRemoveFile={removeFile}
          fileType={fileTypeAccepted}
        />
      );
    }

    return (
      <RenderDefaultState
        isDragActive={isDragActive}
        maxSizeImageMB={maxSizeImageMB}
        maxSizeVideoMB={maxSizeVideoMB}
        open={open}
        fileType={fileTypeAccepted}
      />
    );
  };

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept:
      fileTypeAccepted === "image" ? { "image/*": [] } : { "video/*": [] },
    maxFiles: 1,
    multiple: false,
    maxSize: fileTypeAccepted === 'image' ? maxSizeImageMB * 1024 * 1024 : maxSizeVideoMB * 1024 * 1024,
    disabled: fileState.uploading || !!fileState.objectUrl,
  });

  useEffect(() => {
    return () => {
      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectUrl);
      }
    };
  }, [fileState.objectUrl]);

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
      </div>
    </div>
  );
}

interface RenderUploadingStateProps {
  progress: number;
  file: File;
}

function RenderUploadingState({ progress, file }: RenderUploadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
      <div className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Loader2 className="size-5 animate-spin text-primary" />
      </div>
      <p className="mb-1.5 text-sm font-medium truncate max-w-xs">
        Uploading {file.name}...
      </p>
      <p className="text-muted-foreground text-xs">{progress}% complete</p>
    </div>
  );
}

function RenderErrorState() {
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

interface RenderSuccessStateProps {
  fileName?: string;
  previewUrl: string;
  isDeleting: boolean;
  handleRemoveFile: () => void;
  fileType: "image" | "video";
}

function RenderSuccessState({
  fileName,
  previewUrl,
  isDeleting,
  handleRemoveFile,
  fileType,
}: RenderSuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
      <div className="mb-4 flex size-11 shrink-0 items-center justify-center rounded-full bg-green-500/10">
        {fileType === "image" ? (
          <ImageIcon className="size-5 text-green-600" />
        ) : (
          <VideoIcon className="size-5 text-green-600" />
        )}
      </div>
      <p className="mb-1.5 -mt-2 text-sm font-medium">
        File uploaded successfully
      </p>
      <p className="mb-4 text-muted-foreground text-xs">{fileName}</p>
      <div className={cn(
        "relative group flex items-center justify-center overflow-hidden rounded-lg border",
        fileType === "image" ? "aspect-square w-full" : "aspect-video w-4/5 h-full"
      )}>
        {fileType === "image" ? (
          <Image
            src={previewUrl}
            alt="Uploaded image"
            fill
            className="object-contain p-2"
          />
        ) : (
          <video
            src={previewUrl}
            className="h-full w-full rounded-md"
            controls
          />
        )}
      </div>
      <Button
        type="button"
        size="icon"
        className="absolute top-4 right-4 cursor-pointer rounded-full"
        onClick={handleRemoveFile}
        aria-label="Remove image"
        variant="destructive"
        disabled={isDeleting}
      >
        <XIcon className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

interface RenderDefaultStateProps {
  isDragActive: boolean;
  maxSizeImageMB: number;
  maxSizeVideoMB: number;
  open: () => void;
  fileType: "image" | "video";
}

function RenderDefaultState({
  isDragActive,
  maxSizeImageMB,
  maxSizeVideoMB,
  open,
  fileType,
}: RenderDefaultStateProps) {
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
        {fileType === "image" ? (
          <ImageIcon
          className={`size-5 transition-all duration-200 ${
                isDragActive ? "text-primary scale-110" : "opacity-60"
            }`}
          />
        ) : (
          <VideoIcon
            className={`size-5 transition-all duration-200 ${
              isDragActive ? "text-primary scale-110" : "opacity-60"
            }`}
          />
        )}
      </div>
      <p
        className={`mb-1.5 -mt-1 text-sm font-medium transition-colors duration-200 ${
          isDragActive ? "text-primary" : ""
        }`}
      >
        Drop your {fileType} here
      </p>
      <p className="text-muted-foreground text-xs">
        {fileType === "image"
          ? `SVG, PNG, or JPG (max. ${maxSizeImageMB}MB)`
          : `MP4, MOV, or WEBM (max. ${maxSizeVideoMB}MB)`}
      </p>
      {!isDragActive && (
        <Button
          variant="outline"
          className="mt-4 cursor-pointer"
          onClick={open}
          type="button"
        >
          <UploadIcon className="-ms-1 size-4 opacity-60" aria-hidden="true" />
          {fileType === "image" ? "Select image" : "Select video"}
        </Button>
      )}
    </div>
  );
}
