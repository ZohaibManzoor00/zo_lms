import { LessonDifficulty } from "@/lib/generated/prisma";

// LeetCode-inspired difficulty colors - consistent outline style across themes
export const getDifficultyColor = (
  difficulty: LessonDifficulty | string | null
) => {
  if (!difficulty) return "border-border text-muted-foreground";

  const difficultyMap: Record<string, string> = {
    VeryEasy:
      "border-green-500 text-green-600 bg-transparent hover:bg-green-50/20",
    Easy: "border-green-500 text-green-600 bg-transparent hover:bg-green-50/20",
    Medium:
      "border-orange-500 text-orange-600 bg-transparent hover:bg-orange-50/20",
    Hard: "border-red-500 text-red-600 bg-transparent hover:bg-red-50/20",
    VeryHard: "border-red-600 text-red-700 bg-transparent hover:bg-red-50/20",
  };

  return difficultyMap[difficulty] || "border-border text-muted-foreground";
};

// Category colors - consistent outline style across themes
export const getCategoryColor = (category: string | null) => {
  if (!category) return "border-border text-muted-foreground";

  // Simple hash function to consistently map categories to colors
  const hash = category
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorOptions = [
    "border-blue-500 text-blue-600 bg-transparent hover:bg-blue-50/20",
    "border-purple-500 text-purple-600 bg-transparent hover:bg-purple-50/20",
    "border-indigo-500 text-indigo-600 bg-transparent hover:bg-indigo-50/20",
    "border-pink-500 text-pink-600 bg-transparent hover:bg-pink-50/20",
    "border-teal-500 text-teal-600 bg-transparent hover:bg-teal-50/20",
    "border-cyan-500 text-cyan-600 bg-transparent hover:bg-cyan-50/20",
    "border-emerald-500 text-emerald-600 bg-transparent hover:bg-emerald-50/20",
    "border-amber-500 text-amber-600 bg-transparent hover:bg-amber-50/20",
  ];

  return colorOptions[hash % colorOptions.length];
};

// Format difficulty display text
export const formatDifficulty = (
  difficulty: LessonDifficulty | string | null
) => {
  if (!difficulty) return null;
  return difficulty.replace(/([A-Z])/g, " $1").trim();
};

// Duration formatter (if you want to add duration later)
export const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};
