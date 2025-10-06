"use client";

import { useState, useMemo, useEffect, useOptimistic } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LessonType } from "@/app/data/lesson/get-all-lessons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { IconBook } from "@tabler/icons-react";
import { ProgressSection } from "./progress-section";
import { LessonsList } from "./lessons-list";
import { LessonProgress } from "@/lib/generated/prisma";

interface Props {
  lessons: LessonType[];
  currentLessonId?: string;
}

export function AllLessonsSidebar({ lessons, currentLessonId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // Optimistic lesson updates for real-time progress
  const [optimisticLessons, setOptimisticLessons] = useOptimistic(
    lessons,
    (
      currentLessons,
      { lessonId, completed }: { lessonId: string; completed: boolean }
    ) => {
      return currentLessons.map((lesson) =>
        lesson.id === lessonId
          ? {
              ...lesson,
              completed,
              lessonProgress:
                lesson.lessonProgress?.length > 0
                  ? [{ ...lesson.lessonProgress[0], completed }]
                  : ([{ completed }] as LessonProgress[]),
            }
          : lesson
      );
    }
  );

  // Valid filter options and limits
  const VALID_LEVELS = ["very-easy", "easy", "medium", "hard", "very-hard"];
  const VALID_STATUSES = ["completed", "in-progress", "not-started"];
  const MAX_SEARCH_LENGTH = 100;
  const MAX_FILTER_SELECTIONS = 10; // Prevent URL manipulation with excessive selections

  // Handle completion change with optimistic update
  const handleCompletionChange = (lessonId: string, completed: boolean) => {
    setOptimisticLessons({ lessonId, completed });
  };

  // Initialize filters from URL params
  useEffect(() => {
    const query = searchParams.get("search") || "";
    const levelsParam = searchParams.get("levels");
    const statusesParam = searchParams.get("statuses");

    // Validate and filter levels
    const levels = levelsParam
      ? levelsParam
          .split(",")
          .map((level) => level.trim())
          .filter((level) => VALID_LEVELS.includes(level))
          .slice(0, MAX_FILTER_SELECTIONS)
      : [];

    // Validate and filter statuses
    const statuses = statusesParam
      ? statusesParam
          .split(",")
          .map((status) => status.trim())
          .filter((status) => VALID_STATUSES.includes(status))
          .slice(0, MAX_FILTER_SELECTIONS)
      : [];

    // Sanitize search query
    const sanitizedQuery = query
      .replace(/[<>]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .slice(0, MAX_SEARCH_LENGTH);

    // Only update if values are different
    setSearchQuery((prev) => (prev !== sanitizedQuery ? sanitizedQuery : prev));
    setSelectedLevels((prev) =>
      JSON.stringify(prev) !== JSON.stringify(levels) ? levels : prev
    );
    setSelectedStatuses((prev) =>
      JSON.stringify(prev) !== JSON.stringify(statuses) ? statuses : prev
    );
  }, [searchParams]);

  // Update URL params when filters change
  const updateUrlParams = (
    search: string,
    levels: string[],
    statuses: string[]
  ) => {
    const params = new URLSearchParams();

    const sanitizedSearch = search
      .replace(/[<>]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .slice(0, MAX_SEARCH_LENGTH);
    if (sanitizedSearch) params.set("search", sanitizedSearch);

    const validLevels = levels
      .filter((level) => VALID_LEVELS.includes(level))
      .slice(0, MAX_FILTER_SELECTIONS);
    if (validLevels.length) params.set("levels", validLevels.join(","));

    const validStatuses = statuses
      .filter((status) => VALID_STATUSES.includes(status))
      .slice(0, MAX_FILTER_SELECTIONS);
    if (validStatuses.length) params.set("statuses", validStatuses.join(","));

    const newUrl = `${pathname}${
      params.toString() ? "?" + params.toString() : ""
    }`;
    router.replace(newUrl, { scroll: false });
  };

  const filteredLessons = useMemo(() => {
    let filtered = optimisticLessons;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (lesson.description &&
            lesson.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by status
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((lesson) => {
        return selectedStatuses.some((status) => {
          if (status === "completed")
            return lesson.completed || lesson.lessonProgress?.[0]?.completed;
          if (status === "not-started")
            return !lesson.completed && !lesson.lessonProgress?.[0]?.completed;
          if (status === "in-progress") return false;
          return false;
        });
      });
    }

    // Filter by difficulty levels
    if (selectedLevels.length > 0) {
      filtered = filtered.filter((lesson) => {
        if (!lesson.difficulty) return false;
        const difficultyMap: Record<string, string> = {
          "very-easy": "VeryEasy",
          easy: "Easy",
          medium: "Medium",
          hard: "Hard",
          "very-hard": "VeryHard",
        };
        return selectedLevels.some(
          (level) => difficultyMap[level] === lesson.difficulty
        );
      });
    }

    return filtered;
  }, [optimisticLessons, searchQuery, selectedStatuses, selectedLevels]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    const sanitizedValue = value
      .replace(/[<>]/g, "")
      .replace(/[^\w\s-]/g, "")
      .slice(0, MAX_SEARCH_LENGTH);

    setSearchQuery(sanitizedValue);
    updateUrlParams(sanitizedValue, selectedLevels, selectedStatuses);
  };

  // Handle level selection
  const handleLevelToggle = (level: string) => {
    if (!VALID_LEVELS.includes(level)) return;

    const newLevels = selectedLevels.includes(level)
      ? selectedLevels.filter((l) => l !== level)
      : [...selectedLevels, level].slice(0, MAX_FILTER_SELECTIONS);

    setSelectedLevels(newLevels);
    updateUrlParams(searchQuery, newLevels, selectedStatuses);
  };

  // Handle status selection
  const handleStatusToggle = (status: string) => {
    if (!VALID_STATUSES.includes(status)) return;

    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status].slice(0, MAX_FILTER_SELECTIONS);

    setSelectedStatuses(newStatuses);
    updateUrlParams(searchQuery, selectedLevels, newStatuses);
  };

  // Get display text for filter buttons
  const getLevelsDisplayText = () => {
    if (selectedLevels.length === 0) return "All Levels";
    if (selectedLevels.length === 1)
      return selectedLevels[0]
        .replace("-", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    return `${selectedLevels.length} Levels`;
  };

  const getStatusesDisplayText = () => {
    if (selectedStatuses.length === 0) return "All Status";
    if (selectedStatuses.length === 1)
      return selectedStatuses[0]
        .replace("-", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    return `${selectedStatuses.length} Statuses`;
  };

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
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
              }
            }}
          >
            <ChevronLeft className="size-4 transition-transform duration-200 hover:scale-110" />
          </Button>
        </div>

        {/* Progress Section */}
        <ProgressSection
          lessons={optimisticLessons}
          filteredLessonsCount={filteredLessons.length}
        />

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4 transition-all duration-200" />
          <Input
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex gap-2 mt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 h-9 justify-between">
                <span className="truncate">{getLevelsDisplayText()}</span>
                <ChevronDown className="size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuCheckboxItem
                checked={selectedLevels.includes("very-easy")}
                onCheckedChange={() => handleLevelToggle("very-easy")}
              >
                Very Easy
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedLevels.includes("easy")}
                onCheckedChange={() => handleLevelToggle("easy")}
              >
                Easy
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedLevels.includes("medium")}
                onCheckedChange={() => handleLevelToggle("medium")}
              >
                Medium
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedLevels.includes("hard")}
                onCheckedChange={() => handleLevelToggle("hard")}
              >
                Hard
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedLevels.includes("very-hard")}
                onCheckedChange={() => handleLevelToggle("very-hard")}
              >
                Very Hard
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 h-9 justify-between">
                <span className="truncate">{getStatusesDisplayText()}</span>
                <ChevronDown className="size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes("completed")}
                onCheckedChange={() => handleStatusToggle("completed")}
              >
                Completed
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes("in-progress")}
                onCheckedChange={() => handleStatusToggle("in-progress")}
              >
                In Progress
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes("not-started")}
                onCheckedChange={() => handleStatusToggle("not-started")}
              >
                Not Started
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border-b border-border mr-4" />

      <div className="py-4 pr-4 space-y-3 h-[60dvh] overflow-y-auto opacity-100 transition-opacity duration-300 delay-150">
        <LessonsList
          lessons={filteredLessons}
          currentLessonId={currentLessonId}
          onCompletionChange={handleCompletionChange}
        />
      </div>
    </div>
  );
}
