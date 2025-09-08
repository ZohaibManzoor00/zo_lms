export const customThemes = [
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
  "calypso",
];

export interface Theme {
  name: string;
  label: string;
  description: string;
  color: string;
  fontFamily?: string;
}

export const themes: Theme[] = [
  {
    name: "light",
    label: "Default",
    description: "Clean and minimal",
    color: "#6366f1",
    fontFamily: "Geist",
  },
  {
    name: "ocean",
    label: "Ocean",
    description: "Deep blue tones",
    color: "#3b82f6",
    fontFamily: "Geist",
  },
  {
    name: "sunset",
    label: "Sunset",
    description: "Warm orange hues",
    color: "#f97316",
    fontFamily: "Geist",
  },
  {
    name: "forest",
    label: "Forest",
    description: "Natural green theme",
    color: "#22c55e",
    fontFamily: "Geist",
  },
  {
    name: "coffee",
    label: "Coffee",
    description: "Rich coffee browns",
    color: "#92400e",
    fontFamily: "Geist",
  },
  {
    name: "lavender",
    label: "Lavender",
    description: "Soft purple elegance",
    color: "#8b5cf6",
    fontFamily: "Inter",
  },
  {
    name: "rose",
    label: "Rose",
    description: "Gentle pink warmth",
    color: "#e11d48",
    fontFamily: "Poppins",
  },
  {
    name: "mint",
    label: "Mint",
    description: "Fresh mint green",
    color: "#10b981",
    fontFamily: "Nunito",
  },
  {
    name: "slate",
    label: "Slate",
    description: "Modern gray tones",
    color: "#64748b",
    fontFamily: "Inter",
  },
  {
    name: "crimson",
    label: "Crimson",
    description: "Bold red energy",
    color: "#dc2626",
    fontFamily: "Montserrat",
  },
  {
    name: "amber",
    label: "Amber",
    description: "Golden yellow glow",
    color: "#f59e0b",
    fontFamily: "Work Sans",
  },
  {
    name: "teal",
    label: "Teal",
    description: "Calm blue-green",
    color: "#14b8a6",
    fontFamily: "Rubik",
  },
  {
    name: "calypso",
    label: "Calypso",
    description: "Elegant coral and blue",
    color: "#4f46e5",
    fontFamily: "Space Grotesk",
  },
];

// Get the base theme (without -dark suffix)
export const getBaseTheme = (currentTheme: string | undefined) => {
  if (!currentTheme) return "light";
  if (currentTheme === "dark") return "light";
  return currentTheme.replace("-dark", "");
};

// Check if current theme is dark variant
export const isDarkVariant = (currentTheme: string | undefined) => {
  return currentTheme?.endsWith("-dark") || currentTheme === "dark";
};

// Check if a theme is a custom theme
export const isCustomTheme = (theme: string) => {
  return customThemes.includes(theme);
};
