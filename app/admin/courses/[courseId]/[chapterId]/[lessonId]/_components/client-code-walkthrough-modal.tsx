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
import { AdminWalkthroughType } from "@/app/data/admin/admin-get-walkthroughs";

interface Props {
  allWalkthroughs: AdminWalkthroughType;
}

export function ClientCodeWalkthroughModal({ allWalkthroughs }: Props) {
  const [open, setOpen] = useState(false);
  const loading = false;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Browse Code Walkthroughs</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>All Code Walkthroughs</DialogTitle>
          <DialogDescription>
            Browse and select from all available code walkthroughs.
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
            allWalkthroughs.map((w) => (
              <Card key={w.id}>
                <CardHeader>
                  <CardTitle>{w.name}</CardTitle>
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
            ))
          ) : (
            <div className="col-span-full text-muted-foreground text-center py-8">
              No walkthroughs found.
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
