import { useState, useTransition } from "react";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/try-catch";
import { deleteLesson } from "../actions";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Props {
  lessonId: string;
  chapterId: string;
  courseId: string;
}

export function DeleteLesson({ lessonId, chapterId, courseId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        deleteLesson({
          lessonId,
          chapterId,
          courseId,
        })
      );

      if (error) {
        toast.error("Failed to delete lesson");
        return;
      }

      if (result?.status === "success") {
        toast.success(result.message);
        setIsOpen(false);
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this lesson? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={onSubmit} disabled={pending}>
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
