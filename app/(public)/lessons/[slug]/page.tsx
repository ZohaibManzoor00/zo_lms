import { getPublicLesson } from "@/app/data/lesson/get-public-lesson";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { IconClock, IconVideo, IconMicrophone } from "@tabler/icons-react";
import { ExternalLink } from "lucide-react";
import { RenderDescription } from "@/components/rich-text-editor/render-description";
import { Card, CardContent } from "@/components/ui/card";
import { ForwardButton } from "@/components/ui/forward-button";
import { ThumbnailImageClient } from "../../courses/[slug]/_components/thumbnail-image-client";
import { getDifficultyColor, getCategoryColor, formatDifficulty } from "@/lib/lesson-utils";
import { cn } from "@/lib/utils";

interface Params {
  params: Promise<{ slug: string }>;
}

export default async function PublicLessonSlugPage({ params }: Params) {
  const { slug } = await params;
  const lesson = await getPublicLesson(slug);
  const totalRecordings = lesson.walkthroughs.length;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 my-5">
      <div className="order-1 lg:col-span-2">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-lg">
          <ThumbnailImageClient
            thumbnail={lesson.thumbnailKey || ""}
            title={lesson.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold tracking-tight">
                {lesson.title}
              </h1>
              {lesson.leetCodeSlug && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-x-2"
                  asChild
                >
                  <a
                    href={`https://leetcode.com/problems/${lesson.leetCodeSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    LeetCode
                  </a>
                </Button>
              )}
            </div>
            {lesson.description && (
              <div className="text-muted-foreground text-lg leading-relaxed">
                <RenderDescription json={JSON.parse(lesson.description)} />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {lesson.difficulty && (
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1 px-3 py-1",
                  getDifficultyColor(lesson.difficulty)
                )}
              >
                {formatDifficulty(lesson.difficulty)}
              </Badge>
            )}
            {lesson.categories && lesson.categories.length > 0 && (
              <>
                {lesson.categories.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className={cn(
                      "flex items-center gap-1 px-3 py-1",
                      getCategoryColor(category)
                    )}
                  >
                    {category}
                  </Badge>
                ))}
              </>
            )}
            <Badge className="flex items-center gap-1 px-3 py-1">
              <IconClock className="size-4" />
              <span>{new Date(lesson.createdAt).toLocaleDateString()}</span>
            </Badge>
          </div>
        </div>

        {totalRecordings > 0 && (
          <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-semibold tracking-tight">
                Interactive Code Walkthroughs
              </h2>
              <div>
                {totalRecordings} walkthrough{totalRecordings > 1 ? "s" : ""}
              </div>
            </div>

            <div className="space-y-4">
              {lesson.walkthroughs.map((walkthrough, idx) => (
                <Card
                  key={walkthrough.id}
                  className="p-0 overflow-hidden border-2 transition-all duration-200 hover:shadow-md"
                >
                  <CardContent className="p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <span className="text-sm font-semibold">
                          {walkthrough.position || idx + 1}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          {walkthrough.walkthrough.name}
                        </h3>
                        {walkthrough.walkthrough.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {walkthrough.walkthrough.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {walkthrough.walkthrough.updatedAt !==
                          walkthrough.walkthrough.createdAt
                            ? "Updated"
                            : "Created"}
                          :{" "}
                          {walkthrough.walkthrough.updatedAt !==
                          walkthrough.walkthrough.createdAt
                            ? new Date(
                                walkthrough.walkthrough.updatedAt
                              ).toLocaleDateString()
                            : new Date(
                                walkthrough.walkthrough.createdAt
                              ).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          Interactive Walkthrough
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="order-2 lg:col-span-1">
        <div className="sticky top-22">
          <Card className="py-0">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Lesson Stats</h3>
              </div>

              <div className="space-y-3 mb-6 rounded-lg bg-muted p-4">
                <h4 className="font-medium">What this lesson includes:</h4>
                <div className="flex flex-col gap-3">
                  {lesson.videoKey && (
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <IconVideo className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Video Content</p>
                        <p className="text-sm text-muted-foreground">
                          Full lesson video available
                        </p>
                      </div>
                    </div>
                  )}

                  {totalRecordings > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <IconMicrophone className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Interactive Code Walkthroughs
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {totalRecordings} walkthrough
                          {totalRecordings > 1 ? "s" : ""} available
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <IconClock className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {lesson.updatedAt !== lesson.createdAt
                          ? "Updated"
                          : "Created"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lesson.updatedAt !== lesson.createdAt
                          ? new Date(lesson.updatedAt).toLocaleDateString()
                          : new Date(lesson.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {totalRecordings > 0 && (
                <div className="mb-6 space-y-3">
                  <h4>Interactive Walkthroughs:</h4>
                  <ul className="space-y-2">
                    {lesson.walkthroughs.map((walkthrough, index) => (
                      <li
                        key={walkthrough.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="rounded-full bg-accent text-accent-foreground p-1">
                          <span className="text-xs font-medium px-2">
                            {walkthrough.position || index + 1}
                          </span>
                        </div>
                        <span>{walkthrough.walkthrough.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-4">
                <ForwardButton
                  href={`/dashboard/lessons/${slug}`}
                  label="View Lesson"
                  variant="default"
                  className="w-full"
                />
                <ForwardButton
                  href="/lessons"
                  label="Browse More Lessons"
                  variant="secondary"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
