"use client";

import React, { useEffect, useState } from "react";
import ElectricBorder from "./ElectricBorder";

type ThemeElectricBorderProps = {
  children: React.ReactNode;
  colorTheme?: "primary" | "secondary" | "accent" | "destructive" | "muted";
  customColor?: string;
  speed?: number;
  chaos?: number;
  thickness?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function ThemeElectricBorder({
  children,
  colorTheme = "primary",
  customColor,
  speed = 1,
  chaos = 1,
  thickness = 2,
  className,
  style,
}: ThemeElectricBorderProps) {
  const [color, setColor] = useState("#0ea5e9");

  useEffect(() => {
    if (customColor) {
      setColor(customColor);
      return;
    }

    const getThemeColor = () => {
      const div = document.createElement("div");
      div.className = `text-${colorTheme}`;
      document.body.appendChild(div);

      const computedColor = getComputedStyle(div).color;
      document.body.removeChild(div);

      return computedColor || "#0ea5e9";
    };

    // Set initial color
    setColor(getThemeColor());

    // Listen for theme changes on the document element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "class" ||
            mutation.attributeName === "data-theme")
        ) {
          // Small delay to ensure CSS has updated
          setTimeout(() => {
            setColor(getThemeColor());
          }, 50);
        }
      });
    });

    // Observe changes to the document element (where theme classes are typically applied)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });

    // Also listen for storage events (in case theme is stored in localStorage)
    const handleStorageChange = () => {
      setTimeout(() => {
        setColor(getThemeColor());
      }, 50);
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [colorTheme, customColor]);

  return (
    <ElectricBorder
      color={color}
      speed={speed}
      chaos={chaos}
      thickness={thickness}
      className={className}
      style={style}
    >
      {children}
    </ElectricBorder>
  );
}
