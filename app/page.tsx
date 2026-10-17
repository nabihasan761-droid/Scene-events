"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  Heart,
  MapPin,
  Menu,
  Search,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  categories,
  cities,
  discoverEvents,
  EventFilters,
  EventItem,
  eventDate,
  formatPrice,
} from "@/lib/events";
import { useSceneStore } from "@/lib/use-scene-store";
import { MyTickets, TicketCheckout } from "@/components/ticket-checkout";
import { OrganiserStudio } from "@/components/organiser-studio";

const initialFilters: EventFilters = {
  city: "Mumbai",
  category: "All plans",
  query: "",
  freeOnly: false,
  date: "any",
  sort: "recommended",
  savedOnly: false,
};

export default function Home() {
  const { state, user, ready, supabaseEnabled, saveEvent, createEvent, book, checkIn, storageError } = useSceneStore();
  const [filters, setFilters] = useState<EventFilters>(initialFilters);
  const [cityOpen, setCityOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showTickets, setShowTickets] = useState(false);
  const [showOrganiser, setShowOrganiser] = useState(false);
  const [toast, setToast] = useState("");
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    setCurrentTime(Date.now());
  }, []);

  const events = useMemo(() => state.events, [state.events]);
  const discovered = useMemo(() => discoverEvents(events, filters, state.savedIds, currentTime), [events, filters, state.savedIds, currentTime]);
  const featuredEvent = discovered[0] ?? events.find((event) => event.published) ?? events[0];

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const loginFor = (action: string) => {
    notify(`Sign in to ${action}`);
    window.setTimeout(() => {
      window.location.assign(`/auth/login?next=${encodeURIComponent("/")}`);
    }, 450);
  };

  const requireUser = (action: string) => {
    if (supabaseEnabled && !user) {
      loginFor(action);
      return false;
    }
    return true;
  };

  const toggleSaved = async (id: number) => {
    if (!requireUser("save events")) return;
    try {
      const wasSaved = state.savedIds.includes(id);
      await saveEvent(id);
      notify(wasSaved ? "Removed from your saved plans" : "Saved to your plans");
    } catch (error) {
      notify(error instanceof Error ? error.message : "This plan could not be saved");
    }
  };

  const openTickets = (event: EventItem) => {
    if (!requireUser("book tickets")) return;
    setSelectedEvent(event);
  };

  const openTicketsList = () => {
    if (!requireUser("view your tickets")) return;
    setShowTickets(true);
  };

  const openOrganiser = () => {
    if (!requireUser("host an event")) return;
    setShowOrganiser(true);
  };

  const selectCity = (city: string) => {
    setFilters((current) => ({ ...current, city }));
    setCityOpen(false);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBook = async (details: { name: string; email: string; quantity: number }) => {
    const created = await book(selectedEvent?.id ?? -1, details);
    notify(supabaseEnabled ? "Your ticket is confirmed" : "Your demo ticket is ready");
    return created;
  };

  const handleCreateEvent = async (input: Omit<EventItem, "id" | "image" | "published">) => {
    const created = await createEvent(input);
    notify(supabaseEnabled ? "Your event is live on scene." : "Your demo event is live on scene.");
    return created;
  };

  const handleCheckIn = async (bookingId: string) => {
    try {
      await checkIn(bookingId);
      notify("Attendee checked in");
    } catch (error) {
      notify(error instanceof Error ? error.message : "This attendee could not be checked in");
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f7f2] text-[#22211f]">
      <div className="announcement-bar">
        <div className="mx-auto flex max-w-[1280px] items-center justify-center gap-2 px-5 text-center">
          <Sparkles size={13} strokeWidth={2.5} />
          <span>For people who&apos;d rather be out.</span>
          <span className="hidden text-[#b7b5ac] sm:inline">·</span>
          <span className="hidden text-[#b7b5ac] sm:inline">Discover what&apos;s on near you</span>
        </div>
      </div>

      <nav className="relative z-20 mx-auto flex max-w-[1280px] items-center justify-between px-5 py-5 lg:px-8">
        <a href="#top" className="brand-mark" aria-label="scene home">scene<span>.</span></a>
        <div className="hidden items-center gap-8 text-[13px] font-semibold text-[#6e6c66] md:flex">
          <a className="nav-link active" href="#explore">Explore</a>
          <a className="nav-link" href="#how-it-works">How it works</a>
          <button className="nav-link" onClick={openOrganiser}>For organisers</button>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="saved-link hidden sm:flex" onClick={() => { setFilters((current) => ({ ...current, savedOnly: true })); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}>
            <Heart size={16} strokeWidth={2.2} /><span>Saved</span>{state.savedIds.length > 0 && <b>{state.savedIds.length}</b>}
          </button>
          <button className="saved-link hidden md:flex" onClick={openTicketsList}>
            <Ticket size={16} strokeWidth={2.2} /><span>My tickets</span>{state.bookings.length > 0 && <b>{state.bookings.length}</b>}
          </button>
          <button className="host-button hidden sm:flex" onClick={openOrganiser}>Host an event</button>
          <button className="profile-button" aria-label="Open my tickets" onClick={openTicketsList}><UserRound size={17} /></button>
          <button className="profile-button md:hidden" aria-label="Open menu" onClick={() => notify("Use the buttons above to explore or open your tickets")}><Menu size={18} /></button>
        </div>
      </nav>

      <section id="top" className="hero-wrap mx-auto max-w-[1280px] px-5 pb-14 pt-8 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="hero-grid">
          <div className="relative z-10 flex flex-col justify-center pb-8 lg:pb-2">
            <div className="eyebrow mb-6"><span className="eyebrow-dot" /><span>EVENTS WORTH LEAVING HOME FOR</span></div>
            <h1 className="hero-title max-w-[650px]">Find your next <em>good plan.</em></h1>
            <p className="hero-copy mt-6 max-w-[500px]">From tiny gigs to big nights out — discover the people, places, and plans making your city feel alive.</p>
            <form className="search-dock mt-9 max-w-[590px]" onSubmit={handleSearch}>
              <div className="search-field"><Search size={19} strokeWidth={2.1} /><input aria-label="Search events" value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder="Search events, artists, places..." /></div>
              <div className="search-divider" />
              <div className="city-picker-wrap">
                <button className="city-picker" type="button" onClick={() => setCityOpen((open) => !open)}><MapPin size={17} strokeWidth={2.1} /><span>{filters.city}</span><ChevronDown size={15} className={cityOpen ? "rotate-180 transition-transform" : "transition-transform"} /></button>
                {cityOpen && <div className="city-menu">{[...cities, "All cities"].map((city) => <button key={city} className={filters.city === city ? "city-option selected" : "city-option"} onClick={() => selectCity(city)}><span>{city}</span>{filters.city === city && <Check size={15} />}</button>)}</div>}
              </div>
              <button className="search-submit" aria-label="Search"><ArrowRight size={19} strokeWidth={2.2} /></button>
            </form>
            <div className="quick-searches mt-4"><span>Try</span><button onClick={() => setFilters((current) => ({ ...current, date: "weekend", query: "" }))}>This weekend</button><button onClick={() => setFilters((current) => ({ ...current, category: "Music", query: "" }))}>Live music</button><button onClick={() => setFilters((current) => ({ ...current, freeOnly: true, query: "" }))}>Free events</button></div>
          </div>

          <div className="hero-feature" style={{ backgroundImage: `url(${featuredEvent.image})` }}>
            <div className="hero-feature-shade" />
            <div className="hero-date-card"><span>{eventDate(featuredEvent).month}</span><strong>{eventDate(featuredEvent).day}</strong></div>
            <div className="hero-feature-topline"><span className="live-pill"><span /> Happening soon</span><button className="hero-save" aria-label="Save featured event" onClick={() => void toggleSaved(featuredEvent.id)}><Heart size={17} fill={state.savedIds.includes(featuredEvent.id) ? "currentColor" : "none"} /></button></div>
            <div className="hero-feature-content"><div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-white/70"><span>{eventDate(featuredEvent).date}</span><span className="text-white/40">•</span><span>{featuredEvent.city}</span></div><h2>{featuredEvent.title}</h2><div className="mt-4 flex items-center justify-between gap-4"><div className="flex items-center gap-2 text-[13px] text-white/80"><MapPin size={14} /> {featuredEvent.location}</div><button className="feature-arrow" onClick={() => openTickets(featuredEvent)} aria-label="View featured event"><ArrowUpRight size={19} /></button></div></div>
          </div>
        </div>
      </section>

      <section id="explore" className="mx-auto max-w-[1280px] scroll-mt-4 px-5 pb-24 lg:px-8">
        <div className="section-rule" />
        <div className="category-row py-7">
          <div className="flex items-center gap-3 overflow-x-auto pb-1"><span className="category-label">Browse by</span>{categories.map((category) => <button key={category} className={filters.category === category ? "category-pill active" : "category-pill"} onClick={() => setFilters((current) => ({ ...current, category }))}>{category}</button>)}</div>
          <button className="filter-button" onClick={() => setFilters((current) => ({ ...current, freeOnly: !current.freeOnly }))}><SlidersHorizontal size={16} /><span>{filters.freeOnly ? "Free only" : "Filters"}</span></button>
        </div>
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="section-kicker"><span /> {filters.city === "All cities" ? "Across India" : `In ${filters.city}`}</p><h2 className="section-title mt-2">Plans for your kind of people</h2></div><div className="flex items-center gap-2 text-[12px] font-semibold text-[#8a8880]"><span>{discovered.length} plans</span><span className="text-[#c6c3ba]">•</span><button className="sort-button" onClick={() => setFilters((current) => ({ ...current, sort: current.sort === "recommended" ? "soonest" : current.sort === "soonest" ? "price" : "recommended" }))}>{filters.sort === "recommended" ? "Recommended" : filters.sort === "soonest" ? "Soonest" : "Lowest price"} <ChevronDown size={14} /></button></div></div>

        {!ready ? <div className="loading-state"><span className="loading-dot" /> Loading shared plans...</div> : discovered.length > 0 ? <div className="event-grid">{discovered.map((event, index) => <EventCard key={event.id} event={event} index={index} saved={state.savedIds.includes(event.id)} onSave={() => void toggleSaved(event.id)} onTicket={() => openTickets(event)} />)}</div> : <div className="empty-state"><div className="empty-icon"><Search size={22} /></div><h3>No plans found yet</h3><p>Try a different city, category, or search term.</p><button onClick={() => setFilters(initialFilters)}>Clear all filters</button></div>}

        <div className="organiser-panel mt-20" id="organisers"><div className="organiser-copy"><div className="organiser-icon"><Sparkles size={17} /></div><p className="section-kicker light"><span /> Made for the people making plans</p><h2>Got a room, a reason, or a really good idea?</h2><p>List your event, reach the right crowd, and spend less time wrestling with ticketing.</p><button onClick={openOrganiser}>Start hosting <ArrowRight size={16} /></button></div><div className="organiser-stats"><div><strong>12k<span>+</span></strong><span>people discovering<br />events each week</span></div><div><strong>0<span>%</span></strong><span>listing fee for<br />your first event</span></div></div><div className="organiser-scribble">made<br />local <ArrowUpRight size={23} /></div></div>
      </section>

      <section id="how-it-works" className="how-section border-t border-[#e4e1d8] bg-[#efeee8]"><div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-8 px-5 py-12 sm:flex-row sm:items-center lg:px-8"><div><p className="section-kicker"><span /> No endless scrolling required</p><h2 className="mt-2 text-[23px] font-semibold tracking-[-0.04em]">The easy way to make a plan.</h2></div><div className="steps-row"><div><b>01</b><span>Find your<br />kind of night</span></div><ArrowRight className="step-arrow" size={17} /><div><b>02</b><span>Save a spot<br />in seconds</span></div><ArrowRight className="step-arrow" size={17} /><div><b>03</b><span>Show up<br />and have fun</span></div></div></div></section>
      <footer className="mx-auto flex max-w-[1280px] flex-col justify-between gap-5 px-5 py-8 text-[12px] font-medium text-[#96938a] sm:flex-row sm:items-center lg:px-8"><a href="#top" className="brand-mark footer-brand">scene<span>.</span></a><div className="flex gap-5"><a href="#explore">Explore</a><button onClick={openOrganiser}>Host an event</button><a href="#how-it-works">About</a></div><span>© 2026 scene. Made for going out.</span></footer>

      {storageError && <div className="storage-notice" role="status"><span><Sparkles size={14} /> {storageError}</span><button onClick={() => notify(supabaseEnabled ? "Apply the Supabase migration, then redeploy" : "Clear site storage from your browser settings to reset the demo")}>Help</button></div>}
      {selectedEvent && <TicketCheckout event={selectedEvent} available={state.availability[selectedEvent.id] ?? selectedEvent.capacity} sharedMode={supabaseEnabled} onClose={() => setSelectedEvent(null)} onBook={handleBook} onViewTickets={() => { setSelectedEvent(null); openTicketsList(); }} />}
      {showTickets && <MyTickets bookings={state.bookings} sharedMode={supabaseEnabled} onClose={() => setShowTickets(false)} />}
      {showOrganiser && <OrganiserStudio events={state.managedEvents} bookings={state.managedBookings} sharedMode={supabaseEnabled} onClose={() => setShowOrganiser(false)} onCreate={handleCreateEvent} onCheckIn={handleCheckIn} />}
      {toast && <div className="toast"><Check size={15} /> {toast}</div>}
    </main>
  );
}

function EventCard({ event, index, saved, onSave, onTicket }: { event: EventItem; index: number; saved: boolean; onSave: () => void; onTicket: () => void }) {
  const date = eventDate(event);
  return <article className="event-card"><div className="event-image" style={{ backgroundImage: `linear-gradient(180deg, rgba(12, 12, 12, .02) 30%, rgba(12, 12, 12, .72) 100%), url(${event.image})` }}>{index === 0 && <span className="card-badge">Popular right now</span>}<button className={saved ? "card-save saved" : "card-save"} aria-label={`Save ${event.title}`} onClick={onSave}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button><div className="event-image-bottom"><span className="event-tag">{event.tag}</span><div className="event-date-tile"><strong>{date.day}</strong><span>{date.month}</span></div></div></div><div className="event-card-body"><div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#9b988e]"><span>{event.category}</span><span className="text-[#d0cdc3]">•</span><span>{event.city}</span></div><h3>{event.title}</h3><div className="event-meta mt-3"><span><Clock3 size={14} /> {date.time} IST</span><span><MapPin size={14} /> {event.location}</span></div><div className="event-card-footer mt-5"><div><span className="price-label">From</span><strong>{formatPrice(event.price)}</strong></div><div className="attending"><span className="mini-avatars"><i /><i /><i /></span>{event.capacity} spots</div></div><button className="view-tickets" onClick={onTicket}><Ticket size={15} /> View tickets <ArrowUpRight size={15} /></button></div></article>;
}
