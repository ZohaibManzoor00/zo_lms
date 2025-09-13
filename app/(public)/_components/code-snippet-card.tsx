"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Eye } from "lucide-react";
import { useTrackSnippet } from "@/hooks/use-track-snippet";
import { toast } from "sonner";

interface CodeSnippetCardProps {
  snippet: {
    id: string;
    title: string;
    description?: string;
    code: string;
    language?: string;
    clickCount: number;
    author: {
      name: string;
    };
  };
}

export function CodeSnippetCard({ snippet }: CodeSnippetCardProps) {
  const { usage, trackUsage } = useTrackSnippet({
    clickCount: snippet.clickCount,
  });

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      toast.success("Code copied to clipboard!");
      trackUsage(snippet.id, "click");
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleViewSnippet = () => {
    trackUsage(snippet.id, "click");
    // Navigate to snippet detail page or expand view
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {snippet.title}
            </CardTitle>
            {snippet.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {snippet.description}
              </p>
            )}
          </div>
          {snippet.language && (
            <Badge variant="secondary" className="ml-2">
              {snippet.language}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="bg-muted rounded-md p-3 mb-4">
          <code className="text-sm font-mono">{snippet.code}</code>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{usage.clickCount}</span>
            </div>
            <span>by {snippet.author.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleViewSnippet}>
              View
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyCode}>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
