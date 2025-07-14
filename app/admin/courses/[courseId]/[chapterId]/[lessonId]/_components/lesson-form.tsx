"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lessonSchema, LessonSchemaType } from "@/lib/zod-schemas";
import { AdminLessonType } from "@/app/data/admin/admin-get-lesson";
import { updateLesson } from "../actions";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/rich-text-editor/editor";
import { Uploader } from "@/components/file-uploader/uploader";
import { BackButton } from "@/components/ui/back-button";

interface Props {
  lesson: AdminLessonType;
  chapterId: string;
  courseId: string;
}

export function LessonForm({ lesson, chapterId, courseId }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const createLessonForm = useForm<LessonSchemaType>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson.title,
      chapterId,
      courseId,
      videoKey: lesson.videoKey ?? undefined,
      thumbnailKey: lesson.thumbnailKey ?? undefined,
      description: lesson.description ?? undefined,
    },
  });

  const onSubmit = (values: LessonSchemaType) => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        updateLesson({ formData: values, lessonId: lesson.id })
      );

      if (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      if (result.status === "success") {
        toast.success(result.message);
        router.back();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  };

  return (
    <div>
      <div className="mb-6">
        <BackButton href={`/admin/courses/${courseId}/edit`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <p>Lesson Configuration</p>
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/${lesson.chapter.course.slug}/${lesson.id}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Preview User View
              </Link>
              {createLessonForm.formState.isDirty ? (
                <Button type="submit" disabled={pending} size="sm">
                  {pending ? "Saving..." : "Save Changes"}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={true}
                  variant="outline"
                  size="sm"
                >
                  No changes detected
                </Button>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Configure the video and description for this lesson.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...createLessonForm}>
            <form
              onSubmit={createLessonForm.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={createLessonForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Lesson Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter the title of the lesson"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createLessonForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>
                      Lesson Description
                    </FormLabel>
                    <FormControl>
                      <RichTextEditor field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createLessonForm.control}
                name="thumbnailKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Lesson Thumbnail</FormLabel>
                    <FormControl>
                      <Uploader
                        value={field.value}
                        onChange={field.onChange}
                        fileTypeAccepted="image"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createLessonForm.control}
                name="videoKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Lesson Video</FormLabel>
                    <FormControl>
                      <Uploader
                        value={field.value}
                        onChange={field.onChange}
                        fileTypeAccepted="video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {createLessonForm.formState.isDirty ? (
                <Button type="submit" disabled={pending} size="sm">
                  {pending ? "Saving..." : "Save Changes"}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={true}
                  variant="outline"
                  size="sm"
                >
                  No changes detected
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
