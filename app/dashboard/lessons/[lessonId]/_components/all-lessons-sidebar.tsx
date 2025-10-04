"use client";

import { useState, useMemo } from "react";
import { LessonType } from "@/app/data/lesson/get-all-lessons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  PlayIcon,
  School,
  BookIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useConstructUrl } from "@/hooks/use-construct-url";
import Image from "next/image";
import { IconBook } from "@tabler/icons-react";

interface Props {
  lessons: LessonType[];
  currentLessonId?: string;
}

export function AllLessonsSidebar({ lessons, currentLessonId }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return lessons;

    return lessons.filter(
      (lesson) =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lesson.description &&
          lesson.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [lessons, searchQuery]);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col h-full w-16 transition-all duration-300 ease-in-out">
        <div className="px-4 pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleCollapse}
            className="w-full h-8 p-0 hover:bg-muted transition-colors duration-200"
            onKeyDown={(e) => {
              // Prevent keyboard activation, only allow mouse clicks
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
              }
            }}
          >
            <ChevronRight className="size-4 transition-transform duration-200" />
          </Button>
        </div>
        <div className="border-b border-border mx-2" />
        <div className="flex-1 flex flex-col items-center py-4 space-y-2 opacity-100 transition-opacity duration-300 delay-150">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-200">
            <IconBook className="size-4 text-primary" />
          </div>
          <div className="text-xs text-muted-foreground text-center leading-tight transition-all duration-200">
            {lessons.length}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-80 transition-all duration-300 ease-in-out">
      <div className="pb-4 pr-4">
        <div className="flex items-center gap-3 mb-3 opacity-100 transition-opacity duration-300 delay-150">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-all duration-200">
            <IconBook className="size-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-base leading-tight truncate font-semibold transition-all duration-200">
              All Lessons
            </h1>
            <p className="text-xs mt-1 truncate text-muted-foreground transition-all duration-200">
              Browse all available lessons
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleCollapse}
            className="h-8 w-8 p-0 hover:bg-muted shrink-0 transition-colors duration-200"
            onKeyDown={(e) => {
              // Prevent keyboard activation, only allow mouse clicks
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
              }
            }}
          >
            <ChevronLeft className="size-4 transition-transform duration-200 hover:scale-110" />
          </Button>
        </div>

        <div className="space-y-2 opacity-100 transition-opacity duration-300 delay-150">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4 transition-all duration-200" />
            <Input
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <p className="text-xs text-muted-foreground transition-all duration-200">
            {filteredLessons.length} lesson
            {filteredLessons.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      <div className="border-b border-border mr-4" />

      <div className="py-4 pr-4 space-y-3 h-[75dvh] overflow-y-auto opacity-100 transition-opacity duration-300 delay-150">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-8 transition-all duration-200">
            <BookIcon className="size-12 text-muted-foreground mx-auto mb-3 transition-all duration-200" />
            <p className="text-muted-foreground transition-all duration-200">
              No lessons found
            </p>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-1 transition-all duration-200">
                Try adjusting your search terms
              </p>
            )}
          </div>
        ) : (
          filteredLessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="opacity-100 transition-all duration-200 relative px-1"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <LessonSidebarItem
                lesson={lesson}
                isActive={lesson.id === currentLessonId}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface LessonSidebarItemProps {
  lesson: LessonType;
  isActive: boolean;
}

function LessonSidebarItem({ lesson, isActive }: LessonSidebarItemProps) {
  const thumbnailUrl = useConstructUrl(lesson.thumbnailKey || "");
  const hasVideo = !!lesson.videoKey;
  const hasWalkthrough = lesson.walkthroughs && lesson.walkthroughs.length > 0;

  return (
    <Link
      href={`/dashboard/lessons/${lesson.id}`}
      className={cn(
        "w-full p-2.5 h-auto justify-start transition-all duration-300 ease-in-out rounded-md border block transform hover:scale-[1.02] hover:shadow-sm relative hover:z-10",
        isActive
          ? "bg-primary/10 dark:bg-primary/20 border-primary/50 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary shadow-sm scale-[1.01] z-10"
          : "border-border hover:bg-muted/50 hover:border-primary/30 z-0"
      )}
    >
      <div className="flex items-center gap-2.5 w-full min-w-0">
        <div className="shrink-0">
          <div className="relative w-8 h-6 rounded overflow-hidden bg-muted transition-all duration-200 hover:shadow-sm">
            {lesson.thumbnailKey ? (
              <Image
                src={thumbnailUrl}
                alt={lesson.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-110"
                sizes="32px"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookIcon className="size-3 text-muted-foreground transition-all duration-200" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-xs font-medium truncate leading-tight transition-all duration-200",
              isActive ? "text-primary font-semibold" : "text-foreground"
            )}
          >
            {lesson.title}
          </p>

          <div className="flex items-center gap-1 mt-1">
            {hasVideo && (
              <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground transition-all duration-200 hover:text-primary">
                <PlayIcon className="size-2.5 transition-transform duration-200 hover:scale-110" />
              </span>
            )}
            {hasWalkthrough && (
              <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground transition-all duration-200 hover:text-primary">
                <School className="size-2.5 transition-transform duration-200 hover:scale-110" />
              </span>
            )}
            {isActive && (
              <span className="text-xs font-medium text-primary ml-auto transition-all duration-200 animate-pulse">
                Viewing
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
