"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  Eye,
  Code2,
  Star,
  Calendar,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { incrementSnippetUsage } from "../actions";
import { CodeSnippetDetailType } from "@/app/data/code-snippet/get-code-snippet-by-id";
import Editor from "@monaco-editor/react";
import { BackButton } from "@/components/ui/back-button";

interface Props {
  snippet: NonNullable<CodeSnippetDetailType>;
}

// Language color mapping
const languageColors: Record<string, string> = {
  javascript: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  typescript: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  python: "bg-green-500/10 text-green-700 border-green-500/20",
  java: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  cpp: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  c: "bg-gray-500/10 text-gray-700 border-gray-500/20",
  rust: "bg-red-500/10 text-red-700 border-red-500/20",
  go: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
  php: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  ruby: "bg-red-600/10 text-red-800 border-red-600/20",
  swift: "bg-orange-600/10 text-orange-800 border-orange-600/20",
  kotlin: "bg-purple-600/10 text-purple-800 border-purple-600/20",
  html: "bg-orange-400/10 text-orange-600 border-orange-400/20",
  css: "bg-blue-400/10 text-blue-600 border-blue-400/20",
  sql: "bg-teal-500/10 text-teal-700 border-teal-500/20",
  bash: "bg-gray-600/10 text-gray-800 border-gray-600/20",
  shell: "bg-gray-600/10 text-gray-800 border-gray-600/20",
  json: "bg-green-400/10 text-green-600 border-green-400/20",
  yaml: "bg-pink-500/10 text-pink-700 border-pink-500/20",
  xml: "bg-amber-500/10 text-amber-700 border-amber-500/20",
};

const getLanguageColor = (language: string) => {
  return (
    languageColors[language.toLowerCase()] ||
    "bg-gray-500/10 text-gray-700 border-gray-500/20"
  );
};

// Monaco Editor Skeleton Component
function MonacoEditorSkeleton() {
  return (
    <div className="border rounded-md overflow-hidden bg-white dark:bg-[#1e1e1e]">
      <div className="h-[600px] p-4 space-y-3">
        {/* Line numbers column */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-3 text-right min-w-[40px]">
            {Array.from({ length: 25 }, (_, i) => (
              <Skeleton
                key={i}
                className="h-4 w-6 bg-gray-300/50 dark:bg-gray-600/30"
              />
            ))}
          </div>
          {/* Code content */}
          <div className="flex-1 space-y-3">
            {Array.from({ length: 25 }, (_, i) => (
              <Skeleton
                key={i}
                className={`h-4 bg-gray-300/50 dark:bg-gray-600/30 ${
                  i % 4 === 0
                    ? "w-3/4"
                    : i % 3 === 0
                    ? "w-1/2"
                    : i % 5 === 0
                    ? "w-5/6"
                    : "w-2/3"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CodeSnippetDetailView({ snippet }: Props) {
  const [isCopied, setIsCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isEditorLoading, setIsEditorLoading] = useState(true);

  // Optimistic state for click count
  const [optimisticClickCount, addOptimisticClick] = useOptimistic(
    snippet.clickCount,
    (state) => state + 1
  );

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setIsCopied(true);
      toast.success("Code copied to clipboard!");

      startTransition(async () => {
        addOptimisticClick(null);

        await incrementSnippetUsage(snippet.id);
      });

      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  return (
    <>
      <div className="flex items-start">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
            {snippet.title}
          </h1>
          <p className="text-muted-foreground">
            View and copy the complete code snippet
          </p>
        </div>
      </div>
      <div className="py-2">
        <BackButton href="/code-snippets" />
      </div>
      <div className="">
        {/* Header */}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code Editor - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {snippet.title}
                      {snippet.isFeatured && (
                        <Star className="size-5 text-yellow-500 fill-yellow-500" />
                      )}
                    </CardTitle>
                    {snippet.description && (
                      <p className="text-muted-foreground mt-2">
                        {snippet.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditorLoading && <MonacoEditorSkeleton />}
                <div
                  className={`relative border rounded-md overflow-hidden ${
                    isEditorLoading ? "hidden" : ""
                  }`}
                >
                  <Editor
                    height="600px"
                    language={snippet.language ?? "bash"}
                    value={snippet.code}
                    theme="vs-dark"
                    onMount={() => setIsEditorLoading(false)}
                    loading={<MonacoEditorSkeleton />}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: "on",
                      folding: true,
                      showFoldingControls: "always",
                      padding: { top: 16, bottom: 16 },
                      selectOnLineNumbers: true,
                      mouseWheelZoom: true,
                    }}
                  />
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      onClick={handleCopyCode}
                      className="min-w-[120px]"
                      disabled={isPending}
                    >
                      {isCopied ? (
                        <>
                          <Check className="size-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="size-4 mr-2" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Takes up 1 column */}
          <div className="space-y-6">
            {/* Language & Stats */}
            <Card className="gap-2">
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Language
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={`${getLanguageColor(
                        snippet.language ?? "bash"
                      )} text-sm`}
                    >
                      <Code2 className="size-3 mr-1" />
                      {(snippet.language ?? "bash").charAt(0).toUpperCase() +
                        (snippet.language ?? "bash").slice(1)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Usage Count
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Eye className="size-4 text-muted-foreground" />
                    <span className="font-medium">
                      {optimisticClickCount} uses
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(snippet.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {snippet.updatedAt !== snippet.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(snippet.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {snippet.tags && snippet.tags.length > 0 && (
              <Card className="gap-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {/* <Hash className="size-4" /> */}
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {snippet.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Code Stats */}
            <Card className="gap-2">
              <CardHeader>
                <CardTitle className="text-lg">Code Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lines:</span>
                  <span className="font-medium">
                    {snippet.code.split("\n").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Characters:
                  </span>
                  <span className="font-medium">
                    {snippet.code.length.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Words:</span>
                  <span className="font-medium">
                    {
                      snippet.code
                        .split(/\s+/)
                        .filter((word) => word.length > 0).length
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
