"use client";
import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type Variants } from "motion/react";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

type PageHeroProps = {
  image: string;
  imageAlt?: string;
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Extra content under the subtitle (chips, buttons) */
  children?: ReactNode;
  /** Image focal point, e.g. "center 60%" */
  position?: string;
};

/**
 * Parallax page header for inner pages. The navbar floats transparently over
 * it (see HERO_PAGES in Navbar.tsx).
 */
export default function PageHero({ image, imageAlt = "", eyebrow, title, subtitle, children, position = "center" }: PageHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.15]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[560px] items-end overflow-hidden bg-forest-950 font-sans text-white sm:min-h-[620px] lg:h-[78svh]"
    >
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-20 will-change-transform">
        <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: position }} />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950 via-forest-950/55 to-forest-950/40" />
      <div className="pointer-events-none absolute -left-32 bottom-0 -z-10 size-[460px] rounded-full bg-leaf-500/20 blur-[110px]" />

      <motion.div style={{ y: contentY, opacity }} className="mx-auto w-full max-w-7xl px-5 pb-16 pt-32 sm:px-8 sm:pb-20 lg:px-12">
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl">
          <motion.p
            variants={rise}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-200"
          >
            <span className="h-px w-8 bg-gold-300/70" /> {eyebrow}
          </motion.p>
          <motion.h1
            variants={rise}
            className="mt-5 font-display text-5xl font-medium leading-[0.95] tracking-tight text-balance sm:text-7xl"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p variants={rise} className="mt-6 max-w-xl text-base leading-relaxed text-white/75 text-pretty sm:text-lg">
              {subtitle}
            </motion.p>
          )}
          {children && <motion.div variants={rise}>{children}</motion.div>}
        </motion.div>
      </motion.div>
    </section>
  );
}
