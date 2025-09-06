"use client";

import React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

import {
  AnimationStart,
  AnimationVariant,
  createAnimation,
} from "./theme-animations";

interface ThemeToggleAnimationProps {
  variant?: AnimationVariant;
  start?: AnimationStart;
  showLabel?: boolean;
  url?: string;
}

export function ThemeToggle({
  variant = "circle-blur",
  start = "top-right",
  showLabel = false,
  url = "",
}: ThemeToggleAnimationProps) {
  const { theme, setTheme } = useTheme();

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

  const toggleTheme = React.useCallback(() => {
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
      } else if (
        [
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
        ].includes(theme)
      ) {
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

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="w-9 p-0 h-9 relative group"
      name="Theme Toggle Button"
    >
      <SunIcon className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Theme Toggle </span>
      {showLabel && (
        <>
          <span className="hidden group-hover:block border rounded-full px-2 absolute -top-10">
            {" "}
            variant = {variant}
          </span>
          <span className="hidden group-hover:block border rounded-full px-2 absolute -bottom-10">
            {" "}
            start = {start}
          </span>
        </>
      )}
    </Button>
  );
}
