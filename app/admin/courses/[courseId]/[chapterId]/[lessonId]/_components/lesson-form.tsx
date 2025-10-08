"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  lessonUpdateSchema,
  LessonUpdateSchemaType,
  lessonDifficultySchema,
  lessonCategorySchema,
} from "@/lib/zod-schemas";
import { formatDifficulty } from "@/lib/lesson-utils";
import { AdminLessonType } from "@/app/data/admin/admin-get-lesson";
import { updateLesson } from "../actions";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CodeWalkThroughModal } from "./code-walkthrough-modal";
import { AdminWalkthroughType } from "@/app/data/admin/admin-get-walkthroughs";
import { Pill } from "@/components/ui/pill";
import { useConstructUrl } from "@/hooks/use-construct-url";
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
import { convertWalkthroughToAudioRecording } from "@/lib/convert-walkthrough-to-audio-recording";
import { AudioPlayback } from "@/components/audio-code-walkthrough";

interface Props {
  lesson: AdminLessonType;
  chapterId: string;
  courseId: string;
  allWalkthroughs: AdminWalkthroughType;
  backHref?: string;
}

export function LessonForm({
  lesson,
  chapterId,
  courseId,
  allWalkthroughs,
  backHref = `/admin/courses/${courseId}/edit`,
}: Props) {
  const [pending, startTransition] = useTransition();

  const createLessonForm = useForm<LessonUpdateSchemaType>({
    resolver: zodResolver(lessonUpdateSchema),
    defaultValues: {
      title: lesson.title,
      chapterId,
      courseId,
      videoKey: lesson.videoKey ?? undefined,
      thumbnailKey: lesson.thumbnailKey ?? undefined,
      description: lesson.description ?? undefined,
      walkthroughIds: Array.isArray(lesson.walkthroughs)
        ? lesson.walkthroughs.map((w) => w.walkthroughId)
        : [],
      categories:
        (lesson.categories as (typeof lessonCategorySchema)[number][]) || [],
      difficulty: lesson.difficulty,
      leetCodeSlug: lesson.leetCodeSlug ?? undefined,
    },
  });

  const selectedWalkthroughIds = createLessonForm.watch("walkthroughIds") || [];
  const setSelectedWalkthroughIds = (ids: string[]) =>
    createLessonForm.setValue("walkthroughIds", ids, { shouldDirty: true });
  const selectedWalkthroughs = allWalkthroughs.filter((w) =>
    selectedWalkthroughIds.includes(w.id)
  );

  const [previewId, setPreviewId] = useState<string | null>(null);
  const getAudioUrl = useConstructUrl;

  const onSubmit = (values: LessonUpdateSchemaType) => {
    console.log("🎯 onSubmit called with values:", values);
    console.log("values", values);
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
        // router.back();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  };

  return (
    <div>
      <div className="mb-6">
        <BackButton href={backHref} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <p>Lesson Configuration</p>
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/${lesson.id}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Preview User View
              </Link>
              {createLessonForm.formState.isDirty ? (
                <Button
                  type="button"
                  disabled={pending}
                  size="sm"
                  onClick={() => {
                    console.log("Button clicked!");
                    console.log(
                      "Form is dirty:",
                      createLessonForm.formState.isDirty
                    );
                    console.log(
                      "Form errors:",
                      createLessonForm.formState.errors
                    );
                    console.log("Form values:", createLessonForm.getValues());
                    console.log("About to call handleSubmit...");
                    createLessonForm.handleSubmit(onSubmit)();
                  }}
                >
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
                      <div className="flex items-center gap-2">
                        <Input
                          {...field}
                          placeholder="Enter the title of the lesson"
                          className="flex-1"
                        />
                        {createLessonForm.watch("leetCodeSlug") && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const slug =
                                createLessonForm.getValues("leetCodeSlug");
                              if (slug) {
                                window.open(
                                  `https://leetcode.com/problems/${slug}`,
                                  "_blank"
                                );
                              }
                            }}
                            className="flex items-center gap-1 shrink-0"
                          >
                            <ExternalLink className="size-4" />
                            LeetCode
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createLessonForm.control}
                name="leetCodeSlug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LeetCode Problem Slug (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., two-sum, valid-parentheses"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createLessonForm.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lessonDifficultySchema.map((difficulty) => (
                          <SelectItem key={difficulty} value={difficulty}>
                            {formatDifficulty(difficulty)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createLessonForm.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <FormControl>
                      <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {lessonCategorySchema.map((category) => (
                            <div
                              key={category}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={category}
                                checked={
                                  field.value?.includes(category) || false
                                }
                                onCheckedChange={(checked) => {
                                  const currentCategories = field.value || [];
                                  if (checked) {
                                    field.onChange([
                                      ...currentCategories,
                                      category,
                                    ]);
                                  } else {
                                    field.onChange(
                                      currentCategories.filter(
                                        (c) => c !== category
                                      )
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={category}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {category}
                              </label>
                            </div>
                          ))}
                        </div>
                        {field.value && field.value.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex flex-wrap gap-1">
                              {field.value.map((category) => (
                                <Badge
                                  key={category}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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
                name="walkthroughIds"
                render={() => (
                  <>
                    <div className="space-y-2">
                      <CodeWalkThroughModal
                        allWalkthroughs={allWalkthroughs}
                        selectedIds={selectedWalkthroughIds}
                        onSelect={setSelectedWalkthroughIds}
                      />
                      <div className="flex flex-wrap gap-2">
                        {selectedWalkthroughs.map((w, idx) => (
                          <React.Fragment key={w.id}>
                            <Dialog
                              open={previewId === w.id}
                              onOpenChange={(open) =>
                                setPreviewId(open ? w.id : null)
                              }
                            >
                              <DialogTrigger asChild>
                                <Pill
                                  className="cursor-pointer px-3 py-1 flex items-center gap-2 bg-muted border border-primary/30 hover:bg-primary/10 transition"
                                  variant="secondary"
                                  onClick={() => setPreviewId(w.id)}
                                >
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs mr-1">
                                    {idx + 1}
                                  </span>
                                  {w.name}
                                </Pill>
                              </DialogTrigger>

                              <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-3xl [&>button:last-child]:top-3.5">
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
                                        <AudioPlayback
                                          recording={convertWalkthroughToAudioRecording(
                                            w,
                                            getAudioUrl(w.audioKey)
                                          )}
                                        />
                                      </div>
                                    </DialogDescription>
                                    <DialogFooter className="px-6 pb-6 sm:justify-start">
                                      <DialogClose asChild>
                                        <Button type="button">Close</Button>
                                      </DialogClose>
                                    </DialogFooter>
                                  </div>
                                </DialogHeader>
                              </DialogContent>
                            </Dialog>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </>
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
