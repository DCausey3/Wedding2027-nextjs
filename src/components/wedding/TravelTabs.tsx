"use client";

import { useState } from "react";
import { Plane, Hotel, Car } from "lucide-react";

const TABS = [
  { id: "colombia", label: "🇨🇴 Colombia", icon: Plane },
  { id: "usa", label: "🇺🇸 USA", icon: Plane },
] as const;

type TabId = (typeof TABS)[number]["id"];

const COLOMBIA_CONTENT = {
  airports: [
    { code: "PEI", name: "Matecaña International Airport", note: "Pereira — closest to venue, ~20 min" },
    { code: "MDE", name: "José María Córdova Airport", note: "Medellín — 3 hr drive" },
    { code: "BOG", name: "El Dorado International", note: "Bogotá — domestic connection available" },
  ],
  hotels: [
    { name: "Hotel Sazagua", note: "On venue grounds · Code: VALMRC26 · Deadline Oct 1", featured: true },
    { name: "Dann Carlton Pereira", note: "Boutique luxury in downtown Pereira" },
    { name: "Hotel Movich", note: "Modern hotel with mountain views" },
  ],
};

const USA_CONTENT = {
  airports: [
    { code: "MIA", name: "Miami International Airport", note: "~20 min from venue — recommended" },
    { code: "FLL", name: "Fort Lauderdale-Hollywood", note: "~45 min from venue — often cheaper" },
  ],
  hotels: [
    { name: "The Biltmore Hotel, Coral Gables", note: "Room block · Code: MARC2026 · Deadline Nov 1", featured: true },
    { name: "JW Marriott Marquis Miami", note: "Luxury option in downtown Miami" },
    { name: "Coconut Grove Hotel", note: "Charming boutique near venue" },
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
      <div>
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
    </div>
  );
}
