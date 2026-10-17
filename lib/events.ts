import { z } from "zod";

export const categories = ["All plans", "Music", "Food & drink", "Arts & culture", "Wellness"];
export const cities = ["Mumbai", "Bengaluru", "New Delhi", "Hyderabad"];

export const eventSchema = z.object({
  id: z.number().int().positive(),
  organiserId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(4).max(100),
  category: z.enum(["Music", "Food & drink", "Arts & culture", "Wellness"]),
  startsAt: z.string().datetime({ offset: true }),
  location: z.string().trim().min(3).max(120),
  city: z.enum(["Mumbai", "Bengaluru", "New Delhi", "Hyderabad"]),
  price: z.number().int().min(0).max(100000),
  capacity: z.number().int().min(1).max(100000),
  host: z.string().trim().min(2).max(80),
  tag: z.string(),
  description: z.string().trim().min(20).max(2000),
  image: z.string().url().startsWith("https://images.unsplash.com/"),
  published: z.boolean(),
});

export type EventItem = z.infer<typeof eventSchema>;

export const categoryImages: Record<string, string> = {
  Music: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=85",
  "Food & drink": "https://images.unsplash.com/photo-1519671282429-b44660ead0a7?auto=format&fit=crop&w=1200&q=85",
  "Arts & culture": "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=85",
  Wellness: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=85",
};

export const seedEvents: EventItem[] = [
  {
    id: 1, title: "Nucleya: Sub Cinema Tour", category: "Music",
    startsAt: "2026-10-17T19:30:00+05:30", location: "NESCO Centre", city: "Mumbai",
    price: 1499, capacity: 500, host: "Submerge Music", tag: "Big night out",
    description: "A sample bass-heavy homecoming for Mumbai. Discover the live-show experience and try booking a demo ticket. Doors open at 6 PM.",
    image: categoryImages.Music, published: true,
  },
  {
    id: 2, title: "Sunday Social Club", category: "Food & drink",
    startsAt: "2026-10-18T11:00:00+05:30", location: "The Courtyard, Indiranagar", city: "Bengaluru",
    price: 499, capacity: 80, host: "The Good Weekend", tag: "Easy Sunday",
    description: "Good food, vinyl records, and a long lunch with people who like to linger. Your demo ticket includes a seat at the community table.",
    image: categoryImages["Food & drink"], published: true,
  },
  {
    id: 3, title: "Midnight Musing: Open Mic", category: "Arts & culture",
    startsAt: "2026-10-23T20:00:00+05:30", location: "The Habitat, Khar", city: "Mumbai",
    price: 350, capacity: 40, host: "The Habitat", tag: "New this week",
    description: "A warm room for sharp jokes, unfinished poems, and stories worth staying up for. A sample listing to discover your next creative evening.",
    image: categoryImages["Arts & culture"], published: true,
  },
  {
    id: 4, title: "Terrace Pilates & Matcha", category: "Wellness",
    startsAt: "2026-10-24T08:30:00+05:30", location: "The Park, Aerocity", city: "New Delhi",
    price: 799, capacity: 20, host: "Slow Mornings Club", tag: "Small group",
    description: "Start slow: a sunlit mat, a thoughtful flow, and ceremonial matcha afterwards. All levels welcome. Bring a mat and a water bottle.",
    image: categoryImages.Wellness, published: true,
  },
  {
    id: 5, title: "Neon Gully: After Dark", category: "Music",
    startsAt: "2026-10-24T21:00:00+05:30", location: "Raasta, Khar", city: "Mumbai",
    price: 999, capacity: 150, host: "Gully Gang", tag: "Late night",
    description: "Bass, baile, and a room full of strangers who already know the words. This sample late-night session is for music lovers aged 18 and above.",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=85", published: true,
  },
  {
    id: 6, title: "Paper & Clay: Makers Market", category: "Arts & culture",
    startsAt: "2026-10-25T10:00:00+05:30", location: "Lodhi Art District", city: "New Delhi",
    price: 0, capacity: 200, host: "Made in Delhi", tag: "Free entry",
    description: "Meet the hands behind your favourite things: ceramics, paper, textiles, and more. Browse local makers and explore a sample community market.",
    image: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=1200&q=85", published: true,
  },
  {
    id: 7, title: "Chai, Sketch & Slow Down", category: "Arts & culture",
    startsAt: "2026-10-18T16:00:00+05:30", location: "Lamakaan, Banjara Hills", city: "Hyderabad",
    price: 0, capacity: 30, host: "Sunday Sketchers", tag: "Meet your people",
    description: "Bring a sketchbook and meet your neighbourhood creatives over chai. No drawing experience needed. This is a sample community meetup.",
    image: categoryImages["Arts & culture"], published: true,
  },
  {
    id: 8, title: "Sunrise by the Sea", category: "Wellness",
    startsAt: "2026-10-18T06:30:00+05:30", location: "Carter Road Promenade", city: "Mumbai",
    price: 0, capacity: 25, host: "Slow Mornings Club", tag: "Fresh air, free entry",
    description: "An easy coastal walk and guided breathwork to ease into Sunday. Comfortable shoes recommended. Try a free demo reservation for this sample event.",
    image: categoryImages.Wellness, published: true,
  },
  {
    id: 9, title: "The Indie Listening Room", category: "Music",
    startsAt: "2026-10-30T19:00:00+05:30", location: "Fandom, Koramangala", city: "Bengaluru",
    price: 599, capacity: 100, host: "Independent Sounds", tag: "Discover someone new",
    description: "Three local acts, one intimate stage, and original songs you'll take home. Discover the city's independent music in this sample concert listing.",
    image: categoryImages.Music, published: true,
  },
];

