import { Booking, EventItem, eventSchema } from "@/lib/events";

export type SupabaseEventRow = {
  id: number | string;
  organiser_id: string | null;
  title: string;
  category: EventItem["category"];
  starts_at: string;
  location: string;
  city: EventItem["city"];
  price: number;
  capacity: number;
  host: string;
  tag: string;
  description: string;
  image: string;
  published: boolean;
};

export type SupabaseBookingRow = {
  id: string;
  event_id: number | string;
  user_id: string;
  name: string;
  email: string;
  quantity: number;
  total: number;
  created_at: string;
  checked_in_at: string | null;
  event?: SupabaseEventRow | SupabaseEventRow[] | null;
};

export function mapEventRow(row: SupabaseEventRow): EventItem {
  return eventSchema.parse({
    id: Number(row.id),
    organiserId: row.organiser_id,
    title: row.title,
    category: row.category,
    startsAt: row.starts_at,
    location: row.location,
    city: row.city,
    price: row.price,
    capacity: row.capacity,
    host: row.host,
    tag: row.tag,
    description: row.description,
    image: row.image,
    published: row.published,
  });
}

export function mapBookingRow(row: SupabaseBookingRow, fallbackEvent?: EventItem): Booking {
  const nestedEvent = Array.isArray(row.event) ? row.event[0] : row.event;
  const event = nestedEvent ? mapEventRow(nestedEvent) : fallbackEvent;
  if (!event) throw new Error("The booking is linked to an event that could not be loaded.");
  return {
    id: row.id,
    event,
    quantity: row.quantity,
    name: row.name,
    email: row.email,
    total: row.total,
    createdAt: row.created_at,
    checkedInAt: row.checked_in_at,
  };
}
