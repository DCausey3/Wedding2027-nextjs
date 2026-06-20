import type { DashboardStats as Stats } from "@/types";
import { Users, CheckCircle, XCircle, Clock } from "lucide-react";

export function DashboardStats({ stats }: { stats: Stats }) {
  const statCards = [
    { label: "Total Invited", value: stats.totalInvited, icon: Users, color: "#d4a574" },
    { label: "Accepted", value: stats.accepted, icon: CheckCircle, color: "#059669" },
    { label: "Declined", value: stats.declined, icon: XCircle, color: "#ef4444" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "#d4a574" },
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
        <p className="label-overline text-dark/40 mb-3">By Wedding</p>
        <div className="flex gap-6">
          <div>
            <p className="font-serif text-3xl font-light" style={{ color: "#0d9488" }}>
              {stats.colombiaCount}
            </p>
            <p className="text-xs text-dark/50 mt-0.5">Colombia only</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-light" style={{ color: "#059669" }}>
              {stats.usaCount}
            </p>
            <p className="text-xs text-dark/50 mt-0.5">USA only</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-light text-sand">{stats.bothCount}</p>
            <p className="text-xs text-dark/50 mt-0.5">Both</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-light text-dark">{stats.plusOneCount}</p>
            <p className="text-xs text-dark/50 mt-0.5">Plus ones</p>
          </div>
        </div>
      </div>

      {/* Travel */}
      <div className="card-wedding col-span-2">
        <p className="label-overline text-dark/40 mb-3">Travel Readiness</p>
        <div className="flex gap-6">
          <div>
            <p className="font-serif text-3xl font-light text-dark">
              {stats.travelReadiness?.flightsBooked ?? 0}
            </p>
            <p className="text-xs text-dark/50 mt-0.5">Flights booked</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-light text-dark">
              {stats.travelReadiness?.hotelsBooked ?? 0}
            </p>
            <p className="text-xs text-dark/50 mt-0.5">Hotels booked</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-light text-dark">
              {stats.travelReadiness?.shuttlesNeeded ?? 0}
            </p>
            <p className="text-xs text-dark/50 mt-0.5">Shuttle needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
