import type { Metadata } from "next";
import { getDashboardStats, getAllGuests } from "@/lib/data-client";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { RecentGuests } from "@/components/admin/RecentGuests";

export const metadata: Metadata = { title: "Dashboard | Admin" };

// Revalidate every 60s so stats stay fresh without a full rebuild
export const revalidate = 60;

const EMPTY_STATS = {
  totalInvited: 0,
  accepted: 0,
  declined: 0,
  pending: 0,
  colombiaCount: 0,
  usaCount: 0,
  bothCount: 0,
  plusOneCount: 0,
  travelReadiness: { flightsBooked: 0, hotelsBooked: 0, shuttlesNeeded: 0 },
  mealBreakdown: {},
};

export default async function DashboardPage() {
  const [stats, guests] = await Promise.all([getDashboardStats(), getAllGuests()]);

  return (
    <div>
      <div className="mb-8">
        <p className="label-overline text-sand mb-1">Admin Portal</p>
        <h1 className="font-serif text-3xl font-light text-dark">
          Guest Dashboard
        </h1>
      </div>

      <DashboardStats stats={(stats ?? EMPTY_STATS) as any} />

      <div className="mt-10">
        <RecentGuests guests={guests.slice(0, 10) as any} />
      </div>
    </div>
  );
}
