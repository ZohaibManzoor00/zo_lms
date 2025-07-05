import { useState, useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";
import { createChapter } from "../actions";
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
import { chapterSchema, ChapterSchemaType } from "@/lib/zod-schemas";
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
}

export function NewChapterModal({ courseId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const createChapterForm = useForm<ChapterSchemaType>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: "",
      courseId,
    },
  });

  const onSubmit = (values: ChapterSchemaType) => {
    startTransition(async () => {
        const { data: result, error } = await tryCatch(createChapter(values));
        if (error) {
            toast.error(error.message);
            return
        }
        if (result?.status === "success") {
            toast.success(result.message);
            createChapterForm.reset();
            handleOpenChange(false);
        } else if (result?.status === "error") {
            toast.error(result.message);
        }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <PlusIcon className="size-4" />
          New Chapter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Chapter</DialogTitle>
          <DialogDescription>
            Create a new chapter for your course
          </DialogDescription>
        </DialogHeader>

        <Form {...createChapterForm}>
          <form className="space-y-8" onSubmit={createChapterForm.handleSubmit(onSubmit)}>
            <FormField
              control={createChapterForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Chapter title" />
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
                    "Create Chapter"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
