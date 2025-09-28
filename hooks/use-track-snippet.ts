"use client";

import { trackSnippetUsage } from "@/app/data/code-snippet/actions";
import { UsageType } from "@/app/data/code-snippet/increment-snippet-usage";
import { useOptimistic, startTransition } from "react";
import { toast } from "sonner";
import { tryCatch } from "./try-catch";

interface SnippetUsage {
  clickCount: number;
}

export function useTrackSnippet(initialUsage: SnippetUsage) {
  const [optimisticUsage, addOptimisticUsage] = useOptimistic(
    initialUsage,
    (state, type: UsageType) => {
      switch (type) {
        case "click":
          return { ...state, clickCount: state.clickCount + 1 };
        default:
          return state;
      }
    }
  );

  const trackUsage = async (snippetId: string, type: UsageType) => {
    startTransition(() => {
      addOptimisticUsage(type);
    });

    const { data: result, error } = await tryCatch(
      trackSnippetUsage(snippetId, type)
    );

    if (error) {
      toast.error(error.message);
      return;
    }

    if (!result.success) {
      toast.error(result.error || "Failed to track usage");
    }

    return result.snippet;
  };

  return {
    usage: optimisticUsage,
    trackUsage,
  };
}
