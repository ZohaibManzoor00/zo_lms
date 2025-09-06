"use client";

import React from "react";
import { Palette, Check } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themes = [
  {
    name: "light",
    label: "Default",
    description: "Clean and minimal",
  },
  {
    name: "ocean",
    label: "Ocean",
    description: "Deep blue tones",
  },
  {
    name: "sunset",
    label: "Sunset",
    description: "Warm orange hues",
  },
  {
    name: "forest",
    label: "Forest",
    description: "Natural green theme",
  },
  {
    name: "coffee",
    label: "Coffee",
    description: "Rich coffee browns",
  },
  {
    name: "lavender",
    label: "Lavender",
    description: "Soft purple elegance",
  },
  {
    name: "rose",
    label: "Rose",
    description: "Gentle pink warmth",
  },
  {
    name: "mint",
    label: "Mint",
    description: "Fresh mint green",
  },
  {
    name: "slate",
    label: "Slate",
    description: "Modern gray tones",
  },
  {
    name: "crimson",
    label: "Crimson",
    description: "Bold red energy",
  },
  {
    name: "amber",
    label: "Amber",
    description: "Golden yellow glow",
  },
  {
    name: "teal",
    label: "Teal",
    description: "Calm blue-green",
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  // Get the base theme (without -dark suffix)
  const getBaseTheme = (currentTheme: string | undefined) => {
    if (!currentTheme) return "light";
    if (currentTheme === "dark") return "light";
    return currentTheme.replace("-dark", "");
  };

  // Check if current theme is dark variant
  const isDarkVariant = (currentTheme: string | undefined) => {
    return currentTheme?.endsWith("-dark") || currentTheme === "dark";
  };

  const handleThemeSelect = (selectedTheme: string) => {
    const currentIsDark = isDarkVariant(theme);

    // If selecting the default theme, use light/dark
    if (selectedTheme === "light") {
      setTheme(currentIsDark ? "dark" : "light");
    } else {
      // For custom themes, append -dark if currently in dark mode
      const customThemes = [
        "ocean",
        "sunset",
        "forest",
        "coffee",
        "lavender",
        "rose",
        "mint",
        "slate",
        "crimson",
        "amber",
        "teal",
      ];
      if (customThemes.includes(selectedTheme)) {
        setTheme(currentIsDark ? `${selectedTheme}-dark` : selectedTheme);
      } else {
        // Fallback for any other themes
        setTheme(selectedTheme);
      }
    }
  };

  const baseTheme = getBaseTheme(theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9">
          <Palette className="size-[1.2rem]" />
          <span className="sr-only">Select theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.name}
            onClick={() => handleThemeSelect(themeOption.name)}
            className="flex items-center justify-between p-3 cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{themeOption.label}</span>
              <span className="text-sm text-muted-foreground">
                {themeOption.description}
              </span>
            </div>
            {baseTheme === themeOption.name && (
              <Check className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
