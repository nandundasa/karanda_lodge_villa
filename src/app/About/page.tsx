"use client";
import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowUpRight,
  Building,
  Clock,
  Leaf,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  PhoneOutgoing,
  Siren,
  Sparkles,
  Star,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import Testimonials from "../components/home/Testimonials";
import { CONTACT } from "@/lib/content/site";
import { RATING_SUMMARY } from "@/lib/content/reviews";

const REASONS = [
  { icon: Siren, title: "24-hour customer service", text: "Reach us any time, day or night, throughout your stay." },
  { icon: Leaf, title: "Cleanliness", text: "Fresh linens and spotless rooms, cared for every day." },
  { icon: Building, title: "Spacious", text: "Generous rooms and a double-height living area to unwind in." },
  { icon: PhoneOutgoing, title: "Happy customer service", text: "Friendly hosts with tips for temples, food and getting around." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-ivory-50 font-sans">
        <PageHero
          image="/IMG_3663.webp"
          imageAlt="Karanda Lodge's entrance and garden at dusk"
          position="center 65%"
          eyebrow="Our story"
          title={
            <>
              A sanctuary <span className="italic text-gradient-gold">rooted in nature</span>
            </>
          }
          subtitle="A peaceful retreat in the sacred city of Anuradhapura, where comfort and greenery live in perfect harmony."
        />

        <StorySection />
        <TreeSection />
        <ReasonsSection />
        <Testimonials />
        <FindUsSection />
      </main>
      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------------ */

function StorySection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bigY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const smallY = useTransform(scrollYProgress, [0, 1], ["30%", "-20%"]);

  return (
    <section ref={ref} className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-40 top-20 size-[480px] rounded-full bg-leaf-100/60 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-12">
        {/* text */}
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
              <span className="h-px w-8 bg-gold-400" /> How it began
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-4xl font-medium leading-tight tracking-tight text-forest-900 text-balance sm:text-5xl">
              Born from a dream, <span className="italic text-forest-600">grown like a tree</span>
            </h2>
          </Reveal>

          <div className="mt-8 space-y-5 text-base leading-relaxed text-sage-700 sm:text-lg">
            <Reveal delay={0.14}>
              <p className="first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-7xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-forest-700">
                Nestled in the heart of lush greenery, Karanda Lodge was born from a dream to create a sanctuary where
                nature and comfort exist in perfect harmony. Our journey began with a single majestic Karanda tree,
                which stands as a symbol of growth, strength, and natural beauty.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p>
                For over a decade, we have welcomed guests from around the world, offering them a peaceful retreat from
                the hustle of daily life. Each room, each pathway, and each moment at Karanda Lodge is designed to
                reconnect you with the tranquility of nature.
              </p>
            </Reveal>
            <Reveal delay={0.26}>
              <p>
                Our commitment to sustainable tourism and eco-friendly practices ensures that the beauty we enjoy today
                will be preserved for generations to come. We believe in creating memories that last a lifetime while
                respecting and protecting our natural environment.
              </p>
            </Reveal>
          </div>
        </div>

        {/* collage */}
        <div className="relative pb-16 sm:pb-24 lg:pb-0">
          <motion.div style={{ y: bigY }} className="relative ml-auto aspect-[4/5] w-[88%] overflow-hidden rounded-4xl shadow-lift">
            <Image
              src="/IMG_0933.webp"
              alt="The villa's mezzanine and double-height windows"
              fill
              sizes="(min-width: 1024px) 40vw, 85vw"
              className="object-cover"
            />
          </motion.div>
          <motion.div
            style={{ y: smallY }}
            className="absolute bottom-0 left-0 aspect-[4/3] w-[55%] overflow-hidden rounded-3xl border-[6px] border-ivory-50 shadow-lift"
          >
            <Image src="/IMG_2203.webp" alt="Guests sharing a meal at the villa" fill sizes="(min-width: 1024px) 24vw, 50vw" className="object-cover" />
          </motion.div>

          {/* floating facts */}
          <Reveal delay={0.3} className="absolute -left-2 top-8 sm:left-2">
            <div className="glass-light rounded-2xl border-0! px-4 py-3 shadow-lift ring-1 ring-forest-900/5">
              <p className="flex items-center gap-1.5 font-display text-3xl font-semibold leading-none text-forest-900 lining-nums">
                {RATING_SUMMARY.score} <Star className="size-5 fill-gold-400 text-gold-400" />
              </p>
              <p className="mt-1 text-xs text-sage-600">
                {RATING_SUMMARY.count} {RATING_SUMMARY.source} reviews
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.4} className="absolute -right-2 bottom-24 sm:right-0 lg:bottom-28">
            <div className="flex items-center gap-3 rounded-2xl bg-forest-900 px-4 py-3 text-white shadow-lift">
              <span className="grid size-10 place-items-center rounded-xl bg-leaf-500/20 text-leaf-300">
                <Clock className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">10 minutes</p>
                <p className="text-xs text-white/60">to Sri Maha Bodhi & Ruwanweliseya</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function TreeSection() {
  return (
    <section className="relative isolate overflow-hidden bg-forest-900 py-24 text-white sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-leaf-500/15 blur-[120px]" />
      {/* drifting leaves */}
      {[
        "left-[8%] top-[18%] size-10 rotate-12",
        "right-[10%] top-[24%] size-14 -rotate-45",
        "left-[16%] bottom-[14%] size-8 rotate-[70deg]",
        "right-[18%] bottom-[18%] size-11 rotate-[160deg]",
      ].map((cls, i) => (
        <motion.span
          key={cls}
          aria-hidden
          className={`absolute -z-10 text-leaf-400/20 ${cls}`}
          animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 7 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
        >
          <Leaf className="size-full" />
        </motion.span>
      ))}

      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <motion.span
            initial={{ rotate: -20, scale: 0.7 }}
            whileInView={{ rotate: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 160, damping: 14 }}
            className="mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-leaf-400 to-forest-600 text-white shadow-glow"
          >
            <Leaf className="size-9" />
          </motion.span>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">The Karanda tree</p>
        </Reveal>
        <Reveal delay={0.16}>
          <h2 className="mt-4 font-display text-4xl font-medium leading-tight sm:text-6xl">
            The <span className="italic text-gradient-gold">&ldquo;Tree of Life&rdquo;</span>
          </h2>
        </Reveal>
        <Reveal delay={0.22}>
          <p className="mx-auto mt-6 max-w-2xl font-display text-xl leading-relaxed text-white/80 sm:text-2xl">
            Renowned for its resilience and its ability to provide shelter and sustenance. Just like this magnificent
            tree, Karanda Lodge offers a safe haven for travelers seeking rest, rejuvenation, and connection with nature.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function ReasonsSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
              <span className="h-px w-8 bg-gold-400" /> Why choose us <span className="h-px w-8 bg-gold-400" />
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-4xl font-medium leading-tight tracking-tight text-forest-900 sm:text-5xl">
              What makes us <span className="italic text-forest-600">special</span>
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={0.1 + i * 0.08} amount={0.3}>
              <div className="group relative h-full overflow-hidden rounded-3xl bg-white p-7 shadow-soft ring-1 ring-forest-900/5 transition-all duration-500 ease-premium hover:-translate-y-1.5 hover:shadow-[0_28px_56px_-20px_rgb(17_47_35/0.3)] hover:ring-leaf-400/40">
                <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-leaf-100 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                <span className="relative grid size-14 place-items-center rounded-2xl bg-forest-900 text-leaf-300 transition-all duration-500 ease-premium group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-leaf-500 group-hover:text-forest-950 group-hover:shadow-glow">
                  <Icon className="size-6" />
                </span>
                <h3 className="relative mt-6 font-display text-2xl font-semibold text-forest-900 lining-nums">{title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-sage-600">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FindUsSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid overflow-hidden rounded-[2.5rem] bg-white shadow-lift ring-1 ring-forest-900/5 lg:grid-cols-[1fr_1.4fr]">
          {/* details */}
          <div className="relative flex flex-col p-8 sm:p-12">
            <div className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-leaf-100/70 blur-3xl" />
            <Reveal>
              <p className="relative inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
                <span className="h-px w-8 bg-gold-400" /> Find us
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="relative mt-5 font-display text-4xl font-medium leading-tight text-forest-900 sm:text-5xl">
                In the heart of the <span className="italic text-forest-600">sacred city</span>
              </h2>
            </Reveal>

            <Reveal delay={0.14}>
              <ul className="relative mt-8 space-y-4 text-sm text-forest-800">
                <li className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-leaf-50 text-leaf-700">
                    <MapPin className="size-5" />
                  </span>
                  <span className="pt-2.5">{CONTACT.address}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-leaf-50 text-leaf-700">
                    <Sparkles className="size-5" />
                  </span>
                  <span className="pt-2.5">About 10 minutes to Sri Maha Bodhi and Ruwanweliseya</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-leaf-50 text-leaf-700">
                    <Phone className="size-5" />
                  </span>
                  <a href={CONTACT.phoneHref} className="pt-2.5 transition-colors hover:text-leaf-700">
                    {CONTACT.phoneDisplay}
                  </a>
                </li>
              </ul>
            </Reveal>

            <Reveal delay={0.2} className="relative mt-auto">
              <div className="flex flex-wrap gap-3 pt-10">
                <a
                  href={CONTACT.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-forest-900 px-6 text-sm font-semibold text-white shadow-soft transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-glow"
                >
                  <Navigation className="size-4" /> Get directions
                  <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-forest-800 ring-1 ring-forest-900/10 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:ring-leaf-400/50"
                >
                  <MessageCircle className="size-4 text-leaf-600" /> WhatsApp us
                </a>
              </div>
            </Reveal>
          </div>

          {/* map */}
          <Reveal y={0} className="relative min-h-[360px] bg-sage-100 lg:min-h-[520px]">
            <iframe
              src={CONTACT.mapsEmbed}
              title="Map showing Karanda Lodge in Anuradhapura"
              className="absolute inset-0 size-full grayscale-[25%] transition-[filter] duration-500 hover:grayscale-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
