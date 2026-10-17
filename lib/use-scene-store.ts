"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  bookEvent as bookLocalEvent,
  Booking,
  categoryImages,
  emptyState,
  EventItem,
  SceneState,
  seedEvents,
  stateSchema,
  STORAGE_KEY,
} from "./events";
import { createClient } from "./supabase/client";
import { supabaseConfigured } from "./supabase/config";
import { mapBookingRow, mapEventRow, SupabaseBookingRow, SupabaseEventRow } from "./supabase/data";

function mergeEvents(events: EventItem[]) {
  const byId = new Map<number, EventItem>();
  [...seedEvents, ...events].forEach((event) => byId.set(event.id, event));
  return [...byId.values()];
}

function demoState(): SceneState {
  return { ...emptyState, events: seedEvents, managedEvents: seedEvents };
}

function readLocalState(): SceneState {
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (!value) return demoState();
  const parsed = stateSchema.parse(JSON.parse(value));
  const events = mergeEvents(parsed.events);
  return {
    ...parsed,
    events,
    managedEvents: parsed.managedEvents.length > 0 ? mergeEvents(parsed.managedEvents) : events,
    managedBookings: parsed.managedBookings.length > 0 ? parsed.managedBookings : parsed.bookings,
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useSceneStore() {
  const [state, setState] = useState<SceneState>(emptyState);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");

  const loadRemote = useCallback(async (currentUser: User | null) => {
    const supabase = createClient();
    const [eventsResult, savedResult, bookingsResult] = await Promise.all([
      supabase.from("events").select("*").order("starts_at", { ascending: true }),
      currentUser ? supabase.from("saved_events").select("event_id").eq("user_id", currentUser.id) : Promise.resolve({ data: [], error: null }),
      currentUser
        ? supabase.from("bookings").select("id,event_id,user_id,name,email,quantity,total,created_at,checked_in_at,event:events(*)").order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (eventsResult.error) throw eventsResult.error;
    if (savedResult.error) throw savedResult.error;
    if (bookingsResult.error) throw bookingsResult.error;

    const eventRows = (eventsResult.data ?? []) as unknown as SupabaseEventRow[];
    const events = eventRows.map(mapEventRow);
    const managedEvents = currentUser ? events.filter((event) => event.organiserId === currentUser.id) : [];
    const bookingRows = (bookingsResult.data ?? []) as unknown as SupabaseBookingRow[];
    const bookings = bookingRows
      .filter((booking) => booking.user_id === currentUser?.id)
      .map((booking) => mapBookingRow(booking, events.find((event) => event.id === Number(booking.event_id))));
    const managedBookings = bookingRows
      .filter((booking) => {
        const nestedEvent = Array.isArray(booking.event) ? booking.event[0] : booking.event;
        return currentUser && nestedEvent?.organiser_id === currentUser.id;
      })
      .map((booking) => mapBookingRow(booking, events.find((event) => event.id === Number(booking.event_id))));
    const availabilityEntries = await Promise.all(events.map(async (event) => {
      const result = await supabase.rpc("get_event_availability", { p_event_id: event.id });
      if (result.error) throw result.error;
      return [event.id, Number(result.data ?? event.capacity)] as const;
    }));

    setState({
      version: 1,
      savedIds: ((savedResult.data ?? []) as Array<{ event_id: number | string }>).map((row) => Number(row.event_id)),
      events,
      managedEvents,
      bookings,
      managedBookings,
      availability: Object.fromEntries(availabilityEntries),
    });
    setStorageError("");
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!supabaseConfigured) {
      try {
        setState(readLocalState());
        setStorageError("");
      } catch {
        setState(demoState());
        setStorageError("Browser storage is unavailable. Demo changes will not persist on this device.");
      }
      setReady(true);
      const sync = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY || event.key === null) {
          try { setState(readLocalState()); } catch { /* Keep the current in-memory demo state. */ }
        }
      };
      window.addEventListener("storage", sync);
      return () => window.removeEventListener("storage", sync);
    }

    const supabase = createClient();
    const load = async (currentUser: User | null) => {
      try {
        await loadRemote(currentUser);
        if (!cancelled) setStorageError("");
      } catch (error) {
        if (!cancelled) setStorageError(getErrorMessage(error, "Supabase data could not be loaded. Apply the database migration and try again."));
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error && error.name !== "AuthSessionMissingError") setStorageError(error.message);
      if (cancelled) return;
      setUser(data.user ?? null);
      await load(data.user ?? null);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      void load(nextUser);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [loadRemote]);

  const commit = useCallback((update: (current: SceneState) => SceneState) => {
    if (supabaseConfigured) throw new Error("This action is handled by Supabase.");
    const next = stateSchema.parse(update(readLocalState()));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState({
      ...next,
      events: mergeEvents(next.events),
      managedEvents: next.managedEvents.length > 0 ? mergeEvents(next.managedEvents) : mergeEvents(next.events),
      managedBookings: next.managedBookings.length > 0 ? next.managedBookings : next.bookings,
    });
    return next;
  }, []);

  const saveEvent = useCallback(async (eventId: number) => {
    if (!supabaseConfigured) {
      commit((current) => ({
        ...current,
        savedIds: current.savedIds.includes(eventId) ? current.savedIds.filter((id) => id !== eventId) : [...current.savedIds, eventId],
      }));
      return;
    }
    if (!user) throw new Error("Sign in to save events.");
    const supabase = createClient();
    const alreadySaved = state.savedIds.includes(eventId);
    const result = alreadySaved
      ? await supabase.from("saved_events").delete().eq("user_id", user.id).eq("event_id", eventId)
      : await supabase.from("saved_events").insert({ user_id: user.id, event_id: eventId });
    if (result.error) throw result.error;
    await loadRemote(user);
  }, [commit, loadRemote, state.savedIds, user]);

  const createEvent = useCallback(async (input: Omit<EventItem, "id" | "image" | "published">) => {
    if (!supabaseConfigured) {
      let created: EventItem | null = null;
      commit((current) => {
        const id = Math.max(0, ...current.events.map((event) => event.id)) + 1;
        created = { ...input, id, image: categoryImages[input.category], published: true };
        return { ...current, events: [created, ...current.events], managedEvents: [created, ...current.managedEvents] };
      });
      if (!created) throw new Error("The event could not be created.");
      return created;
    }
    if (!user) throw new Error("Sign in to publish an event.");
    const supabase = createClient();
    const { data, error } = await supabase.from("events").insert({
      organiser_id: user.id,
      title: input.title,
      category: input.category,
      starts_at: input.startsAt,
      location: input.location,
      city: input.city,
      price: input.price,
      capacity: input.capacity,
      host: input.host,
      tag: input.tag,
      description: input.description,
      image: categoryImages[input.category],
      published: true,
    }).select("*").single();
    if (error) throw error;
    const created = mapEventRow(data as unknown as SupabaseEventRow);
    await loadRemote(user);
    return created;
  }, [commit, loadRemote, user]);

  const book = useCallback(async (eventId: number, details: { name: string; email: string; quantity: number }) => {
    if (!supabaseConfigured) {
      let booking: Booking | null = null;
      commit((current) => {
        const result = bookLocalEvent(current, eventId, details);
        booking = result.booking;
        return { ...result.state, managedBookings: result.state.bookings };
      });
      if (!booking) throw new Error("The booking could not be created.");
      return booking;
    }
    if (!user) throw new Error("Sign in to book an event.");
    const event = state.events.find((item) => item.id === eventId);
    if (!event) throw new Error("This event could not be found.");
    const supabase = createClient();
    const { data, error } = await supabase.rpc("book_event", {
      p_event_id: eventId,
      p_quantity: details.quantity,
      p_name: details.name,
      p_email: details.email,
    });
    if (error) throw error;
    const row = (Array.isArray(data) ? data[0] : data) as unknown as SupabaseBookingRow;
    const booking = mapBookingRow(row, event);
    await loadRemote(user);
    return booking;
  }, [commit, loadRemote, state.events, user]);

  const checkIn = useCallback(async (bookingId: string) => {
    if (!supabaseConfigured) {
      commit((current) => {
        const bookings = current.bookings.map((booking) => booking.id === bookingId ? { ...booking, checkedInAt: new Date().toISOString() } : booking);
        return { ...current, bookings, managedBookings: bookings };
      });
      return;
    }
    if (!user) throw new Error("Sign in to check in attendees.");
    const supabase = createClient();
    const { error } = await supabase.rpc("check_in_booking", { p_booking_id: bookingId });
    if (error) throw error;
    await loadRemote(user);
  }, [commit, loadRemote, user]);

  return {
    state,
    user,
    ready,
    supabaseEnabled: supabaseConfigured,
    commit,
    saveEvent,
    createEvent,
    book,
    checkIn,
    storageError,
  };
}
