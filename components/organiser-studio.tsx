"use client";

import { ArrowRight, BarChart3, CalendarDays, Check, Download, Plus, Ticket, Users } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { attendeeCsv, Booking, categories, EventItem, eventDate, formatPrice, downloadText } from "@/lib/events";
import { SceneDialog } from "./scene-dialog";

type CreateEvent = Omit<EventItem, "id" | "image" | "published">;

const blankForm = {
  title: "",
  category: "Music" as CreateEvent["category"],
  date: "2026-10-31",
  time: "19:00",
  location: "",
  city: "Mumbai" as CreateEvent["city"],
  price: "499",
  capacity: "80",
  host: "",
  tag: "New listing",
  description: "",
};

export function OrganiserStudio({ events, bookings, sharedMode, onClose, onCreate, onCheckIn }: {
  events: EventItem[];
  bookings: Booking[];
  sharedMode: boolean;
  onClose: () => void;
  onCreate: (event: CreateEvent) => Promise<EventItem>;
  onCheckIn: (bookingId: string) => Promise<void>;
}) {
  const [view, setView] = useState<"create" | "dashboard">("create");
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<EventItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const organiserBookings = useMemo(() => bookings.filter((booking) => events.some((event) => event.id === booking.event.id)), [bookings, events]);
  const revenue = organiserBookings.reduce((total, booking) => total + booking.total, 0);
  const ticketsSold = organiserBookings.reduce((total, booking) => total + booking.quantity, 0);

  function updateField(key: keyof typeof blankForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const startsAt = new Date(`${form.date}T${form.time}:00+05:30`);
    if (!form.title.trim() || form.title.trim().length < 4) return setError("Give your event a clear title (at least 4 characters).");
    if (!form.location.trim()) return setError("Add the venue or meeting point.");
    if (!form.host.trim()) return setError("Add the organiser or host name.");
    if (!form.description.trim() || form.description.trim().length < 20) return setError("Tell people a little more about the plan (at least 20 characters).");
    if (Number.isNaN(startsAt.valueOf()) || startsAt.getTime() <= Date.now()) return setError("Choose a future date and time.");
    const price = Number(form.price);
    const capacity = Number(form.capacity);
    if (!Number.isInteger(price) || price < 0 || price > 100000) return setError("Ticket price must be a whole number between ₹0 and ₹1,00,000.");
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100000) return setError("Capacity must be between 1 and 1,00,000.");
    setIsSubmitting(true);
    try {
      const next = await onCreate({
        title: form.title.trim(), category: form.category, startsAt: startsAt.toISOString(), location: form.location.trim(), city: form.city,
        price, capacity, host: form.host.trim(), tag: form.tag.trim() || "New listing", description: form.description.trim(),
      });
      setCreated(next);
      setForm(blankForm);
      setView("dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Your event could not be published.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SceneDialog titleId="organiser-title" onClose={onClose} wide>
      <div className="workspace-content organiser-workspace">
        <div className="workspace-header"><div><p className="section-kicker"><span /> Organiser studio</p><h2 id="organiser-title" className="workspace-title">Make a plan.<br /><em>Fill a room.</em></h2></div><div className="workspace-header-icon"><Ticket size={21} /></div></div>
        <p className="workspace-description">Publish a local event, keep an eye on your people, and see what your night is shaping up to look like.</p>
        <div className="studio-tabs"><button className={view === "create" ? "active" : ""} onClick={() => setView("create")}><Plus size={15} /> Publish an event</button><button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}><BarChart3 size={15} /> My events <span>{events.length}</span></button></div>

        {view === "create" ? (
          <form className="publish-form" onSubmit={submit}>
            <div className="form-section-title"><span>01</span><div><h3>Set the scene</h3><p>Give people the details they need to say yes.</p></div></div>
            <div className="form-grid">
              <label className="form-field field-span-2">Event name<input value={form.title} onChange={(event) => updateField("title", event.target.value)} maxLength={100} placeholder="e.g. Sunday vinyl & brunch" /></label>
              <label className="form-field">Category<select value={form.category} onChange={(event) => updateField("category", event.target.value)}>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></label>
              <label className="form-field">Short label<input value={form.tag} onChange={(event) => updateField("tag", event.target.value)} maxLength={40} placeholder="e.g. Small group" /></label>
              <label className="form-field">Date<input type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} /></label>
              <label className="form-field">Start time <span className="field-hint">IST</span><input type="time" value={form.time} onChange={(event) => updateField("time", event.target.value)} /></label>
            </div>
            <div className="form-section-title spaced"><span>02</span><div><h3>Where & who</h3><p>Help your audience know exactly where to show up.</p></div></div>
            <div className="form-grid">
              <label className="form-field field-span-2">Venue or meeting point<input value={form.location} onChange={(event) => updateField("location", event.target.value)} maxLength={120} placeholder="e.g. The Courtyard, Indiranagar" /></label>
              <label className="form-field">City<select value={form.city} onChange={(event) => updateField("city", event.target.value)}>{["Mumbai", "Bengaluru", "New Delhi", "Hyderabad"].map((city) => <option key={city}>{city}</option>)}</select></label>
              <label className="form-field">Organiser name<input value={form.host} onChange={(event) => updateField("host", event.target.value)} maxLength={80} placeholder="e.g. The Good Weekend" /></label>
              <label className="form-field field-span-2">About the event<textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} maxLength={2000} rows={3} placeholder="What will people experience? Keep it warm, useful, and specific." /></label>
            </div>
            <div className="form-section-title spaced"><span>03</span><div><h3>Tickets & capacity</h3><p>Simple pricing, no surprises for your guests.</p></div></div>
            <div className="form-grid form-grid-small"><label className="form-field">Ticket price <span className="field-hint">INR</span><input type="number" min="0" max="100000" step="1" value={form.price} onChange={(event) => updateField("price", event.target.value)} /></label><label className="form-field">Available spots<input type="number" min="1" max="100000" step="1" value={form.capacity} onChange={(event) => updateField("capacity", event.target.value)} /></label></div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="publish-submit-row"><p><Check size={14} /> Your event goes live instantly {sharedMode ? "on scene." : "in this demo."}</p><button className="checkout-button" disabled={isSubmitting} type="submit">{isSubmitting ? "Publishing..." : "Publish event"} <ArrowRight size={17} /></button></div>
          </form>
        ) : (
          <div className="dashboard-view">
            {created && <div className="publish-success"><div className="confirmation-icon"><Check size={19} /></div><div><strong>{created.title} is live.</strong><span>It&apos;s now discoverable in {created.city}.</span></div><button onClick={() => setView("create")}><Plus size={15} /> Add another</button></div>}
            <div className="metrics-grid"><div><span><Users size={15} /> Tickets sold</span><strong>{ticketsSold}</strong><small>across your events</small></div><div><span><BarChart3 size={15} /> Revenue</span><strong>{formatPrice(revenue)}</strong><small>{sharedMode ? "reservation total" : "demo total"}</small></div><div><span><CalendarDays size={15} /> Live listings</span><strong>{events.length}</strong><small>published by you</small></div></div>
            <div className="dashboard-title-row"><div><h3>Published events</h3><p>Manage the plans you&apos;re putting into the world.</p></div>{organiserBookings.length > 0 && <button className="download-button" onClick={() => downloadText("scene-attendees.csv", attendeeCsv(organiserBookings), "text/csv;charset=utf-8")}><Download size={14} /> Export attendees</button>}</div>
            {events.length === 0 ? <div className="mini-empty"><Plus size={18} /><p>No events yet. Publish your first plan to see it here.</p><button onClick={() => setView("create")}>Publish an event</button></div> : <div className="organiser-events">{events.map((event) => <OrganiserEvent key={event.id} event={event} bookings={organiserBookings.filter((booking) => booking.event.id === event.id)} onCheckIn={onCheckIn} />)}</div>}
          </div>
        )}
      </div>
    </SceneDialog>
  );
}

