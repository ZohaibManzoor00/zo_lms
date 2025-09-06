"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buildRecordingSession } from "@/lib/build-recording-session";
import { AdminWalkthroughType } from "@/app/data/admin/admin-get-walkthroughs";

const CodePlayback = dynamic(
  () => import("@/components/code-walkthrough/code-playback"),
  { ssr: false }
);

export function WalkthroughAccordionList({
  walkthroughs,
}: {
  walkthroughs: AdminWalkthroughType;
}) {
  const getAudioUrl = useConstructUrl;
  const [openId, setOpenId] = useState<string | null>(null);

  if (!walkthroughs || walkthroughs.length === 0) {
    return <div className="text-muted-foreground">No walkthroughs found.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {walkthroughs.map((w) => (
        <Dialog
          key={w.id}
          open={openId === w.id}
          onOpenChange={(open) => setOpenId(open ? w.id : null)}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-full p-0 pb-2 bg-background border rounded-lg shadow-sm text-left flex flex-col items-stretch hover:bg-muted/30 transition"
            >
              <div className="flex-1 px-4 py-3">
                <div className="font-semibold text-lg mb-1 truncate">
                  {w.name}
                </div>
                {w.description && (
                  <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {w.description}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-auto">
                  {new Date(w.createdAt).toLocaleString()}
                </div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="flex flex-col gap-0 p-0 max-w-6xl w-[90vw] max-h-[85vh] h-[85vh] [&>button:last-child]:top-3.5">
            <DialogHeader className="contents space-y-0 text-left">
              <DialogTitle className="border-b px-6 py-4 text-base">
                {w.name}
              </DialogTitle>
              <div className="overflow-y-auto">
                <DialogDescription asChild>
                  <div className="px-6 py-4">
                    {w.description && (
                      <div className="mb-4 text-muted-foreground text-sm">
                        {w.description}
                      </div>
                    )}
                    <CodePlayback
                      session={buildRecordingSession(w, getAudioUrl)}
                    />
                  </div>
                </DialogDescription>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
