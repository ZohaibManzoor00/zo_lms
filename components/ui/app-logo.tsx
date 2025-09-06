"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

interface AppLogoProps {
  href?: string;
  size?: number;
}

function LogoSVG({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const { theme } = useTheme();

  // Define colors for each theme
  const getLogoColor = () => {
    switch (theme) {
      case "light":
        return "oklch(0.205 0 0)"; // Dark for light theme
      case "dark":
        return "oklch(0.985 0 0)"; // Light for dark theme
      case "ocean":
        return "oklch(0.55 0.15 215)"; // Ocean primary
      case "ocean-dark":
        return "oklch(0.70 0.18 210)"; // Ocean dark primary
      case "sunset":
        return "oklch(0.62 0.18 35)"; // Sunset primary
      case "sunset-dark":
        return "oklch(0.78 0.20 40)"; // Sunset dark primary
      case "forest":
        return "oklch(0.50 0.16 145)"; // Forest primary
      case "forest-dark":
        return "oklch(0.72 0.18 145)"; // Forest dark primary
      case "coffee":
        return "oklch(0.4341 0.0392 41.9938)"; // Coffee primary
      case "coffee-dark":
        return "oklch(0.9247 0.0524 66.1732)"; // Coffee dark primary
      case "lavender":
        return "oklch(0.58 0.18 285)"; // Lavender primary
      case "lavender-dark":
        return "oklch(0.75 0.20 290)"; // Lavender dark primary
      case "rose":
        return "oklch(0.65 0.18 20)"; // Rose primary
      case "rose-dark":
        return "oklch(0.78 0.20 25)"; // Rose dark primary
      case "mint":
        return "oklch(0.55 0.16 165)"; // Mint primary
      case "mint-dark":
        return "oklch(0.72 0.18 165)"; // Mint dark primary
      case "slate":
        return "oklch(0.45 0.08 240)"; // Slate primary
      case "slate-dark":
        return "oklch(0.68 0.12 240)"; // Slate dark primary
      case "crimson":
        return "oklch(0.58 0.22 10)"; // Crimson primary
      case "crimson-dark":
        return "oklch(0.75 0.24 15)"; // Crimson dark primary
      case "amber":
        return "oklch(0.68 0.16 75)"; // Amber primary
      case "amber-dark":
        return "oklch(0.78 0.18 80)"; // Amber dark primary
      case "teal":
        return "oklch(0.52 0.16 180)"; // Teal primary
      case "teal-dark":
        return "oklch(0.70 0.18 180)"; // Teal dark primary
      default:
        return "currentColor"; // Fallback
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 41 41"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g id="logogram" fill={getLogoColor()}>
        <path d="M18.529 14.2867C19.7573 13.9362 19.8794 10.5388 18.8016 6.69839C17.7239 2.85797 15.8544 0.0288177 14.6261 0.379292C13.3977 0.729766 13.2757 4.12714 14.3534 7.96759C15.4312 11.8079 17.3007 14.6371 18.529 14.2867Z" />
        <path d="M26.1248 8.08707C27.2775 4.26882 27.2219 0.869674 26.0007 0.49485C24.7794 0.120017 22.855 2.91144 21.7023 6.72968C20.5497 10.5479 20.6052 13.9471 21.8265 14.3219C23.0477 14.6967 24.9722 11.9053 26.1248 8.08707Z" />
        <path d="M15.7317 16.0579C16.5771 15.0934 14.858 12.1689 11.8921 9.5258C8.92614 6.88272 5.83646 5.52194 4.99109 6.48642C4.14571 7.45092 5.86478 10.3754 8.83075 13.0185C11.7967 15.6616 14.8864 17.0224 15.7317 16.0579Z" />
        <path d="M31.5523 13.2463C34.5689 10.6622 36.3444 7.77208 35.5178 6.79115C34.6913 5.81019 31.5758 7.10985 28.5592 9.6939C25.5426 12.278 23.7672 15.1681 24.5937 16.1491C25.4202 17.13 28.5357 15.8304 31.5523 13.2463Z" />
        <path d="M14.3271 19.0886C14.5213 17.8164 11.5072 16.2928 7.5951 15.6857C3.68285 15.0785 0.353953 15.6177 0.15976 16.8899C-0.0344332 18.1621 2.97961 19.6855 6.89183 20.2927C10.804 20.8999 14.1329 20.3607 14.3271 19.0886Z" />
        <path d="M33.3469 20.5473C37.2702 20.018 40.3134 18.5548 40.1441 17.2789C39.9749 16.0031 36.6572 15.398 32.7338 15.9271C28.8106 16.4564 25.7673 17.9197 25.9366 19.1955C26.1059 20.4713 29.4235 21.0765 33.3469 20.5473Z" />
        <path d="M9.1521 27.4532C12.7688 25.8311 15.28 23.5628 14.7611 22.3867C14.2424 21.2106 10.89 21.5722 7.2733 23.1943C3.65667 24.8164 1.1454 27.0847 1.66421 28.2608C2.18302 29.4369 5.53546 29.0753 9.1521 27.4532Z" />
        <path d="M38.408 28.6255C38.9497 27.46 36.4833 25.1421 32.8991 23.4484C29.3149 21.7547 25.9702 21.3266 25.4285 22.4921C24.8868 23.6577 27.3532 25.9755 30.9374 27.6692C34.5215 29.3629 37.8663 29.7911 38.408 28.6255Z" />
        <path d="M14.9029 32.2399C17.0755 28.9036 17.9717 25.6262 16.9047 24.9198C15.8375 24.2133 13.2112 26.3451 11.0387 29.6814C8.86604 33.0177 7.96985 36.2949 9.03689 37.0015C10.104 37.708 12.7302 35.5762 14.9029 32.2399Z" />
        <path d="M30.8687 37.2253C31.9494 36.5402 31.1175 33.2456 29.0106 29.8668C26.9036 26.488 24.3195 24.3044 23.2388 24.9895C22.1582 25.6746 22.9901 28.9692 25.097 32.348C27.2039 35.7268 29.7881 37.9105 30.8687 37.2253Z" />
        <path d="M22.3061 33.1463C22.3448 29.1553 21.3414 25.9098 20.0649 25.8972C18.7884 25.8846 17.7222 29.1098 17.6835 33.1007C17.6448 37.0918 18.6483 40.3374 19.9247 40.3499C21.2013 40.3625 22.2675 37.1374 22.3061 33.1463Z" />
      </g>
    </svg>
  );
}

// function Logo1SVG({
//   size = 24,
//   className = "",
// }: {
//   size?: number;
//   className?: string;
// }) {
//   const { theme } = useTheme();

//   // Define colors for each theme (same logic as main logo)
//   const getLogoColor = () => {
//     switch (theme) {
//       case "light":
//         return "oklch(0.205 0 0)"; // Dark for light theme
//       case "dark":
//         return "oklch(0.985 0 0)"; // Light for dark theme
//       case "ocean":
//         return "oklch(0.55 0.15 215)"; // Ocean primary
//       case "ocean-dark":
//         return "oklch(0.70 0.18 210)"; // Ocean dark primary
//       case "sunset":
//         return "oklch(0.62 0.18 35)"; // Sunset primary
//       case "sunset-dark":
//         return "oklch(0.78 0.20 40)"; // Sunset dark primary
//       case "forest":
//         return "oklch(0.50 0.16 145)"; // Forest primary
//       case "forest-dark":
//         return "oklch(0.72 0.18 145)"; // Forest dark primary
//       case "coffee":
//         return "oklch(0.4341 0.0392 41.9938)"; // Coffee primary
//       case "coffee-dark":
//         return "oklch(0.9247 0.0524 66.1732)"; // Coffee dark primary
//       case "lavender":
//         return "oklch(0.58 0.18 285)"; // Lavender primary
//       case "lavender-dark":
//         return "oklch(0.75 0.20 290)"; // Lavender dark primary
//       case "rose":
//         return "oklch(0.65 0.18 20)"; // Rose primary
//       case "rose-dark":
//         return "oklch(0.78 0.20 25)"; // Rose dark primary
//       case "mint":
//         return "oklch(0.55 0.16 165)"; // Mint primary
//       case "mint-dark":
//         return "oklch(0.72 0.18 165)"; // Mint dark primary
//       case "slate":
//         return "oklch(0.45 0.08 240)"; // Slate primary
//       case "slate-dark":
//         return "oklch(0.68 0.12 240)"; // Slate dark primary
//       case "crimson":
//         return "oklch(0.58 0.22 10)"; // Crimson primary
//       case "crimson-dark":
//         return "oklch(0.75 0.24 15)"; // Crimson dark primary
//       case "amber":
//         return "oklch(0.68 0.16 75)"; // Amber primary
//       case "amber-dark":
//         return "oklch(0.78 0.18 80)"; // Amber dark primary
//       case "teal":
//         return "oklch(0.52 0.16 180)"; // Teal primary
//       case "teal-dark":
//         return "oklch(0.70 0.18 180)"; // Teal dark primary
//       default:
//         return "currentColor"; // Fallback
//     }
//   };

//   return (
//     <svg
//       width={size}
//       height={size}
//       viewBox="0 0 40 40"
//       xmlns="http://www.w3.org/2000/svg"
//       className={className}
//     >
//       <path
//         d="M18.9523 11.0726C18.5586 7.69873 18.1429 4.13644 18.1429 0H21.8571C21.8571 4.08998 21.4434 7.64774 21.0502 11.0254C20.7299 13.778 20.4235 16.411 20.3666 19.115C22.2316 17.1697 23.863 15.107 25.572 12.9463C27.6791 10.2823 29.9043 7.46945 32.829 4.54464L35.4554 7.17104C32.5633 10.0631 29.7547 12.2861 27.0884 14.3966L27.0859 14.3985C24.9141 16.1178 22.8365 17.7624 20.885 19.6334C23.579 19.5765 26.1911 19.2717 28.9272 18.9524C32.3011 18.5586 35.8636 18.1429 40 18.1429V21.8571C35.9102 21.8571 32.3524 21.4432 28.9749 21.0502L28.9724 21.05C26.2204 20.7298 23.5882 20.4236 20.885 20.3666C22.829 22.2302 24.8906 23.8609 27.0499 25.5687L27.0533 25.5716C29.7174 27.6789 32.5304 29.9039 35.4554 32.829L32.829 35.4554C29.9369 32.5634 27.714 29.755 25.6038 27.0889L25.5988 27.082L25.5946 27.0765C23.8775 24.9081 22.2349 22.8338 20.3666 20.885C20.4235 23.589 20.7299 26.222 21.0502 28.9746C21.4434 32.3523 21.8571 35.91 21.8571 40H18.1429C18.1429 35.8636 18.5586 32.3013 18.9523 28.9274L18.9531 28.9219C19.272 26.1877 19.5765 23.5772 19.6334 20.885C17.7651 22.8338 16.1225 24.9081 14.4054 27.0765L14.4012 27.082L14.3962 27.0889C12.286 29.755 10.0631 32.5634 7.17104 35.4554L4.54464 32.829C7.46959 29.9039 10.2826 27.6789 12.9467 25.5716L12.9501 25.5687C15.1094 23.8609 17.171 22.2302 19.115 20.3666C16.411 20.4237 13.7779 20.73 11.0251 21.0502C7.6476 21.4432 4.08984 21.8571 0 21.8571V18.1429C4.13644 18.1429 7.69894 18.5586 11.0728 18.9524C13.8089 19.2717 16.421 19.5765 19.115 19.6334C17.1627 17.7617 15.0843 16.1166 12.9116 14.3966C10.2453 12.2861 7.43666 10.0631 4.54464 7.17104L7.17104 4.54464C10.0957 7.46945 12.3209 10.2823 14.428 12.9463C16.137 15.1069 17.7684 17.1696 19.6334 19.1148C19.5765 16.4227 19.272 13.8123 18.9531 11.0781L18.9523 11.0726Z"
//         fill={getLogoColor()}
//       />
//     </svg>
//   );
// }

export function AppLogo({ href = "/", size = 24 }: AppLogoProps) {
  const [isSpinning, setIsSpinning] = useState(false);

  const triggerSpin = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 600);
  };

  return (
    <Link
      href={href}
      onMouseEnter={triggerSpin}
      onClick={triggerSpin}
      className="inline-block"
    >
      <LogoSVG
        size={size}
        className={`transition-transform duration-300 ${
          isSpinning ? "logo-spin-animation" : ""
        }`}
      />
    </Link>
  );
}

