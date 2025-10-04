"use client";

import { useState, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Eye, Code2, Star, Check } from "lucide-react";
import { toast } from "sonner";
import { incrementSnippetUsage } from "../code-snippets/[id]/actions";

interface CodeSnippetCardProps {
  snippet: {
    id: string;
    title: string;
    description: string | null;
    code: string;
    language: string;
    clickCount: number;
    tags?: string[];
    isFeatured?: boolean;
  };
}

export const languageColors: Record<string, string> = {
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

export function CodeSnippetCard({ snippet }: CodeSnippetCardProps) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [optimisticClickCount, addOptimisticClick] = useOptimistic(
    snippet.clickCount,
    (state) => state + 1
  );

  const handleViewSnippet = () => {
    router.push(`/code-snippets/${snippet.id}`);
  };

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();

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

  const previewCode =
    snippet.code.length > 150
      ? snippet.code.substring(0, 150) + "..."
      : snippet.code;

  return (
    <Card
      className="group transition-all duration-300 cursor-pointer !border-2 !border-border dark:!border-muted-foreground/30 hover:!border-primary/60 dark:hover:!border-primary/70 shadow-lg hover:shadow-xl hover:scale-[1.01]"
      onClick={handleViewSnippet}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
              {snippet.title}
            </CardTitle>
            {snippet.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {snippet.description}
              </p>
            )}
          </div>
          {snippet.isFeatured && (
            <Star className="size-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-3">
          <Badge
            variant="outline"
            className={getLanguageColor(snippet.language)}
          >
            <Code2 className="size-3 mr-1" />
            {snippet.language}
          </Badge>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="size-3" />
            {optimisticClickCount} uses
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Code Preview */}
        <div className="relative">
          <pre className="bg-muted/50 rounded-md p-3 text-xs overflow-hidden">
            <code className="text-muted-foreground font-mono leading-relaxed">
              {previewCode}
            </code>
          </pre>
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCode}
              className="h-8 w-8 p-0"
              disabled={isPending}
            >
              {isCopied ? (
                <Check className="size-3 text-green-600" />
              ) : (
                <Copy className="size-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Tags */}
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-3 flex-wrap">
            {snippet.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {snippet.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{snippet.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-muted-foreground">
            Click to view full snippet
          </div>

          <Button variant="outline" size="sm" onClick={handleViewSnippet}>
            <Eye className="h-3 w-3 mr-1" />
            View Full
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
