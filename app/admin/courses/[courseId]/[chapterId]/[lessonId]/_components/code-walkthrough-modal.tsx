"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminWalkthroughType } from "@/app/data/admin/admin-get-walkthroughs";

interface Props {
  allWalkthroughs: AdminWalkthroughType;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
}

export function CodeWalkThroughModal({
  allWalkthroughs,
  selectedIds,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const loading = false;
  const [localSelected, setLocalSelected] = useState<string[]>(selectedIds);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setLocalSelected(selectedIds);
    }
  };

  const toggleSelect = (id: string) => {
    setLocalSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSelect(localSelected);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Select Walkthroughs</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Code Walkthroughs</DialogTitle>
          <DialogDescription>
            Choose walkthroughs to link to this lesson. You can select multiple.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))
          ) : allWalkthroughs && allWalkthroughs.length > 0 ? (
            allWalkthroughs.map((w) => {
              const selected = localSelected.includes(w.id);
              const orderIndex = localSelected.indexOf(w.id);
              return (
                <Card
                  key={w.id}
                  onClick={() => toggleSelect(w.id)}
                  className={`cursor-pointer border-2 transition-all ${
                    selected
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-muted"
                  } relative`}
                >
                  {selected && (
                    <div
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-md border-2 border-white z-10"
                      aria-label={`Selected position ${orderIndex + 1}`}
                    >
                      {orderIndex + 1}
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelect(w.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="accent-primary"
                        aria-label={w.name}
                      />
                      {w.name}
                    </CardTitle>
                    {w.description && (
                      <CardDescription>{w.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(w.createdAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-muted-foreground text-center py-8">
              No walkthroughs found.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave}>
            Save Selection
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
