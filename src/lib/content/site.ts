/** Contact details and social links, shared by the navbar, footer and social section. */
export const CONTACT = {
  email: "madresort03@gmail.com",
  phoneDisplay: "+94 77 036 7058",
  phoneHref: "tel:+94770367058",
  whatsapp: "https://api.whatsapp.com/send/?phone=94770367058&text&type=phone_number&app_absent=0",
  /** International format, digits only (for wa.me links with a prefilled message) */
  whatsappNumber: "94770367058",
  address: "No.581/113A, Rathanasara Mawatha, Anuradhapura",
  /** The lodge's own Google Maps place link */
  mapsHref: "https://maps.app.goo.gl/wrRUYL9KVvVR4fuJ8",
  /** Keyless Google Maps embed centred on the lodge */
  mapsEmbed:
    "https://www.google.com/maps?output=embed&z=16&ll=8.3172873,80.4232854&q=" +
    encodeURIComponent("Karanda Lodge, Anuradhapura"),
};

export const SOCIAL = {
  tiktokHandle: "@karanda.lodge",
  tiktok: "https://www.tiktok.com/@karanda.lodge",
  instagram: "https://www.instagram.com/karanda.lodge",
  facebook: "https://www.facebook.com/share/181Mh5eVQP/?mibextid=wwXIfr",
};

/**
 * TikTok posts featured on the homepage (up to 4).
 * TikTok's API no longer returns thumbnails, so each post's cover is saved
 * locally in /public/social. To add a post: save its cover as a 9:16 image
 * (540×960 WebP works well) in /public/social and add an entry here.
 *  - type "video": plays in a lightbox with TikTok's official player
 *  - type "photo": photo carousels can't be embedded, so it opens on TikTok
 */
export type TikTokPost = {
  id: string;
  type: "video" | "photo";
  url: string;
  cover: string;
  label: string;
};

export const TIKTOK_POSTS: TikTokPost[] = [
  {
    id: "7662088898188774664",
    type: "video",
    url: "https://www.tiktok.com/@karanda.lodge/video/7662088898188774664",
    cover: "/social/tiktok-7662088898188774664.webp",
    label: "Inside the villa",
  },
  {
    id: "7609642000555576584",
    type: "video",
    url: "https://www.tiktok.com/@karanda.lodge/video/7609642000555576584",
    cover: "/social/tiktok-7609642000555576584.webp",
    label: "Family room tour",
  },
  {
    id: "7401588554561785106",
    type: "photo",
    url: "https://www.tiktok.com/@karanda.lodge/photo/7401588554561785106",
    cover: "/social/tiktok-7401588554561785106.webp",
    label: "Our rooms",
  },
  {
    id: "7687322666331589895",
    type: "video",
    url: "https://www.tiktok.com/@karanda.lodge/video/7687322666331589895",
    cover: "/social/tiktok-7687322666331589895.webp",
    label: "Nights in the sacred city",
  },
];
