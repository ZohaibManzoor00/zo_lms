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
];

export const themes = [
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
