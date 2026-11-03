"use client";
import { MotionConfig } from "motion/react";

/** App-wide client providers. Motion honours the OS "reduce motion" setting. */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </MotionConfig>
  );
}
