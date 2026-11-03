"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight, Menu, MessageCircle, Phone, X } from "lucide-react";
import { CONTACT } from "@/lib/content/site";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/Rooms", label: "Rooms" },
  { href: "/Booking", label: "Booking" },
  { href: "/Gallery", label: "Gallery" },
  { href: "/About", label: "About" },
];


/** Pages whose top section is a full-bleed dark hero the navbar can float over. */
const HERO_PAGES = new Set(["/", "/Rooms", "/About", "/Gallery", "/Booking"]);

export default function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  // Close the mobile menu whenever the route changes (state-during-render pattern)
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setOpen(false);
  }

  // Glass once scrolled; hide while scrolling down, reveal on scroll up
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 480 && y > prev + 4 && !open);
    if (y < prev - 4) setHidden(false);
  });

  // Lock page scroll while the mobile menu is open; Escape closes it
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const overHero = HERO_PAGES.has(pathname) && !scrolled && !open;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: hidden ? "-100%" : 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-[1010] font-sans"
      >
        <div
          className={`transition-[background-color,box-shadow,backdrop-filter,border-color] duration-500 ease-premium ${
            overHero
              ? "border-b border-white/10 bg-gradient-to-b from-forest-950/50 to-transparent"
              : open
                ? "border-b border-white/10 bg-forest-950"
                : "glass-light shadow-[0_8px_30px_-12px_rgb(17_47_35/0.18)]"
          }`}
        >
          <nav
            aria-label="Main"
            className={`mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 transition-[height] duration-500 ease-premium sm:px-8 lg:px-12 ${
              scrolled ? "h-16" : "h-20"
            }`}
          >
            {/* Brand */}
            <Link href="/" className="group flex items-center gap-3" aria-label="Karanda Lodge home">
              <span className="relative grid size-11 place-items-center">
                <span className="absolute inset-0 scale-75 rounded-full bg-leaf-400/0 blur-md transition-all duration-500 group-hover:scale-110 group-hover:bg-leaf-400/40" />
                <Image
                  src="/logo.png"
                  alt=""
                  width={40}
                  height={40}
                  priority
                  className="relative transition-transform duration-700 ease-premium group-hover:rotate-[20deg]"
                />
              </span>
              <span className="leading-none">
                <span
                  className={`block font-display text-2xl font-semibold tracking-tight transition-colors duration-500 ${
                    overHero || open ? "text-white" : "text-forest-900"
                  }`}
                >
                  Karanda Lodge
                </span>
                <span
                  className={`mt-1 block text-[10px] font-medium uppercase tracking-[0.32em] transition-colors duration-500 ${
                    overHero || open ? "text-gold-200/80" : "text-gold-600"
                  }`}
                >
                  Nature retreat
                </span>
              </span>
            </Link>

            {/* Desktop links */}
            <ul className="hidden items-center gap-1 md:flex">
              {LINKS.map(({ href, label }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`group relative block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                        overHero
                          ? active
                            ? "text-white"
                            : "text-white/75 hover:text-white"
                          : active
                            ? "text-forest-900"
                            : "text-sage-600 hover:text-forest-900"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className={`absolute inset-0 rounded-full ${
                            overHero ? "bg-white/15 ring-1 ring-white/20" : "bg-forest-50 ring-1 ring-forest-900/5"
                          }`}
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <span className="relative">{label}</span>
                      {!active && (
                        <span
                          className={`absolute inset-x-4 bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 ease-premium group-hover:scale-x-100 ${
                            overHero ? "bg-gold-200" : "bg-leaf-500"
                          }`}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Desktop CTA */}
            <Link
              href="/Booking"
              className={`group hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ease-premium hover:-translate-y-0.5 md:inline-flex ${
                overHero
                  ? "glass text-white hover:bg-white/25 hover:shadow-glow-gold"
                  : "bg-forest-900 text-white hover:bg-forest-800 hover:shadow-glow"
              }`}
            >
              Book your stay
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={`relative grid size-11 place-items-center rounded-full transition-colors md:hidden ${
                overHero || open ? "text-white hover:bg-white/10" : "text-forest-900 hover:bg-forest-50"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? "x" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {open ? <X className="size-6" /> : <Menu className="size-6" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[1005] overflow-y-auto bg-forest-950 font-sans text-white md:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 42px) 40px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 42px) 40px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 42px) 40px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute -left-24 top-1/4 size-80 rounded-full bg-leaf-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-10 size-72 rounded-full bg-gold-400/15 blur-3xl" />

            <div className="relative flex min-h-full flex-col px-6 pb-10 pt-28">
              <motion.ul
                className="space-y-1"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}
              >
                {LINKS.map(({ href, label }, i) => {
                  const active = isActive(href);
                  return (
                    <motion.li
                      key={href}
                      variants={{ hidden: { opacity: 0, x: -24 }, show: { opacity: 1, x: 0 } }}
                    >
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className="group flex items-baseline gap-4 py-3"
                      >
                        <span className="font-mono text-xs text-gold-300/70">0{i + 1}</span>
                        <span
                          className={`font-display text-4xl font-medium transition-colors ${
                            active ? "text-gradient-gold italic" : "text-white group-hover:text-leaf-300"
                          }`}
                        >
                          {label}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                className="mt-auto space-y-3 pt-10"
              >
                <Link
                  href="/Booking"
                  onClick={() => setOpen(false)}
                  className="flex h-14 items-center justify-center gap-2 rounded-full bg-leaf-500 text-base font-semibold text-forest-950 shadow-glow"
                >
                  Book your stay <ArrowRight className="size-5" />
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={CONTACT.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass flex h-12 items-center justify-center gap-2 rounded-full text-sm font-medium"
                  >
                    <MessageCircle className="size-4" /> WhatsApp
                  </a>
                  <a href={CONTACT.phoneHref} className="glass flex h-12 items-center justify-center gap-2 rounded-full text-sm font-medium">
                    <Phone className="size-4" /> Call us
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
