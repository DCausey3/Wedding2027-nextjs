"use client";

import { useEffect, useState } from "react";
import { FAQAccordion } from "@/components/wedding/FAQAccordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Link from "next/link";

// ─── Palette — Sky Blue + Apricot + Ivory + Sand ───────────────────────────
const SKY_DEEP = "#123B54";
const IVORY = "#FFF7EC";
const SAND_LIGHT = "#F2E8D5";
const APRICOT = "#FFB482";

type Guest = {
    stdAttendingColombia?: boolean;
    stdAttendingFlorida?: boolean;
};

function isTruthy(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.trim().toLowerCase() === "true";
    return false;
}

function useAttendance() {
    const [guest, setGuest] = useState<Guest | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const stored = sessionStorage.getItem("guest");
        if (stored) {
            try {
                setGuest(JSON.parse(stored));
            } catch {
                // ignore malformed storage
            }
        }
        setLoaded(true);
    }, []);

    const attendingColombia = isTruthy(guest?.stdAttendingColombia);
    const attendingFlorida = isTruthy(guest?.stdAttendingFlorida);
    // If we never found a guest session (e.g. someone browsing without logging
    // in), default to showing everything rather than hiding both sections.
    const hasGuestContext = guest !== null;

    return { attendingColombia, attendingFlorida, hasGuestContext, loaded };
}

const ALL_FAQS = [
    {
        category: "General",
        items: [
            { q: "Can I attend both weddings?", a: "Absolutely! We would love to celebrate with you twice. Some guests are invited to choose one or both — check your invitation for details." },
            { q: "What is the RSVP deadline?", a: "Please RSVP by September 1st, 2026. This helps us finalize guest counts, meals, and travel logistics for both celebrations." },
            { q: "Will there be transportation between venues?", a: "Yes — we have arranged shuttle service from select hotels at both locations. Please indicate shuttle needs on your RSVP form." },
        ],
    },
    {
        category: "Colombia Wedding",
        items: [
            { q: "Do I need a visa to enter Colombia?", a: "US, Canadian, EU, and UK citizens do not require a visa for stays under 90 days. Check with your country's embassy for specific requirements." },
            { q: "Is a passport required?", a: "Yes — a valid passport is required for all international travelers to Colombia. Ensure yours is valid for at least 6 months beyond your travel dates." },
            { q: "What is the dress code for Colombia?", a: "Tropical formal / Festive attire. The ceremony is outdoors in a tropical garden. Bridesmaids will wear Coral; groomsmen will wear Sand." },
            { q: "What currency should I bring?", a: "The Colombian Peso (COP) is the local currency. Credit cards are widely accepted. We recommend bringing some cash for local experiences." },
        ],
    },
    {
        category: "USA Wedding",
        items: [
            { q: "Which airport should I fly into?", a: "Tampa Airport, Gainesville or Orlando airport" },
            { q: "What is the dress code for the USA wedding?", a: "Black tie / Formal attire. Women: floor-length gowns or formal cocktail dresses. Men: tuxedo or dark formal suit. Bridesmaids in Terracotta; groomsmen in Sand." },
            { q: "Is there parking at the venue?", a: "Yes — complimentary valet parking is available at the venue for all wedding guests." },
        ],
    },
    {
        category: "Accommodations",
        items: [
            { q: "Where should I stay in Colombia?", a: "We recommend Hotel Sazagua (on the venue grounds) using booking code VALMRC26. Book by October 1st to secure the room block rate.", region: "colombia" },
            { q: "Where should I stay in Gainesville?", a: "Hotel and room block details for Gainesville are coming soon — check back here or reach out to us directly in the meantime.", region: "florida" },
        ],
    },
    {
        category: "Registry & Gifts",
        items: [
            { q: "Where are you registered?", a: "We are registered on Zola (primary), Williams-Sonoma, Crate & Barrel, and Honeyfund for our honeymoon. See our Registry page for links." },
            { q: "Should I bring a gift to the wedding?", a: "Please don't bring physical gifts to either venue — we'd love for you to travel light! Gifts can be shipped to our home address (provided on Zola)." },
        ],
    },
];

export default function FAQPage() {
    const { attendingColombia, attendingFlorida, hasGuestContext, loaded } = useAttendance();

    if (!loaded) return null;

    // Only filter when we actually know the guest's attendance — otherwise
    // (no session, e.g. a public/unauthenticated visit) show everything.
    const faqs = !hasGuestContext
        ? ALL_FAQS
        : ALL_FAQS
            .filter((section) => {
                if (section.category === "Colombia Wedding") return attendingColombia;
                if (section.category === "USA Wedding") return attendingFlorida;
                return true;
            })
            .map((section) => {
                if (section.category !== "Accommodations") return section;
                return {
                    ...section,
                    items: section.items.filter((item: any) => {
                        if (item.region === "colombia") return attendingColombia;
                        if (item.region === "florida") return attendingFlorida;
                        return true;
                    }),
                };
            })
            .filter((section) => section.items.length > 0);

    return (
        <div style={{ backgroundColor: IVORY }}>
            <div className="pt-32 pb-20 px-6 text-center" style={{ backgroundColor: SKY_DEEP }}>
                <p className="label-overline mb-4" style={{ color: APRICOT }}>Got Questions?</p>
                <h1 className="heading-display" style={{ color: IVORY }}>
                    Frequently Asked{" "}
                    <span className="italic" style={{ color: APRICOT }}>Questions</span>
                </h1>
            </div>

            <section className="section-pad">
                <div className="max-w-3xl mx-auto">
                    <SectionHeader overline="We've Got Answers" title="Everything You" titleItalic="Need to Know" className="mb-14" />
                    <FAQAccordion categories={faqs} />
                    <div className="mt-14 p-8 rounded-2xl text-center" style={{ backgroundColor: SAND_LIGHT }}>
                        <p className="font-serif text-xl font-light mb-2" style={{ color: SKY_DEEP }}>Still have questions?</p>
                        <p className="text-sm mb-5" style={{ color: `${SKY_DEEP}99` }}>We're happy to help with anything we haven't covered here.</p>
                        <Link
                            href="/contact"
                            className="inline-block px-8 py-3 rounded-full text-xs uppercase tracking-widest transition-all hover:opacity-90"
                            style={{ backgroundColor: APRICOT, color: SKY_DEEP, letterSpacing: "0.15em" }}
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}