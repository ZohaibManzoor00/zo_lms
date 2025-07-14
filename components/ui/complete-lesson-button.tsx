"use client";

import * as React from "react";
import { Bookmark } from "lucide-react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";

// type CompleteLessonButtonProps = ButtonProps & {
//   isCompleted: boolean;
//   onToggleComplete: (isCompleted: boolean) => void;
// };

// const iconFlickVariants = {
//   // initial: { y: -10, opacity: 0 },
//   animate: { y: 0, opacity: 1 },
//   exit: { y: 10, opacity: 0 },
// };

// const CompleteLessonButton = React.forwardRef<
//   HTMLButtonElement,
//   CompleteLessonButtonProps
// >((props, ref) => {
//   const { className, isCompleted, onToggleComplete, ...restProps } = props;

//   const handleToggle = () => {
//     onToggleComplete(!isCompleted);
//   };

//   return (
//     <Button
//       ref={ref}
//       className={cn("py-0 pe-0 overflow-hidden", className)}
//       variant="outline"
//       onClick={handleToggle}
//       type="button"
//       {...restProps}
//     >
//       <span className="ml-1.5">Mark Complete</span>
//       <span className="relative inline-flex items-center justify-center h-full px-3 text-xs font-medium rounded-full text-muted-foreground before:absolute before:inset-0 before:w-px before:bg-border ms-1">
//         <AnimatePresence mode="wait">
//           <motion.span
//             key={isCompleted ? "completed" : "incomplete"}
//             variants={iconFlickVariants}
//             initial="initial"
//             // animate="animate"
//             exit={isCompleted ? "initial" : "exit"}
//             transition={{ duration: 0.2 }}
//           >
//             <div
//               className={cn(
//                 "rounded-full p-1 bg-green-500/10 text-green-500"
//               )}
//             >
//               <CheckCircle
//                 className={cn(
//                   "transition-all duration-30 size-5",
//                   isCompleted ? "text-white fill-green-500" : ""
//                 )}
//                 size={16}
//                 aria-hidden="true"
//               />
//             </div>
//           </motion.span>
//         </AnimatePresence>
//       </span>
//     </Button>
//   );
// });

// CompleteLessonButton.displayName = "CompleteLessonButton";

// export { CompleteLessonButton };

type CompleteLessonButtonProps = ButtonProps & {
  isCompleted: boolean;
  onToggleComplete: (isCompleted: boolean) => void;
};

const variants = {
  icon: {
    initial: { scale: 1, rotate: 0 },
    active: { scale: 1.1 },
    inactive: { scale: 1 },
    tapActive: { scale: 0.85, rotate: -10 },
    tapInactive: { scale: 1, rotate: 0 },
  },
  burst: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: [0, 1.4, 1], opacity: [0, 0.4, 0] },
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const createParticleAnimation = (index: number) => {
  const angle = (index / 5) * (2 * Math.PI);
  const radius = 18 + Math.random() * 8;
  const scale = 0.8 + Math.random() * 0.4;
  const duration = 0.6 + Math.random() * 0.1;

  return {
    initial: { scale: 0, opacity: 0.3, x: 0, y: 0 },
    animate: {
      scale: [0, scale, 0],
      opacity: [0.3, 0.8, 0],
      x: [0, Math.cos(angle) * radius],
      y: [0, Math.sin(angle) * radius * 0.75],
    },
    transition: {
      duration,
      delay: index * 0.04,
      ease: "easeOut",
    } as Transition,
  };
};

const CompleteLessonButton = React.forwardRef<
  HTMLDivElement,
  CompleteLessonButtonProps
>((props, ref) => {
  const { onChange, className, ...restProps } = props;

  const [isSaved, setIsSaved] = React.useState(false);

  const handleClick = () => {
    const newState = !isSaved;
    setIsSaved(newState);
    onChange?.(newState);
  };

  return (
    <div
      ref={ref}
      className={`relative flex items-center justify-center ${className || ""}`}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        aria-pressed={isSaved}
        aria-label={isSaved ? "Remove bookmark" : "Add bookmark"}
        {...restProps}
      >
        <motion.div
          initial="initial"
          animate={isSaved ? "active" : "inactive"}
          whileTap={isSaved ? "tapInactive" : "tapActive"}
          variants={variants.icon}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="relative flex items-center justify-center"
        >
          <Bookmark className="opacity-60" size={16} aria-hidden="true" />

          <Bookmark
            className="absolute inset-0 text-blue-500 fill-blue-500 transition-all duration-300"
            size={16}
            aria-hidden="true"
            style={{ opacity: isSaved ? 1 : 0 }}
          />

          <AnimatePresence>
            {isSaved && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(59,130,246,0) 80%)",
                }}
                variants={variants.burst}
                initial="initial"
                animate="animate"
                // transition={variants.burst.transition}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </Button>

      <AnimatePresence>
        {isSaved && (
          <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {Array.from({ length: 5 }).map((_, i) => {
              const particle = createParticleAnimation(i);

              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-blue-500"
                  style={{
                    width: `${4 + Math.random() * 2}px`,
                    height: `${4 + Math.random() * 2}px`,
                    filter: "blur(1px)",
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={particle.initial}
                  animate={particle.animate}
                  transition={particle.transition}
                  exit={{ opacity: 0 }}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

CompleteLessonButton.displayName = "CompleteLessonButton";

export { CompleteLessonButton };