export function AppLogoText() {
  return <span className="text-base font-semibold">Zo LMS</span>;
}

interface AppLogoIconProps {
  size?: number;
}

export function AppLogoIcon({ size = 24 }: AppLogoIconProps) {
  const [isSpinning, setIsSpinning] = useState(false);

  const triggerSpin = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 600);
  };

  return (
    <div
      onMouseEnter={triggerSpin}
      onClick={triggerSpin}
      className="inline-block cursor-pointer"
    >
      <LogoSVG
        size={size}
        className={`transition-transform duration-300 ${
          isSpinning ? "logo-spin-animation" : ""
        }`}
      />
    </div>
  );
}

export function AppLogoFull({ href = "/", size = 24 }: AppLogoProps) {
  const [isSpinning, setIsSpinning] = useState(false);

  const triggerSpin = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 600); 
  };

  return (
    <Link
      href={href}
      onMouseEnter={triggerSpin}
      onClick={triggerSpin}
      className="flex items-center gap-2 hover:opacity-90 transition-opacity"
    >
      {/* To test alternate logo, replace with <Logo1SVG */}
      <LogoSVG
        size={size}
        className={`transition-transform duration-300 ${
          isSpinning ? "logo-spin-animation" : ""
        }`}
      />
      <AppLogoText />
    </Link>
  );
}
