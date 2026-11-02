"use client";
import { useEffect, useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronsLeft,
  ExternalLink,
  LogOut,
  Menu,
  X,
  type LucideProps,
} from "lucide-react";

export type NavItem<K extends string = string> = {
  key: K;
  label: string;
  icon: ComponentType<LucideProps>;
  description?: string;
};

type AdminShellProps<K extends string> = {
  items: NavItem<K>[];
  active: K;
  onSelect: (key: K) => void;
  onLogout: () => void;
  /** Right side of the top nav, e.g. a primary action for the current page */
  actions?: ReactNode;
  children: ReactNode;
};

const COLLAPSE_KEY = "kl-admin-sidebar-collapsed";
const COLLAPSE_EVENT = "kl-sidebar-change";

// Collapsed state lives in localStorage (per browser), read without hydration mismatch
function subscribeCollapsed(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(COLLAPSE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(COLLAPSE_EVENT, cb);
  };
}
let memoryCollapsed = false; // fallback when storage is blocked
function readCollapsed() {
  try {
    const v = localStorage.getItem(COLLAPSE_KEY);
    return v === null ? memoryCollapsed : v === "1";
  } catch {
    return memoryCollapsed;
  }
}

export default function AdminShell<K extends string>({
  items,
  active,
  onSelect,
  onLogout,
  actions,
  children,
}: AdminShellProps<K>) {
  const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = items.find((i) => i.key === active);

  const toggleCollapsed = () => {
    memoryCollapsed = !collapsed;
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "0" : "1");
    } catch {}
    window.dispatchEvent(new Event(COLLAPSE_EVENT));
  };

  // Close the mobile drawer on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const select = (key: K) => {
    onSelect(key);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-svh bg-sage-50 font-sans text-forest-950">
      {/* ---------- Desktop sidebar ---------- */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 84 : 272 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-y-0 left-0 z-40 hidden overflow-hidden lg:block"
      >
        <SidebarBody
          items={items}
          active={active}
          collapsed={collapsed}
          onSelect={select}
          onLogout={onLogout}
          footerToggle={
            <button
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="grid size-9 shrink-0 place-items-center rounded-lg text-forest-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronsLeft
                className={`size-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
              />
            </button>
          }
        />
      </motion.aside>

      {/* ---------- Mobile drawer ---------- */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-forest-950/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 36 }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              <SidebarBody
                items={items}
                active={active}
                collapsed={false}
                onSelect={select}
                onLogout={onLogout}
                footerToggle={
                  <button
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation"
                    className="grid size-9 place-items-center rounded-lg text-forest-200 hover:bg-white/10 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                }
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ---------- Main column ---------- */}
      <div
        className={`min-h-svh transition-[padding] duration-300 ease-premium ${
          collapsed ? "lg:pl-[84px]" : "lg:pl-[272px]"
        }`}
      >
        {/* Glass top nav */}
        <header className="glass-light sticky top-0 z-30">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="grid size-10 place-items-center rounded-xl text-forest-800 transition-colors hover:bg-forest-50 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-sage-500">
                Admin
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.h1
                  key={active}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="truncate font-display text-2xl font-semibold leading-tight text-forest-900"
                >
                  {current?.label}
                </motion.h1>
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <Link
                href="/"
                target="_blank"
                className="hidden items-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 py-2 text-sm font-medium text-forest-800 shadow-soft transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:border-leaf-400/50 hover:shadow-glow sm:inline-flex"
              >
                View website <ExternalLink className="size-3.5" />
              </Link>
              <span
                aria-hidden
                className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-forest-600 to-forest-900 text-sm font-semibold text-gold-200 ring-2 ring-white"
              >
                A
              </span>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function SidebarBody<K extends string>({
  items,
  active,
  collapsed,
  onSelect,
  onLogout,
  footerToggle,
}: {
  items: NavItem<K>[];
  active: K;
  collapsed: boolean;
  onSelect: (key: K) => void;
  onLogout: () => void;
  footerToggle: ReactNode;
}) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-forest-950 text-forest-100">
      {/* decorative glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-leaf-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 size-72 rounded-full bg-gold-400/10 blur-3xl" />

      {/* brand */}
      <div className="relative flex h-16 items-center gap-3 px-5">
        <Image src="/logo.png" alt="" width={36} height={36} className="shrink-0" />
        <Fade show={!collapsed}>
          <div className="leading-tight">
            <p className="font-display text-xl font-semibold whitespace-nowrap text-white">
              Karanda Lodge
            </p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold-300/80">Admin</p>
          </div>
        </Fade>
      </div>

      {/* nav */}
      <nav className="relative mt-4 flex-1 space-y-1 px-3" aria-label="Admin sections">
        {items.map(({ key, label, icon: Icon }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              title={collapsed ? label : undefined}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-200 ${
                isActive ? "text-white" : "text-forest-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="admin-nav-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-leaf-500/25 to-leaf-500/5 ring-1 ring-leaf-400/30 shadow-[0_0_24px_-6px_rgb(16_185_115/0.6)]"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-leaf-400" />
              )}
              <Icon
                className={`relative size-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? "text-leaf-300" : ""
                }`}
              />
              <Fade show={!collapsed}>
                <span className="relative whitespace-nowrap">{label}</span>
              </Fade>
            </button>
          );
        })}
      </nav>

      {/* footer */}
      <div className="relative space-y-1 border-t border-white/10 p-3">
        <button
          onClick={onLogout}
          title={collapsed ? "Log out" : undefined}
          className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-forest-200 transition-colors hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut className="size-5 shrink-0" />
          <Fade show={!collapsed}>
            <span className="whitespace-nowrap">Log out</span>
          </Fade>
        </button>
        <div className={`flex ${collapsed ? "justify-center" : "justify-end"}`}>{footerToggle}</div>
      </div>
    </div>
  );
}

function Fade({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.08 } }}
          exit={{ opacity: 0, x: -6, transition: { duration: 0.1 } }}
          className="min-w-0"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
