"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, GalleryHorizontalEnd, Images, LayoutDashboard, RefreshCw, Tag } from "lucide-react";
import AdminShell, { type NavItem } from "../components/AdminShell";
import AdminOverview from "../components/AdminOverview";
import SlidesPanel from "../components/SlidesPanel";
import GalleryPanel, { type GalleryImage } from "../components/GalleryPanel";
import PricesPanel from "../components/PricesPanel";
import AvailabilityPanel from "../components/AvailabilityPanel";
import { Button, ToastProvider, useToast } from "../components/ui";

type TabKey = "overview" | "slides" | "gallery" | "prices" | "availability";

const NAV_ITEMS: NavItem<TabKey>[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "slides", label: "Homepage Slides", icon: GalleryHorizontalEnd },
  { key: "gallery", label: "Gallery", icon: Images },
  { key: "prices", label: "Room Prices", icon: Tag },
  { key: "availability", label: "Room Availability", icon: CalendarDays },
];

type Room = {
  id: string;
  name: string;
  price: number | string;
  availability: Record<string, boolean>;
};

/** Slides may be stored as strings or (possibly nested) { url | src } objects. */
function slideUrl(slide: unknown): string | null {
  let value = slide;
  for (let depth = 0; depth < 5 && value && typeof value === "object"; depth++) {
    const o = value as { url?: unknown; src?: unknown };
    value = o.url ?? o.src;
  }
  return typeof value === "string" && value.length > 0 ? value : null;
}

export default function AdminDashboard() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}

function Dashboard() {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [slides, setSlides] = useState<string[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  // Bumped after each successful save so panels re-initialise from fresh data
  const [version, setVersion] = useState(0);

  /** fetch wrapper: on an expired admin session, go back to the login page */
  const adminFetch = useCallback(
    async (input: string, init?: RequestInit) => {
      const res = await fetch(input, init);
      if (res.status === 401) {
        toast("Your admin session has expired. Please log in again.", "error");
        router.replace("/admin");
        throw new Error("Unauthorized");
      }
      return res;
    },
    [router, toast]
  );

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [slidesRes, galleryRes, roomsRes] = await Promise.all([
        fetch("/api/slides", { cache: "no-store" }),
        fetch("/api/gallery", { cache: "no-store" }),
        fetch("/api/rooms", { cache: "no-store" }),
      ]);
      const [slidesData, galleryData, roomsData] = await Promise.all([slidesRes.json(), galleryRes.json(), roomsRes.json()]);
      setSlides((slidesData.slides || []).map(slideUrl).filter((u: string | null): u is string => !!u));
      setGallery(Array.isArray(galleryData.images) ? galleryData.images : []);
      setRooms((roomsData.rooms || []).map((r: Room) => ({ ...r, availability: r.availability || {} })));
      setVersion((v) => v + 1);
    } catch (error) {
      console.error("Error loading data:", error);
      toast("Couldn't load the latest data. Check your connection and refresh.", "error");
    } finally {
      setLoaded(true);
      setRefreshing(false);
    }
  }, [toast]);

  // Load once. (No polling: it would overwrite unsaved edits in the panels.)
  useEffect(() => {
    loadData();
  }, [loadData]);

  /** Upload a file to /public via the admin-only upload route; returns its URL */
  const upload = async (file: File): Promise<string | null> => {
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await adminFetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.success) return data.path as string;
      toast(data.error || `Couldn't upload ${file.name}.`, "error");
    } catch (e) {
      if ((e as Error).message !== "Unauthorized") toast(`Couldn't upload ${file.name}.`, "error");
    }
    return null;
  };

  /** POST helper with toast on failure */
  const post = async (url: string, body: unknown, failMsg: string) => {
    try {
      const res = await adminFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) return true;
      toast(`${failMsg}: ${data.error || res.statusText}`, "error");
    } catch (e) {
      if ((e as Error).message !== "Unauthorized") toast(`${failMsg}. Check your connection.`, "error");
    }
    return false;
  };

  const saveSlides = async (next: string[]) => {
    const ok = await post("/api/slides", { slides: next }, "Couldn't save slides");
    if (ok) await loadData();
    return ok;
  };

  const addGalleryPhoto = async (file: File) => {
    const path = await upload(file);
    if (!path) return false;
    return post(
      "/api/gallery",
      { filename: path.split("/").pop(), path, url: path, category: "gallery", description: "Gallery Image" },
      "Couldn't add the photo to the gallery"
    );
  };

  const deleteGalleryPhoto = async (img: GalleryImage) => {
    if (!img._id) return false;
    try {
      const res = await adminFetch(`/api/gallery?id=${encodeURIComponent(img._id)}`, { method: "DELETE" });
      if (res.ok) return true;
      toast("Couldn't delete the photo.", "error");
    } catch (e) {
      if ((e as Error).message !== "Unauthorized") toast("Couldn't delete the photo.", "error");
    }
    return false;
  };

  // Send only the field being edited, so price and availability edits never overwrite each other
  const savePrices = async (prices: Record<string, string>) => {
    const ok = await post("/api/rooms", { rooms: Object.entries(prices).map(([id, price]) => ({ id, price })) }, "Couldn't save prices");
    if (ok) await loadData();
    return ok;
  };

  const saveAvailability = async (availability: Record<string, Record<string, boolean>>) => {
    const ok = await post(
      "/api/rooms",
      { rooms: Object.entries(availability).map(([id, a]) => ({ id, availability: a })) },
      "Couldn't save availability"
    );
    if (ok) await loadData();
    return ok;
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
    router.refresh();
  };

  return (
    <AdminShell
      items={NAV_ITEMS}
      active={activeTab}
      onSelect={setActiveTab}
      onLogout={logout}
      actions={
        <Button variant="ghost" onClick={loadData} disabled={refreshing} aria-label="Refresh data" className="px-3">
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden md:inline">Refresh</span>
        </Button>
      }
    >
      <div className="mx-auto max-w-[1400px]">
        {activeTab === "overview" && (
          <AdminOverview
            rooms={rooms}
            slidesCount={slides.length}
            galleryCount={gallery.length}
            loading={!loaded}
            onManageAvailability={() => setActiveTab("availability")}
          />
        )}

        {!loaded && activeTab !== "overview" && (
          <div className="space-y-4 rounded-3xl bg-white p-7 shadow-soft">
            <div className="skeleton h-7 w-56 rounded-lg" />
            <div className="skeleton h-4 w-80 rounded" />
            <div className="skeleton mt-6 h-40 w-full rounded-2xl" />
          </div>
        )}

        {loaded && activeTab === "slides" && <SlidesPanel key={`slides-${version}`} slides={slides} upload={upload} onSave={saveSlides} />}
        {loaded && activeTab === "gallery" && (
          <GalleryPanel images={gallery} addPhoto={addGalleryPhoto} deletePhoto={deleteGalleryPhoto} onChanged={loadData} />
        )}
        {loaded && activeTab === "prices" && <PricesPanel key={`prices-${version}`} rooms={rooms} onSave={savePrices} />}
        {loaded && activeTab === "availability" && (
          <AvailabilityPanel key={`avail-${version}`} rooms={rooms} onSave={saveAvailability} />
        )}
      </div>
    </AdminShell>
  );
}
