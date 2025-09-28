"use client";

import Link from "next/link";
import { CodeSnippetType } from "@/app/data/code-snippet/get-all-code-snippets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  Code2,
  Hash,
  MousePointer,
  Star,
} from "lucide-react";
import { ForwardButton } from "@/components/ui/forward-button";
import { CopyButton } from "@/components/ui/copy-button";

interface Props {
  data: CodeSnippetType;
}

// Language color mapping for visual distinction
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

export function AdminCodeSnippetCard({ data }: Props) {
  const previewCode =
    data.code.length > 150 ? data.code.substring(0, 150) + "..." : data.code;

  return (
    <Card className="group relative">
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/admin/code-snippets/${data.id}/edit`}>
                <Pencil className="size-4 text-yellow-600" />
                Edit Snippet
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/code-snippets`}>
                <Eye className="size-4 text-emerald-600" />
                Preview Snippet
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/admin/code-snippets/${data.id}/delete`}>
                <Trash2 className="size-4 text-destructive" />
                Delete Snippet
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/admin/code-snippets/${data.id}/edit`}
              className="font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors"
            >
              {data.title}
            </Link>
            {data.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {data.description}
              </p>
            )}
          </div>
          {data.isFeatured && (
            <Star className="size-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={getLanguageColor(data.language)}>
            <Code2 className="size-3 mr-1" />
            {data.language}
          </Badge>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MousePointer className="size-3" />
            {data.clickCount} uses
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
            <CopyButton textToCopy={data.code} size="sm" />
          </div>
        </div>

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-3 flex-wrap">
            {/* <Hash className="size-3 text-muted-foreground" /> */}
            {data.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {data.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{data.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <ForwardButton
          href={`/admin/code-snippets/${data.id}/edit`}
          label="Edit Snippet"
          variant="default"
          className="w-full mt-4"
        />
      </CardContent>
    </Card>
  );
}

export function AdminCodeSnippetCardSkeleton() {
  return (
    <Card className="group relative">
      <div className="absolute top-2 right-2 z-10">
        <Skeleton className="size-8 rounded-md" />
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Skeleton className="h-24 w-full rounded-md mb-3" />

        <div className="flex items-center gap-1 flex-wrap">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-14" />
        </div>

        <Skeleton className="w-full h-10 mt-4" />
      </CardContent>
    </Card>
  );
}