const bookingSchema = z.object({
  id: z.string().uuid(),
  event: eventSchema,
  quantity: z.number().int().min(1).max(8),
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  total: z.number().int().min(0),
  createdAt: z.string().datetime(),
  checkedInAt: z.string().datetime().nullable(),
});

export type Booking = z.infer<typeof bookingSchema>;
export const stateSchema = z.object({
  version: z.literal(1),
  savedIds: z.array(z.number().int()),
  events: z.array(eventSchema),
  managedEvents: z.array(eventSchema).default([]),
  bookings: z.array(bookingSchema),
  managedBookings: z.array(bookingSchema).default([]),
  availability: z.record(z.string(), z.number().int().min(0)).default({}),
});
export type SceneState = z.infer<typeof stateSchema>;
export const emptyState: SceneState = {
  version: 1,
  savedIds: [],
  events: seedEvents,
  managedEvents: [],
  bookings: [],
  managedBookings: [],
  availability: {},
};
export const STORAGE_KEY = "scene-mvp-v1";

export function formatPrice(price: number) {
  return price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`;
}

export function eventDate(event: Pick<EventItem, "startsAt">) {
  const date = new Date(event.startsAt);
  const options = { timeZone: "Asia/Kolkata" };
  return {
    day: new Intl.DateTimeFormat("en-IN", { ...options, day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("en-IN", { ...options, month: "short" }).format(date).toUpperCase(),
    date: new Intl.DateTimeFormat("en-IN", { ...options, weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(date),
    time: new Intl.DateTimeFormat("en-IN", { ...options, hour: "numeric", minute: "2-digit", hour12: true }).format(date),
  };
}

export function remainingTickets(event: EventItem, bookings: Booking[]) {
  return Math.max(0, event.capacity - bookings.filter((booking) => booking.event.id === event.id).reduce((total, booking) => total + booking.quantity, 0));
}

export type EventFilters = {
  city: string;
  category: string;
  query: string;
  freeOnly: boolean;
  date: "any" | "weekend" | "week";
  sort: "recommended" | "soonest" | "price";
  savedOnly: boolean;
};

// A local date key keeps discovery on Indian Standard Time, regardless of the device timezone.
function indiaDay(timestamp: number) {
  return Math.floor((timestamp + 330 * 60_000) / 86_400_000);
}

export function discoverEvents(events: EventItem[], filters: EventFilters, savedIds: number[], now: number) {
  const today = indiaDay(now);
  const weekday = new Date(today * 86_400_000).getUTCDay();
  const weekendStart = today + (weekday === 0 ? -1 : (6 - weekday + 7) % 7);
  const query = filters.query.trim().toLowerCase();
  const results = events.filter((event) => {
    const startsAt = Date.parse(event.startsAt);
    const eventDay = indiaDay(startsAt);
    return event.published && startsAt > now
      && (filters.city === "All cities" || event.city === filters.city)
      && (filters.category === "All plans" || event.category === filters.category)
      && (!filters.savedOnly || savedIds.includes(event.id))
      && (!filters.freeOnly || event.price === 0)
      && (filters.date !== "weekend" || (eventDay >= weekendStart && eventDay <= weekendStart + 1))
      && (filters.date !== "week" || eventDay < today + 7)
      && (!query || `${event.title} ${event.category} ${event.location} ${event.city} ${event.host} ${event.price === 0 ? "free" : ""}`.toLowerCase().includes(query));
  });
  if (filters.sort === "soonest") results.sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  if (filters.sort === "price") results.sort((a, b) => a.price - b.price);
  return results;
}

export function bookEvent(state: SceneState, eventId: number, details: { name: string; email: string; quantity: number }, now = Date.now()) {
  const event = [...seedEvents, ...state.events].find((item) => item.id === eventId && item.published);
  if (!event || Date.parse(event.startsAt) <= now) throw new Error("This event is no longer available to book.");
  const input = z.object({
    name: z.string().trim().min(2, "Please enter your full name.").max(80),
    email: z.string().trim().email("Please enter a valid email address."),
    quantity: z.number().int().min(1).max(8),
  }).safeParse(details);
  if (!input.success) throw new Error(input.error.issues[0].message);
  if (input.data.quantity > remainingTickets(event, state.bookings)) throw new Error("There aren't enough tickets left. Please choose fewer tickets.");
  const booking: Booking = {
    id: crypto.randomUUID(), event: { ...event }, ...input.data,
    total: event.price * input.data.quantity,
    createdAt: new Date(now).toISOString(), checkedInAt: null,
  };
  return { state: { ...state, bookings: [booking, ...state.bookings] }, booking };
}

export function bookingReference(booking: Booking) {
  return `SCN-${booking.id.slice(0, 8).toUpperCase()}`;
}

export function downloadText(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function attendeeCsv(bookings: Booking[]) {
  // Protect exported cells from spreadsheet formula interpretation.
  const cell = (value: string | number) => `"${String(value).replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""')}"`;
  const rows = bookings.map((booking) => [bookingReference(booking), booking.event.title, booking.name, booking.email, booking.quantity, booking.total, booking.checkedInAt ? "Checked in" : "Not checked in"]);
  return [["Reference", "Event", "Name", "Email", "Tickets", "Total INR", "Status"], ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
}
