import type { Guest } from "@/types";
import { formatDate } from "@/lib/utils";

export function RecentGuests({ guests }: { guests: Guest[] }) {
  return (
    <div>
      <p className="label-overline text-dark/40 mb-5">Recent Guests</p>
      <div className="card-wedding overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-champagne">
              <th className="text-left py-2 pr-4 label-overline text-dark/30 font-normal">Name</th>
              <th className="text-left py-2 pr-4 label-overline text-dark/30 font-normal">Type</th>
              <th className="text-left py-2 pr-4 label-overline text-dark/30 font-normal">RSVP</th>
              <th className="text-left py-2 label-overline text-dark/30 font-normal">Added</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => {
              const status = (g.rsvp as any)?.status ?? "PENDING";
              const statusColors: Record<string, string> = {
                ACCEPTED: "#059669",
                DECLINED: "#ef4444",
                PENDING: "#d4a574",
              };
              return (
                <tr key={g.id} className="border-b border-champagne/50 hover:bg-champagne/30 transition-colors">
                  <td className="py-3 pr-4 text-dark font-medium">
                    {g.firstName} {g.lastName}
                  </td>
                  <td className="py-3 pr-4 text-dark/50 text-xs uppercase tracking-wide">
                    {g.guestType?.replace("_", " ") ?? "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-white text-xs"
                      style={{ backgroundColor: statusColors[status] }}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="py-3 text-dark/40 text-xs">
                    {formatDate(g.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {guests.length === 0 && (
          <p className="text-center text-sm text-dark/40 py-8">No guests yet.</p>
        )}
      </div>
    </div>
  );
}
