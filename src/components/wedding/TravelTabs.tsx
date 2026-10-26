"use client";

import { useState } from "react";
import { Plane, Hotel, Car, Info } from "lucide-react";

const TABS = [
  { id: "colombia", label: "🇨🇴 Colombia", icon: Plane },
  { id: "usa", label: "🇺🇸 USA", icon: Plane },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Airport = { code: string; name: string; note: string };
type HotelItem = { name: string; note: string; featured?: boolean };
type TabContent = {
  venue: string;
  notice: string;
  airports: Airport[];
  hotels: HotelItem[];
  gettingAround: string[];
};

const COLOMBIA_CONTENT: TabContent = {
  venue: "Hacienda Linedaraja · Manizales, Colombia",
  notice:
    "We're still working on official hotel blocks and transportation. If you'd like to book on your own now, here's where to start. We'll post updates here as soon as they're confirmed.",
  airports: [
    {
      code: "PEI",
      name: "Matecaña International Airport",
      note: "Pereira — about 1 hour by car to Manizales; good option for most guests",
    },
    {
      code: "MZL",
      name: "La Nubia Airport",
      note: "Manizales — closest to town, domestic flights only (connect through Bogotá or Medellín)",
    },
    {
      code: "MDE",
      name: "José María Córdova International",
      note: "Medellín — many international flights; plan for a connecting flight or a longer drive",
    },
    {
      code: "BOG",
      name: "El Dorado International",
      note: "Bogotá — largest hub; connect by domestic flight to Pereira or Manizales",
    },
  ],
  hotels: [
    {
      name: "Hotels in Manizales",
      note: "Manizales is the closest city to the venue, so search there first. Official recommendations and any room block are coming soon.",
    },
  ],
  gettingAround: [
    "Plan to arrive at least one day before the wedding to allow for travel delays.",
    "Taxis and rideshare are available in Manizales. From Pereira airport, arrange a private transfer or taxi ahead of time.",
    "Manizales sits high in the Andes, so expect mild days, cool evenings, and rain. Pack layers.",
    "Bring your passport and keep a copy of your travel documents separate from the original.",
  ],
};

const USA_CONTENT: TabContent = {
  venue: "Baughman Center · 982 Museum Road, Gainesville, FL",
  notice:
    "We're still working on official hotel blocks. If you'd like to book on your own now, here are some options. Gainesville hotels fill up on busy university weekends, so booking early is a good idea.",
  airports: [
    {
      code: "GNV",
      name: "Gainesville Regional Airport",
      note: "Closest airport — about 15 to 20 minutes from the venue",
    },
    {
      code: "JAX",
      name: "Jacksonville International",
      note: "About 1 hr 15 min drive — more flight options",
    },
    {
      code: "MCO",
      name: "Orlando International",
      note: "About 1 hr 45 min to 2 hr drive — rental car recommended",
    },
    {
      code: "TPA",
      name: "Tampa International",
      note: "About 2 hr drive — rental car recommended",
    },
  ],
  hotels: [
    {
      name: "Hilton University of Florida Conference Center",
      note: "1714 SW 34th St · A short drive from the venue",
    },
    {
      name: "Hilton Garden Inn Gainesville",
      note: "Near Butler Plaza and Celebration Pointe shopping and dining",
    },
    {
      name: "Sweetwater Branch Inn",
      note: "Historic bed and breakfast in downtown Gainesville",
    },
  ],
  gettingAround: [
    "The Baughman Center is on the University of Florida campus, and its parking is limited. We'll share parking instructions before the wedding, so consider riding together or using a rideshare.",
    "If you fly into Orlando, Tampa, or Jacksonville, plan on a rental car for the drive to Gainesville.",
    "Check hotel cancellation policies before booking so you can adjust if plans change.",
  ],
};

export function TravelTabs() {
  const [active, setActive] = useState<TabId>("colombia");
  const content = active === "colombia" ? COLOMBIA_CONTENT : USA_CONTENT;

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-2 mb-10 border-b border-champagne">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-6 py-3 label-overline transition-colors -mb-px border-b-2 ${
              active === tab.id
                ? "border-sand text-sand"
                : "border-transparent text-dark/40 hover:text-dark/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Venue + notice */}
      <div className="card-wedding mb-12">
        <p className="label-overline mb-1">Venue</p>
        <p className="font-serif text-lg font-normal text-dark">{content.venue}</p>
        <div className="flex items-start gap-3 mt-4">
          <Info size={14} className="text-sand mt-0.5 shrink-0" />
          <p className="text-xs text-dark/60">{content.notice}</p>
        </div>
      </div>

      {/* Airports */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-champagne flex items-center justify-center">
            <Plane size={15} className="text-sand" />
          </div>
          <h3 className="font-serif text-xl font-light text-dark">Airports</h3>
        </div>
        <div className="grid gap-3">
          {content.airports.map((a) => (
            <div key={a.code} className="card-wedding flex items-start gap-4">
              <div
                className="min-w-[3rem] h-10 rounded-lg flex items-center justify-center text-xs font-bold font-sans"
                style={{ backgroundColor: "#1a1209", color: "#d4a574" }}
              >
                {a.code}
              </div>
              <div>
                <p className="font-sans text-sm font-medium text-dark">{a.name}</p>
                <p className="text-xs text-dark/50 mt-0.5">{a.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hotels */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-champagne flex items-center justify-center">
            <Hotel size={15} className="text-sand" />
          </div>
          <h3 className="font-serif text-xl font-light text-dark">Accommodations</h3>
        </div>
        <div className="grid gap-3">
          {content.hotels.map((h) => (
            <div
              key={h.name}
              className="card-wedding"
              style={h.featured ? { border: "2px solid #d4a574" } : undefined}
            >
              {h.featured && (
                <span className="inline-block label-overline text-white bg-sand px-2 py-0.5 rounded-full mb-2">
                  Room Block
                </span>
              )}
              <p className="font-serif text-lg font-normal text-dark">{h.name}</p>
              <p className="text-xs text-dark/50 mt-1">{h.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Getting around */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-champagne flex items-center justify-center">
            <Car size={15} className="text-sand" />
          </div>
          <h3 className="font-serif text-xl font-light text-dark">Getting Around</h3>
        </div>
        <div className="grid gap-3">
          {content.gettingAround.map((tip) => (
            <div key={tip} className="card-wedding">
              <p className="text-sm text-dark/70">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}