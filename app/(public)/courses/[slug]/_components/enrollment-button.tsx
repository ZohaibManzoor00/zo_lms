"use client";

import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";
import { useTransition } from "react";
import { enrollInCourse } from "../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  courseId: string;
  isFree: boolean;
}

export function EnrollmentButton({ courseId, isFree }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

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
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
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
        isFree ? "Start Learning" : "Enroll Now!"
      )}
    </Button>
  );
}
