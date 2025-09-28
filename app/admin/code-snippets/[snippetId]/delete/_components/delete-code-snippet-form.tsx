"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteCodeSnippet } from "../actions";
import { CodeSnippetType } from "@/app/data/code-snippet/get-all-code-snippets";
import { Code2, AlertTriangle } from "lucide-react";

interface Props {
  snippet: CodeSnippetType;
}

export function DeleteCodeSnippetForm({ snippet }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCodeSnippet(snippet.id);
      router.push("/admin/code-snippets");
      router.refresh();
    } catch (error) {
      console.error("Error deleting code snippet:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const previewCode =
    snippet.code.length > 200
      ? snippet.code.substring(0, 200) + "..."
      : snippet.code;

  return (
    <div className="space-y-6">
      <Card className="border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            <CardTitle className="text-destructive">Confirm Deletion</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are about to delete the following code snippet:
          </p>

          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-lg">{snippet.title}</h3>
                {snippet.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {snippet.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Code2 className="size-3" />
                  {snippet.language}
                </Badge>

                {snippet.tags && snippet.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    {/* <Hash className="size-3 text-muted-foreground" /> */}
                    {snippet.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
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
              </div>

              <div className="bg-background rounded-md p-3 border">
                <pre className="text-xs text-muted-foreground font-mono leading-relaxed overflow-hidden">
                  <code>{previewCode}</code>
                </pre>
              </div>

              <div className="text-xs text-muted-foreground">
                Used {snippet.clickCount} times • Created{" "}
                {new Date(snippet.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-destructive">Warning</h4>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. The code snippet will be
                  permanently deleted and cannot be recovered.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete Code Snippet"}
        </Button>
      </div>
    </div>
  );
}