function OrganiserEvent({ event, bookings, onCheckIn }: { event: EventItem; bookings: Booking[]; onCheckIn: (bookingId: string) => Promise<void> }) {
  const date = eventDate(event);
  const sold = bookings.reduce((total, booking) => total + booking.quantity, 0);
  return <article className="organiser-event"><div className="organiser-event-image" style={{ backgroundImage: `url(${event.image})` }}><span>{event.category}</span></div><div className="organiser-event-main"><div className="organiser-event-heading"><div><h4>{event.title}</h4><p><CalendarDays size={13} /> {date.date} · {event.city}</p></div><strong>{formatPrice(event.price)}</strong></div><div className="capacity-bar"><span style={{ width: `${Math.min(100, (sold / event.capacity) * 100)}%` }} /></div><div className="capacity-label"><span>{sold} of {event.capacity} spots booked</span><span>{event.host}</span></div>{bookings.length > 0 && <div className="attendee-list">{bookings.map((booking) => <div key={booking.id}><span className="attendee-avatar">{booking.name.slice(0, 1).toUpperCase()}</span><span><b>{booking.name}</b><small>{booking.quantity} ticket{booking.quantity > 1 ? "s" : ""} · {bookingReferenceShort(booking.id)}</small></span>{booking.checkedInAt ? <em><Check size={13} /> Checked in</em> : <button onClick={() => void onCheckIn(booking.id)}>Check in</button>}</div>)}</div>}</div></article>;
}

function bookingReferenceShort(id: string) {
  return `SCN-${id.slice(0, 6).toUpperCase()}`;
}
