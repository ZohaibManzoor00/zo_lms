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
import {
  themes,
  customThemes,
  getBaseTheme,
  isDarkVariant,
  isCustomTheme,
} from "@/lib/custom-themes";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [originalTheme, setOriginalTheme] = React.useState<string | undefined>(
    undefined
  );
  const [isHovering, setIsHovering] = React.useState(false);

  const handleThemeSelect = (selectedTheme: string) => {
    const currentIsDark = isDarkVariant(originalTheme || theme);

    // Reset hover state and clear original theme
    setIsHovering(false);
    setOriginalTheme(undefined);

    // If selecting the default theme, use light/dark
    if (selectedTheme === "light") {
      setTheme(currentIsDark ? "dark" : "light");
    } else {
      // For custom themes, append -dark if currently in dark mode
      if (isCustomTheme(selectedTheme)) {
        setTheme(currentIsDark ? `${selectedTheme}-dark` : selectedTheme);
      } else {
        // Fallback for any other themes
        setTheme(selectedTheme);
      }
    }
  };

  const handleThemeHover = (hoveredTheme: string) => {
    if (!isHovering) {
      setOriginalTheme(theme);
      setIsHovering(true);
    }

    const currentIsDark = isDarkVariant(originalTheme || theme);

    if (hoveredTheme === "light") {
      setTheme(currentIsDark ? "dark" : "light");
    } else {
      if (isCustomTheme(hoveredTheme)) {
        setTheme(currentIsDark ? `${hoveredTheme}-dark` : hoveredTheme);
      } else {
        setTheme(hoveredTheme);
      }
    }
  };

  const handleStopHovering = () => {
    if (isHovering && originalTheme) {
      // Restore the original theme when stopping hover
      setTheme(originalTheme);
      setIsHovering(false);
      setOriginalTheme(undefined);
    }
  };

  const baseTheme = getBaseTheme(originalTheme || theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9">
          <Palette className="size-[1.2rem]" />
          <span className="sr-only">Select theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64"
        onMouseLeave={handleStopHovering}
      >
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.name}
            onClick={() => handleThemeSelect(themeOption.name)}
            onMouseEnter={() => handleThemeHover(themeOption.name)}
            className="flex items-center justify-between p-3 cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{themeOption.label}</span>
              <span className="text-sm text-muted-foreground">
                {themeOption.description}
              </span>
            </div>
            <div suppressHydrationWarning>
              {baseTheme === themeOption.name && (
                <Check className="size-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
