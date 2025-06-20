"use client";

import { useForm } from "react-hook-form";
import {
  courseCategorySchema,
  courseLevelSchema,
  courseSchema,
  CourseSchemaType,
  courseStatusSchema,
} from "@/lib/zod-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import slugify from "slugify";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";

import { Loader2, PlusIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor/editor";
import FileUploader from "@/components/file-uploader/uploader";
import { editCourse } from "../actions";
import { AdminCourseSingularType } from "@/app/data/admin/admin-get-course";

interface Props {
  data: AdminCourseSingularType;
}

export function EditCourseForm({ data }: Props) {
  const [isCreatingCourse, startTransition] = useTransition();
  const router = useRouter();
  const createCourseForm = useForm<CourseSchemaType>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: data.title,
      description: data.description,
      fileKey: data.fileKey,
      price: data.price,
      duration: data.duration,
      level: data.level,
      category: data.category as CourseSchemaType["category"],
      smallDescription: data.smallDescription,
      slug: data.slug,
      status: data.status,
    },
  });

  const onSubmit = (values: CourseSchemaType) => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        editCourse(values, data.id)
      );
      if (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      if (result.status === "success") {
        toast.success(result.message);
        createCourseForm.reset();
        router.push("/admin/courses");
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  };
  return (
    <div>
      <Form {...createCourseForm}>
        <form
          onSubmit={createCourseForm.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FormField
            control={createCourseForm.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter course title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4 items-end">
            <FormField
              control={createCourseForm.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter course slug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              className="w-fit cursor-pointer"
              onClick={() => {
                const titleValue = createCourseForm.getValues("title");
                const slug = slugify(titleValue);

                createCourseForm.setValue("slug", slug, {
                  shouldValidate: true,
                });
              }}
            >
              Generate Slug
              <SparklesIcon className="ml-1" size={16} />
            </Button>
          </div>

          <FormField
            control={createCourseForm.control}
            name="smallDescription"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Small Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter small description"
                    {...field}
                    className="min-h-[120px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={createCourseForm.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <RichTextEditor field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={createCourseForm.control}
            name="fileKey"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Thumbnail</FormLabel>
                <FormControl>
                  <FileUploader onChange={field.onChange} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={createCourseForm.control}
              name="category"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Category</FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {courseCategorySchema.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createCourseForm.control}
              name="level"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Level</FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Level" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {courseLevelSchema.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createCourseForm.control}
              name="duration"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Duration (hours)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Course duration (hours)"
                      {...field}
                      type="number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createCourseForm.control}
              name="price"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Course price ($)"
                      {...field}
                      type="number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={createCourseForm.control}
            name="status"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Status</FormLabel>

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {courseStatusSchema.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isCreatingCourse}
          >
            {isCreatingCourse ? (
              <>
                Updating...
                <Loader2 className="size-4 animate-spin" />
              </>
            ) : (
              <>
                Update Course <PlusIcon size={16} />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
