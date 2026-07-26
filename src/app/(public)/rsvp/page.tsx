import type { Metadata } from "next";
import MyDetailsPage from "@/components/rsvp/RSVPFlow";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = { title: "RSVP" };

export default function RSVPPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6" style={{ backgroundColor: "#fdf8f0" }}>
        <MyDetailsPage />
        </div>


  );
}
