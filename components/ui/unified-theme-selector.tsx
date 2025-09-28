"use client";

import React from "react";
import { Palette, Check, Sun, Moon, Eye } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  themes,
  getBaseTheme,
  isDarkVariant,
  isCustomTheme,
  customThemes,
} from "@/lib/custom-themes";
import {
  AnimationStart,
  AnimationVariant,
  createAnimation,
} from "./theme-animations";

interface UnifiedThemeSelectorProps {
  variant?: AnimationVariant;
  start?: AnimationStart;
  url?: string;
}

export function UnifiedThemeSelector({
  variant = "circle-blur",
  start = "top-right",
  url = "",
}: UnifiedThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  const [originalTheme, setOriginalTheme] = React.useState<string | undefined>(
    undefined
  );
  const [isHovering, setIsHovering] = React.useState(false);

  const styleId = "theme-transition-styles";

  const updateStyles = React.useCallback((css: string) => {
    if (typeof window === "undefined") return;

    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;
  }, []);

  const toggleLightDark = React.useCallback(() => {
    const animation = createAnimation(variant, start, url);
    updateStyles(animation.css);

    if (typeof window === "undefined") return;

    const switchTheme = () => {
      if (!theme) {
        setTheme("dark");
        return;
      }

      if (theme === "light") {
        setTheme("dark");
      } else if (theme === "dark") {
        setTheme("light");
      } else if (theme.endsWith("-dark")) {
        const baseTheme = theme.replace("-dark", "");
        setTheme(baseTheme);
      } else if (customThemes.includes(theme)) {
        setTheme(`${theme}-dark`);
      } else {
        setTheme("dark");
      }
    };

    if (!document.startViewTransition) {
      switchTheme();
      return;
    }

    document.startViewTransition(switchTheme);
  }, [theme, setTheme, variant, start, url, updateStyles]);

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
  const currentIsDark = isDarkVariant(theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9 relative group">
          <Palette className="size-[1.2rem]" />
          <span className="sr-only">Theme & appearance settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-2"
        onMouseLeave={handleStopHovering}
      >
        {/* Light/Dark Mode Toggle */}
        <div className="p-2 mb-2">
          <div className="flex items-center gap-1">
            <Button
              onClick={() => {
                const animation = createAnimation(variant, start, url);
                updateStyles(animation.css);

                if (typeof window === "undefined") return;

                const switchToLight = () => {
                  if (!theme) {
                    setTheme("light");
                    return;
                  }

                  if (theme === "dark") {
                    setTheme("light");
                  } else if (theme.endsWith("-dark")) {
                    const baseTheme = theme.replace("-dark", "");
                    setTheme(baseTheme);
                  } else {
                    // Already light, do nothing
                  }
                };

                if (!document.startViewTransition) {
                  switchToLight();
                  return;
                }

                document.startViewTransition(switchToLight);
              }}
              variant={!currentIsDark ? "default" : "ghost"}
              size="sm"
              className="flex-1 h-8 gap-2"
            >
              <Sun className="size-4" />
              <span className="text-xs">Light</span>
            </Button>
            <Button
              onClick={() => {
                const animation = createAnimation(variant, start, url);
                updateStyles(animation.css);

                if (typeof window === "undefined") return;

                const switchToDark = () => {
                  if (!theme) {
                    setTheme("dark");
                    return;
                  }

                  if (theme === "light") {
                    setTheme("dark");
                  } else if (customThemes.includes(theme)) {
                    setTheme(`${theme}-dark`);
                  } else if (!theme.endsWith("-dark")) {
                    setTheme(`${theme}-dark`);
                  } else {
                    // Already dark, do nothing
                  }
                };

                if (!document.startViewTransition) {
                  switchToDark();
                  return;
                }

                document.startViewTransition(switchToDark);
              }}
              variant={currentIsDark ? "default" : "ghost"}
              size="sm"
              className="flex-1 h-8 gap-2"
            >
              <Moon className="size-4" />
              <span className="text-xs">Dark</span>
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Theme Selection */}
        <div className="p-2">
          <div className="grid grid-cols-2 gap-1">
            {themes.map((themeOption) => (
              <DropdownMenuItem
                key={themeOption.name}
                onClick={() => handleThemeSelect(themeOption.name)}
                onMouseEnter={() => handleThemeHover(themeOption.name)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors rounded-lg border-2"
                style={{
                  borderColor:
                    baseTheme === themeOption.name
                      ? themeOption.color
                      : "transparent",
                }}
                asChild
              >
                <div>
                  <div
                    className="size-4 rounded-full border border-border shrink-0"
                    style={{ backgroundColor: themeOption.color }}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className="font-medium text-sm truncate"
                      style={{
                        fontFamily: themeOption.fontFamily
                          ? `${themeOption.fontFamily}, system-ui, sans-serif`
                          : undefined,
                      }}
                    >
                      {themeOption.label}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {themeOption.description}
                    </span>
                  </div>
                  <div suppressHydrationWarning className="shrink-0">
                    {baseTheme === themeOption.name && (
                      <Check className="size-3 text-primary" />
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Design System Link */}
        <div className="p-2">
          <Link href="/testing">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Eye className="size-3" />
              View complete design system
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
