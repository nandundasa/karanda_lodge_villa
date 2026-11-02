"use client";
import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";

type RevealProps = Omit<HTMLMotionProps<"div">, "initial" | "whileInView" | "viewport"> & {
  children: ReactNode;
  /** Seconds to wait before animating (use for staggering siblings) */
  delay?: number;
  /** Starting offset in px */
  y?: number;
  /** Fraction of the element that must be visible before it animates */
  amount?: number;
};

/** Fades + slides its children up the first time they scroll into view. */
export default function Reveal({ children, delay = 0, y = 32, amount = 0.25, transition, ...rest }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay, ...transition }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
