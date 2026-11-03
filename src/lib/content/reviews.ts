/** Guest reviews shown on the site (quoted verbatim from real guests). */
export type Review = {
  name: string;
  location: string;
  date: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
};

export const REVIEWS: Review[] = [
  {
    name: "Prageeth Nuwan",
    location: "Australia",
    date: "July 2024",
    rating: 5,
    text: "The place was clean and modern, equipped with all necessary amenities. The room was spacious, and the bed was extremely comfortable. Secure parking was available within the premises. Its close proximity to major attractions like stupas and temples in the sacred city was very convenient. Supermarkets and restaurants were also nearby. The host was very friendly and went above and beyond to accommodate us, providing detailed information about local attractions, dining, and transportation. Highly recommended!",
  },
  {
    name: "Berlesu",
    location: "Rotterdam, Netherlands",
    date: "August 2024",
    rating: 5,
    text: "We had a lovely stay at Karanda Lodge for two nights. The room is upstairs in a super nice villa which also has private parking. The room and the house was very clean, comfortable and spacious. We really felt welcome by Owner and Manager, they were very kind and accommodating and provided us nice recommendations on restaurants. Highly recommend staying here for your trip to Anuradhapura!",
  },
  {
    name: "Sayuri",
    location: "Finland",
    date: "September 2025",
    rating: 5,
    text: "Had a very clean accomodation with calm environment. It has everything you would expect for the most competitive price. I recommend it 100%. The property owner and manager did everything to feel good here. They are very courteous, honest and helpfull. Thank you Kranda Lodge. Hope to see you all again.",
  },
];

/** Headline rating shown with the reviews. */
export const RATING_SUMMARY = {
  score: "5.0",
  source: "Google",
  count: "50+",
};
