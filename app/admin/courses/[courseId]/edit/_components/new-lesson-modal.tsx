import { useState, useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";
import { createLesson } from "../actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, PlusIcon } from "lucide-react";
import { lessonSchema, LessonSchemaType } from "@/lib/zod-schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface Props {
  courseId: string;
  chapterId: string;
}

export function NewLessonModal({ courseId, chapterId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const createLessonForm = useForm<LessonSchemaType>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      courseId,
      chapterId,
    },
  });

  const onSubmit = (values: LessonSchemaType) => {
    startTransition(async () => {
        const { data: result, error } = await tryCatch(createLesson(values));
        if (error) {
            toast.error(error.message);
            return
        }
        if (result?.status === "success") {
            toast.success(result.message);
            createLessonForm.reset();
            handleOpenChange(false);
        } else if (result?.status === "error") {
            toast.error(result.message);
        }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1 w-full justify-center">
          <PlusIcon className="size-4" />
          New Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Lesson</DialogTitle>
          <DialogDescription>
            Create a new lesson for your course
          </DialogDescription>
        </DialogHeader>

        <Form {...createLessonForm}>
          <form className="space-y-8" onSubmit={createLessonForm.handleSubmit(onSubmit)}>
            <FormField
              control={createLessonForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Lesson title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        Creating...
                    </>
                ) : (
                    "Create Lesson"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
