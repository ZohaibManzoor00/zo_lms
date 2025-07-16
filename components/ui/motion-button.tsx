"use client";

import * as React from "react";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

type MotionButtonProps = ButtonProps & {
  onChange?: (isSaved: boolean) => void;
  className?: string;
  icon?: LucideIcon;
  label?: string;
  isActive?: boolean;
  soundSrc?: string;
  progress?: number; // Add progress prop
};

const variants = {
  icon: {
    initial: { scale: 1, rotate: 0 },
    active: { scale: 1.4 },
    inactive: { scale: 1.3 },
    tapActive: { scale: 0.85, rotate: -10 },
    tapInactive: { scale: 1, rotate: 0 },
  },
  burst: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: [0, 1.4, 1], opacity: [0, 0.4, 0] },
    transition: { duration: 0.7, ease: easeOut },
  },
};

const createParticleAnimation = (index: number) => {
  const angle = (index / 5) * (2 * Math.PI);
  const radius = 18 + Math.random() * 8;
  const scale = 0.8 + Math.random() * 0.4;
  const duration = 0.6 + Math.random() * 0.1;
  const particleWidth = 4 + Math.random() * 2;
  const particleHeight = 4 + Math.random() * 2;

  return {
    initial: { scale: 0, opacity: 0.3, x: 0, y: 0 },
    animate: {
      scale: [0, scale, 0],
      opacity: [0.3, 0.8, 0],
      x: [0, Math.cos(angle) * radius],
      y: [0, Math.sin(angle) * radius * 0.75],
    },
    transition: { duration, delay: index * 0.04, ease: easeOut },
    particleWidth, // Return width
    particleHeight, // Return height
  };
};

const MotionIcon = React.forwardRef<HTMLDivElement, MotionButtonProps>(
  (props, ref) => {
    const {
      onChange,
      className,
      icon: Icon,
      isActive,
      label,
      soundSrc,
      progress = 0,
      ...restProps
    } = props;

    const [isSaved, setIsSaved] = React.useState(isActive);
    const burstSoundRef = React.useRef<HTMLAudioElement>(null);

    const particlesRef = React.useRef<
      Array<ReturnType<typeof createParticleAnimation>>
    >([]);

    React.useEffect(() => {
      // Generate particles properties only once on the client
      if (particlesRef.current.length === 0) {
        particlesRef.current = Array.from({ length: 5 }).map((_, i) =>
          createParticleAnimation(i)
        );
      }
    }, []);

    const handleClick = () => {
      const newState = !isSaved;
      setIsSaved(newState);
      onChange?.(newState);

      if (newState) {
        // Play dynamic pitch tone
        const pitch = 400 + progress * 500; // Adjust pitch based on progress
        playClickTone(pitch);

        // Play burst sound
        if (burstSoundRef.current) {
          burstSoundRef.current.currentTime = 0;
          burstSoundRef.current.play().catch(() => {});
        }
      }
    };

    function playClickTone(pitch: number = 440) {
      // Type assertion to correctly handle window.webkitAudioContext
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
        className={`relative flex items-center justify-center ${
          className || ""
        }`}
      >
        <audio
          ref={burstSoundRef}
          src={soundSrc || "/sounds/burst.mp3"}
          preload="auto"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          aria-pressed={isSaved}
          aria-label={isSaved ? "Remove bookmark" : "Add bookmark"}
          {...restProps}
        >
          {label && <span>{label}</span>}
          <motion.div
            initial="initial"
            animate={isSaved ? "active" : "inactive"}
            whileTap={isSaved ? "tapInactive" : "tapActive"}
            variants={variants.icon}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="relative flex items-center justify-center"
          >
            {Icon && (
              <>
                <Icon
                  className="opacity-60 text-foreground"
                  size={32}
                  aria-hidden="true"
                />

                <Icon
                  className="absolute inset-0 text-green-600 transition-all duration-300"
                  size={32}
                  aria-hidden="true"
                  style={{ opacity: isSaved ? 1 : 0 }}
                />
              </>
            )}

            <AnimatePresence>
              {isSaved && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(34,197,94,0.4) 0%, rgba(34,197,94,0) 80%)",
                  }}
                  variants={variants.burst}
                  initial="initial"
                  animate="animate"
                  transition={variants.burst.transition}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </Button>

        <AnimatePresence>
          {isSaved && particlesRef.current.length > 0 && (
            <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {particlesRef.current.map((particle, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-green-500"
                  style={{
                    width: `${particle.particleWidth}px`,
                    height: `${particle.particleHeight}px`,
                    filter: "blur(1px)",
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={particle.initial}
                  animate={particle.animate}
                  transition={particle.transition}
                  exit={{ opacity: 0 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

MotionIcon.displayName = "MotionIcon";

export { MotionIcon };
