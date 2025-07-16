"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeartButtonProps = {
  maxClicks?: number;
  initialCount?: number;
  onChange?: (count: number) => void;
  className?: string;
};

const variants = {
  heart: {
    initial: { scale: 1 },
    tapActive: { scale: 0.8 },
    tapCompleted: { scale: 1 },
  },
  glow: {
    initial: { scale: 1, opacity: 0 },
    animate: { scale: [1, 1.5], opacity: [0.8, 0] },
    transition: { duration: 0.8, ease: "easeOut" },
  },
  pulse: {
    initial: { scale: 1.2, opacity: 0 },
    animate: { scale: [1.2, 1.8, 1.2], opacity: [0, 0.3, 0] },
    transition: { duration: 1.2, ease: "easeInOut" },
  },
};

const createParticleAnimation = (index: number) => ({
  initial: { x: 0, y: 0, scale: 0, opacity: 0 },
  animate: {
    x: `calc(${Math.cos((index * Math.PI) / 3) * 30}px)`,
    y: `calc(${Math.sin((index * Math.PI) / 3) * 30}px)`,
    scale: [0, 1, 0],
    opacity: [0, 1, 0],
  },
  transition: {
    duration: 0.8,
    delay: index * 0.05,
    ease: "easeOut",
  } as Transition,
});

const HeartButton = React.forwardRef<HTMLDivElement, HeartButtonProps>(
  (props, ref) => {
    const {
      maxClicks = 5,
      initialCount = 0,
      onChange,
      className,
      ...restProps
    } = props;

    const [clickCount, setClickCount] = React.useState(initialCount);
    const burstSoundRef = React.useRef<HTMLAudioElement>(null);

    const fillPercentage = Math.min(100, (clickCount / maxClicks) * 100);
    const isActive = clickCount > 0;
    const isCompleted = clickCount >= maxClicks;
    const sizeMultiplier = 1 + clickCount * 0.04;

    const handleClick = () => {
      if (clickCount < maxClicks) {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        onChange?.(newCount);

        const pitch = 400 + newCount * 50;
        playClickTone(pitch);

        if (newCount === maxClicks && burstSoundRef.current) {
          burstSoundRef.current.currentTime = 0;
          burstSoundRef.current.play().catch(() => {});
        }
      }
    };

    function playClickTone(pitch: number = 440) {
      const AudioContextConstructor =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext: new () => AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextConstructor) {
        console.error("AudioContext not supported in this browser.");
        return;
      }

      const ctx = new AudioContextConstructor();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "triangle";

      oscillator.frequency.setValueAtTime(pitch, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(
        pitch + 120,
        ctx.currentTime + 0.15
      );

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2);
    }

    return (
      <div
        ref={ref}
        className={cn("flex justify-center items-center relative", className)}
      >
        <audio ref={burstSoundRef} src="/sounds/burst.mp3" preload="auto" />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleClick}
          aria-pressed={isActive}
          aria-label={isCompleted ? "Maximum hearts given" : "Give heart"}
          className="relative"
          {...restProps}
        >
          <motion.div
            initial="initial"
            animate={{ scale: isActive ? sizeMultiplier : 1 }}
            whileTap={isCompleted ? "tapCompleted" : "tapActive"}
            variants={variants.heart}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="relative"
          >
            <Heart
              className="opacity-60 text-red-500 fill-background"
              size={24}
              aria-hidden="true"
            />

            <Heart
              className="absolute inset-0 text-red-500 fill-red-500 transition-all duration-300"
              size={24}
              aria-hidden="true"
              style={{ clipPath: `inset(${100 - fillPercentage}% 0 0 0)` }}
            />

            <AnimatePresence>
              {isCompleted && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(239,68,68,0) 70%)",
                    }}
                    initial="initial"
                    animate="animate"
                    exit={{ opacity: 0 }}
                    variants={variants.pulse}
                  />

                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: "0 0 10px 2px rgba(239,68,68,0.6)" }}
                    initial="initial"
                    animate="animate"
                    exit={{ opacity: 0 }}
                    variants={variants.glow}
                  />
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </Button>

        <AnimatePresence>
          {isCompleted && (
            <motion.div className="absolute inset-0 pointer-events-none flex justify-center items-center">
              {Array.from({ length: 6 }).map((_, i) => {
                const particle = createParticleAnimation(i);

                return (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-red-500"
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
  }
);

HeartButton.displayName = "HeartButton";

export { HeartButton };
