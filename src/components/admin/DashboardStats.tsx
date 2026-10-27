"use client";

import type { DashboardStats as Stats } from "@/types";
import { Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function DashboardStats({ stats }: { stats: Stats }) {
  const { lang } = useLanguage();
  const statCards = [
    { label: lang === "es" ? "Invitados en total" : "Total Invited", value: stats.totalInvited, icon: Users, color: "#d4a574" },
    { label: lang === "es" ? "Confirmados" : "Accepted", value: stats.accepted, icon: CheckCircle, color: "#059669" },
    { label: lang === "es" ? "No asistirán" : "Declined", value: stats.declined, icon: XCircle, color: "#ef4444" },
    { label: lang === "es" ? "Pendientes" : "Pending", value: stats.pending, icon: Clock, color: "#d4a574" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="card-wedding">
            <div className="flex items-center justify-between mb-3">
              <p className="label-overline text-dark/40">{s.label}</p>
              <Icon size={15} style={{ color: s.color }} />
            </div>
            <p className="font-serif text-4xl font-light text-dark">{s.value}</p>
          </div>
        );
      })}

      {/* Wedding breakdown */}
      <div className="card-wedding col-span-2">
        <p className="label-overline text-dark/40 mb-3">{lang === "es" ? "Por boda" : "By Wedding"}</p>
        <div className="flex gap-6">
          <div>
            <p className="font-serif text-3xl font-light" style={{ color: "#0d9488" }}>
              {stats.colombiaCount}
            </p>
            <p className="text-xs text-dark/50 mt-0.5">{lang === "es" ? "Solo Colombia" : "Colombia only"}</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-light" style={{ color: "#059669" }}>
              {stats.usaCount}
            </p>
            <p className="text-xs text-dark/50">{lang === "es" ? "Solo Estados Unidos" : "USA only"}</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-light text-sand">{stats.bothCount}</p>
            <p className="text-xs text-dark/50 mt-0.5">{lang === "es" ? "Ambas" : "Both"}</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-light text-dark">{stats.plusOneCount}</p>
            <p className="text-xs text-dark/50 mt-0.5">{lang === "es" ? "Acompañantes" : "Plus ones"}</p>
          </div>
        </div>
      </div>

      {/* Travel */}
      <div className="card-wedding col-span-2">
        <p className="label-overline text-dark/40 mb-3">{lang === "es" ? "Preparativos de viaje" : "Travel Readiness"}</p>
        <div className="flex gap-6">
          <div>
            <p className="font-serif text-3xl font-light text-dark">
              {stats.travelReadiness?.flightsBooked ?? 0}
            </p>
            <p className="text-xs text-dark/50 mt-0.5">{lang === "es" ? "Vuelos reservados" : "Flights booked"}</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-light text-dark">
              {stats.travelReadiness?.hotelsBooked ?? 0}
            </p>
            <p className="text-xs text-dark/50 mt-0.5">{lang === "es" ? "Hoteles reservados" : "Hotels booked"}</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-light text-dark">
              {stats.travelReadiness?.shuttlesNeeded ?? 0}
            </p>
            <p className="text-xs text-dark/50 mt-0.5">{lang === "es" ? "Transporte requerido" : "Shuttle needed"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
