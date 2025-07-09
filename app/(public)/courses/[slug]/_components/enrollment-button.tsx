"use client";

import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";
import { useTransition } from "react";
import { enrollInCourse } from "../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  courseId: string;
}

export function EnrollmentButton({ courseId }: Props) {
  const [pending, startTransition] = useTransition();

  const onSubmit = () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(enrollInCourse(courseId));

      if (error) {
        toast.error(
          "An unexpected error occurred while enrolling in the course"
        );
        return;
      }

      if (result.status === "success") {
        toast.success(result.message);
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  };

  return (
    <Button
      className="w-full"
      type="submit"
      onClick={onSubmit}
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Enrolling...
        </>
      ) : (
        "Enroll Now!"
      )}
    </Button>
  );
}
