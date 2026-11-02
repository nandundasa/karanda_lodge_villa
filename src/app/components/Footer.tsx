import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { CONTACT, SOCIAL } from "@/lib/content/site";

const EXPLORE = [
  { href: "/", label: "Home" },
  { href: "/Rooms", label: "Rooms" },
  { href: "/Booking", label: "Booking" },
  { href: "/Gallery", label: "Gallery" },
  { href: "/About", label: "About us" },
];

const STAYS = [
  { href: "/Rooms#villa", label: "The Entire Villa" },
  { href: "/Rooms#family-room", label: "Family Room" },
  { href: "/Rooms#double-room", label: "Double Room" },
];

const SOCIALS = [
  { href: SOCIAL.facebook, label: "Facebook", icon: <Facebook className="size-[18px]" /> },
  { href: SOCIAL.instagram, label: "Instagram", icon: <Instagram className="size-[18px]" /> },
  // lucide-react has no TikTok glyph, so this one comes from react-icons
  { href: SOCIAL.tiktok, label: "TikTok", icon: <SiTiktok className="size-4" /> },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-forest-950 font-sans text-ivory-100">
      {/* ambient light + top hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
      <div className="pointer-events-none absolute -left-40 -top-40 -z-10 size-[520px] rounded-full bg-leaf-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-48 right-0 -z-10 size-[480px] rounded-full bg-gold-400/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* ---------- CTA band ---------- */}
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 py-16 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">Your escape awaits</p>
            <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-white text-balance sm:text-5xl">
              Ready for a peaceful <span className="italic text-gradient-gold">stay in nature?</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/Booking"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-leaf-500 px-6 text-sm font-semibold text-forest-950 shadow-glow transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-leaf-400"
            >
              Check availability
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:border-gold-300/50 hover:bg-white/10"
            >
              <MessageCircle className="size-4 text-gold-300" /> Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* ---------- Columns ---------- */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] lg:gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 transition-all duration-500 group-hover:ring-gold-300/40">
                <Image
                  src="/logo.png"
                  alt=""
                  width={34}
                  height={34}
                  className="transition-transform duration-700 ease-premium group-hover:rotate-[20deg]"
                />
              </span>
              <span className="leading-none">
                <span className="block font-display text-2xl font-semibold text-white">Karanda Lodge</span>
                <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-[0.32em] text-gold-300/80">
                  Nature retreat
                </span>
              </span>
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-ivory-100/60">
              Experience nature&apos;s tranquility at Karanda Lodge: your perfect escape, surrounded by lush greenery
              in the sacred city.
            </p>
            <ul className="mt-6 flex gap-3">
              {SOCIALS.map(({ href, label, icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 text-gold-200 transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-gold-300/60 hover:bg-gold-300 hover:text-forest-950 hover:shadow-glow-gold"
                  >
                    {icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn title="Explore" links={EXPLORE} />
          <FooterColumn title="Stay with us" links={STAYS} />

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-300">Contact</h3>
            <ul className="mt-6 space-y-4 text-sm">
              <ContactItem href={`mailto:${CONTACT.email}`} icon={<Mail className="size-4" />}>
                {CONTACT.email}
              </ContactItem>
              <ContactItem href={CONTACT.phoneHref} icon={<Phone className="size-4" />}>
                {CONTACT.phoneDisplay}
              </ContactItem>
              <ContactItem href={CONTACT.mapsHref} icon={<MapPin className="size-4" />} external>
                {CONTACT.address}
              </ContactItem>
            </ul>
          </div>
        </div>

        {/* ---------- Bottom bar ---------- */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-7 text-xs text-ivory-100/50 sm:flex-row">
          <p>© {year} Karanda Lodge. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Designed &amp; developed by
            <a
              href="https://linkedin.com/company/cryzto-labs/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 font-medium text-ivory-100/80 transition-colors hover:text-gold-200"
            >
              <Image src="/logonew.png" alt="" width={18} height={18} className="rounded-sm" />
              Cryzto Labs
              <ArrowUpRight className="size-3 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-300">{title}</h3>
      <ul className="mt-6 space-y-3">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="group inline-flex items-center text-sm text-ivory-100/70 transition-colors duration-300 hover:text-white"
            >
              <span className="mr-0 h-px w-0 bg-gold-300 transition-all duration-300 ease-premium group-hover:mr-2 group-hover:w-4" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactItem({
  href,
  icon,
  external,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="group flex items-start gap-3 text-ivory-100/70 transition-colors duration-300 hover:text-white"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/5 text-gold-300 ring-1 ring-white/10 transition-all duration-300 group-hover:bg-gold-300/15 group-hover:ring-gold-300/40">
          {icon}
        </span>
        <span className="pt-2 leading-snug">{children}</span>
      </a>
    </li>
  );
}
