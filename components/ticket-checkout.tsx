"use client";

import { ArrowRight, CalendarDays, Check, Download, MapPin, Minus, Plus, Ticket } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { Booking, bookingReference, downloadText, EventItem, eventDate, formatPrice } from "@/lib/events";
import { SceneDialog } from "./scene-dialog";

export function TicketCheckout({ event, available, onClose, onBook, onViewTickets }: {
  event: EventItem;
  available: number;
  onClose: () => void;
  onBook: (details: { name: string; email: string; quantity: number }) => Booking;
  onViewTickets: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<"details" | "checkout" | "confirmed">("details");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const submitted = useRef(false);
  const date = eventDate(event);
  const bookable = available > 0 && Date.parse(event.startsAt) > Date.now();

  function submit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (submitted.current) return;
    submitted.current = true;
    const data = new FormData(formEvent.currentTarget);
    try {
      const result = onBook({ name: String(data.get("name")), email: String(data.get("email")), quantity });
      setBooking(result);
      setStep("confirmed");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Booking could not be saved. Please try again.");
      submitted.current = false;
    }
  }

  return (
    <SceneDialog titleId="ticket-title" onClose={onClose}>
      <div className="modal-image" style={{ backgroundImage: `url(${event.image})` }}>
        <span className="live-pill"><span /> {step === "confirmed" ? "Demo booking confirmed" : "Demo experience"}</span>
      </div>
      <div className="modal-content">
        <div className="flex items-start justify-between gap-5">
          <div><p className="section-kicker"><span /> {event.category}</p><h2 id="ticket-title">{event.title}</h2></div>
          <div className="modal-date"><b>{date.day}</b><span>{date.month}</span></div>
        </div>
        {step === "confirmed" && booking ? (
          <div className="confirmation" aria-live="polite">
            <div className="confirmation-icon"><Check size={24} /></div>
            <h3>You&apos;ve got a plan, {booking.name.split(" ")[0]}.</h3>
            <p>{quantity} demo ticket{quantity > 1 ? "s" : ""} saved to this browser. No payment was collected and no email was sent.</p>
            <div className="booking-reference"><Ticket size={18} /><strong>{bookingReference(booking)}</strong></div>
            <button className="checkout-button" onClick={onViewTickets}>Go to my tickets <ArrowRight size={17} /></button>
            <button className="text-action" onClick={() => downloadTicket(booking)}><Download size={14} /> Download booking details</button>
          </div>
        ) : (
          <>
            <p className="modal-description">{event.description}</p>
            <p className="host-line">Hosted by <strong>{event.host}</strong></p>
            <div className="modal-detail-grid">
              <div><CalendarDays size={16} /><span><b>{date.date}</b>{date.time} IST</span></div>
              <div><MapPin size={16} /><span><b>{event.location}</b>{event.city}</span></div>
            </div>
            <div className="ticket-buy-row">
              <div><span className="price-label">General admission · {available} available</span><div className="quantity"><button disabled={quantity <= 1} aria-label="Remove a ticket" onClick={() => setQuantity((count) => count - 1)}><Minus size={14} /></button><b aria-live="polite">{quantity}</b><button disabled={quantity >= Math.min(8, available)} aria-label="Add a ticket" onClick={() => setQuantity((count) => count + 1)}><Plus size={14} /></button></div></div>
              <div className="modal-total"><span>Total · no added fees</span><strong>{formatPrice(event.price * quantity)}</strong></div>
            </div>
            {step === "details" ? (
              <button disabled={!bookable} className="checkout-button" onClick={() => setStep("checkout")}>{bookable ? "Continue to demo checkout" : "Booking unavailable"} <ArrowRight size={17} /></button>
            ) : (
              <form onSubmit={submit} className="checkout-form">
                <h3>Who&apos;s coming?</h3>
                <label className="form-field">Full name<input name="name" autoComplete="name" required minLength={2} maxLength={80} placeholder="Your name" /></label>
                <label className="form-field">Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="checkout-button" disabled={!bookable} type="submit">Confirm demo booking <Check size={17} /></button>
              </form>
            )}
            <p className="secure-note">Demo only · No payment collected · Saved on this device</p>
          </>
        )}
      </div>
    </SceneDialog>
  );
}

export function downloadTicket(booking: Booking) {
  const date = eventDate(booking.event);
  downloadText(`${bookingReference(booking)}.txt`, [
    "scene. — DEMO BOOKING / NOT VALID FOR ENTRY",
    bookingReference(booking), "", booking.event.title,
    `${date.date} · ${date.time} IST`, `${booking.event.location}, ${booking.event.city}`,
    `Hosted by ${booking.event.host}`, "", `Name: ${booking.name}`, `Email: ${booking.email}`,
    `Tickets: ${booking.quantity}`, `Demo total: ${formatPrice(booking.total)}`, "",
    "No payment collected. This booking exists only in this browser's demo storage.",
  ].join("\n"));
}

export function MyTickets({ bookings, onClose }: { bookings: Booking[]; onClose: () => void }) {
  return (
    <SceneDialog titleId="my-tickets-title" onClose={onClose} wide>
      <div className="workspace-content">
        <p className="section-kicker"><span /> Your next good plans</p>
        <h2 id="my-tickets-title" className="workspace-title">My tickets</h2>
        <p className="workspace-description">Demo bookings saved on this device. These are not valid for entry.</p>
        {bookings.length === 0 ? (
          <div className="empty-state"><Ticket size={28} /><h3>Your next plan is waiting</h3><p>Book an event to find your tickets here.</p><button onClick={onClose}>Explore events <ArrowRight size={14} /></button></div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => {
              const date = eventDate(booking.event);
              return (
                <article className="booking-card" key={booking.id}>
                  <div className="booking-card-header"><span className="demo-tag">{booking.checkedInAt ? "Checked in" : "Demo ticket"}</span><strong>{bookingReference(booking)}</strong></div>
                  <h3>{booking.event.title}</h3>
                  <p><CalendarDays size={14} /> {date.date} · {date.time} IST</p>
                  <p><MapPin size={14} /> {booking.event.location}, {booking.event.city}</p>
                  <div className="booking-card-footer"><span>{booking.quantity} ticket{booking.quantity > 1 ? "s" : ""} · {formatPrice(booking.total)}</span><button onClick={() => downloadTicket(booking)}><Download size={14} /> Download</button></div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </SceneDialog>
  );
}
