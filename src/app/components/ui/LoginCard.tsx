"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, LogIn } from "lucide-react";

/** Shared sign-in screen for the admin and manager areas. */
export default function LoginCard({
  role,
  endpoint,
  redirectTo,
  subtitle,
}: {
  role: "Admin" | "Manager";
  endpoint: string;
  redirectTo: string;
  subtitle: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.replace(redirectTo);
        router.refresh();
        return; // keep the spinner while navigating
      }
      setError(data.error || "Login failed");
      setShake((s) => s + 1);
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-forest-950 px-4 py-12 font-sans">
      <Image src="/IMG_0923.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-forest-950/95 via-forest-900/85 to-forest-950/95" />
      <div className="pointer-events-none absolute -left-32 top-1/4 -z-10 size-[460px] rounded-full bg-leaf-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 size-[420px] rounded-full bg-gold-400/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <motion.div
          key={shake}
          animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
          transition={{ duration: 0.4 }}
          className="glass-dark rounded-4xl p-8 shadow-2xl shadow-black/40 sm:p-10"
        >
          <div className="flex flex-col items-center text-center">
            <span className="relative grid size-20 place-items-center rounded-full bg-white/5 ring-1 ring-white/15">
              <span className="absolute inset-0 animate-glow-pulse rounded-full" />
              <Image src="/logo.png" alt="" width={52} height={52} priority />
            </span>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-300">{role} area</p>
            <h1 className="mt-2 font-display text-4xl font-medium text-white">Karanda Lodge</h1>
            <p className="mt-2 text-sm text-white/60">{subtitle}</p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-white/80">Password</span>
              <span
                className={`flex h-12 items-center rounded-2xl bg-white/5 ring-1 transition-all focus-within:bg-white/10 focus-within:ring-2 ${
                  error ? "ring-rose-400/70 focus-within:ring-rose-400" : "ring-white/15 focus-within:ring-leaf-400"
                }`}
              >
                <Lock className="ml-4 size-4 shrink-0 text-white/40" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  autoComplete="current-password"
                  autoFocus
                  required
                  placeholder={`${role} password`}
                  aria-invalid={!!error}
                  className="h-full w-full bg-transparent px-3 text-white outline-none placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="mr-2 grid size-9 place-items-center rounded-xl text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  role="alert"
                  className="overflow-hidden text-sm text-rose-300"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !password}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-leaf-500 font-semibold text-forest-950 shadow-glow transition-all duration-300 ease-premium enabled:hover:-translate-y-0.5 enabled:hover:bg-leaf-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : <LogIn className="size-5" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </motion.div>

        <Link href="/" className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm text-white/50 transition-colors hover:text-white">
          <ArrowLeft className="size-4" /> Back to the website
        </Link>
      </motion.div>
    </main>
  );
}
