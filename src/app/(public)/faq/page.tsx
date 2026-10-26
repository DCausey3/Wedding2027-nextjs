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

// ─── Types ──────────────────────────────────────────────────────────────────
// "both" = only show when the guest can see BOTH weddings
type Region = "colombia" | "florida" | "both";

type FAQItem = { q: string; a: string; region?: Region };
type FAQSection = { category: string; region?: Region; items: FAQItem[] };

// Fields are read defensively because the guest object comes from sessionStorage
// and may use slightly different keys depending on the API mapping.
type Guest = {
    role?: string;
    stdResponded?: boolean | string;
    stdAttendingColombia?: boolean | string;
    stdAttendingFlorida?: boolean | string;
    attendingColombia?: boolean | string;
    attendingFlorida?: boolean | string;
    attendingUsa?: boolean | string;
    selectedWedding?: string;
    selected_wedding?: string;
    eligibleColombia?: boolean | string;
};

function isTruthy(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.trim().toLowerCase() === "true";
    return false;
}

type Visibility = { colombia: boolean; florida: boolean; hasGuestContext: boolean };

// Decide which wedding(s) this guest should see information for.
function resolveVisibility(guest: Guest | null): Visibility {
    // No guest session (public visit): show everything.
    if (!guest) return { colombia: true, florida: true, hasGuestContext: false };

    // Bride / Groom (admin) see everything.
    if (guest.role === "Bride" || guest.role === "Groom") {
        return { colombia: true, florida: true, hasGuestContext: true };
    }

    // Guest already answered the save-the-date → follow their actual answers.
    if (isTruthy(guest.stdResponded)) {
        return {
            colombia: isTruthy(guest.stdAttendingColombia) || isTruthy(guest.attendingColombia),
            florida:
                isTruthy(guest.stdAttendingFlorida) ||
                isTruthy(guest.attendingFlorida) ||
                isTruthy(guest.attendingUsa),
            hasGuestContext: true,
        };
    }

    // Not responded yet → follow the wedding(s) they were invited to.
    const invited = String(guest.selectedWedding ?? guest.selected_wedding ?? "")
        .trim()
        .toLowerCase();
    if (invited === "both") return { colombia: true, florida: true, hasGuestContext: true };
    if (invited === "colombia") return { colombia: true, florida: false, hasGuestContext: true };
    if (invited === "usa" || invited === "us" || invited === "florida") {
        return { colombia: false, florida: true, hasGuestContext: true };
    }

    // Unknown → don't hide anything.
    return { colombia: true, florida: true, hasGuestContext: true };
}

function useGuestVisibility() {
    const [visibility, setVisibility] = useState<Visibility>({
        colombia: true,
        florida: true,
        hasGuestContext: false,
    });
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let guest: Guest | null = null;
        const stored = sessionStorage.getItem("guest");
        if (stored) {
            try {
                guest = JSON.parse(stored);
            } catch {
                // ignore malformed storage
            }
        }
        setVisibility(resolveVisibility(guest));
        setLoaded(true);
    }, []);

    return { ...visibility, loaded };
}

function isVisible(region: Region | undefined, v: Visibility): boolean {
    if (!region) return true;
    if (region === "colombia") return v.colombia;
    if (region === "florida") return v.florida;
    return v.colombia && v.florida; // "both"
}

// ─── FAQ content ────────────────────────────────────────────────────────────
const ALL_FAQS: FAQSection[] = [
    {
        category: "General",
        items: [
            {
                q: "Can I attend both weddings?",
                a: "Absolutely! We would love to celebrate with you twice. Some guests are invited to choose one or both — check your invitation for details.",
                region: "both",
            },
            {
                q: "What is the RSVP deadline?",
                a: "Please RSVP by  December 1st, 2026. This helps us finalize guest counts, meals, and travel logistics for both celebrations.",
            },
            {
                q: "How will I get updates about the wedding?",
                a: "We'll send wedding updates by text message to the number on your invitation, and you'll also receive emails once you complete your RSVP. The text number is only used for updates, so please don't reply to it with questions.",
            },
            {
                q: "Can I bring a plus-one?",
                a: "Your invitation shows whether a plus-one is included. If it is, you'll be able to add their name when you RSVP. If you're unsure, please contact us directly.",
            },
            {
                q: "I have dietary restrictions or allergies. What should I do?",
                a: "Please let us know when you RSVP so we can plan meals that work for everyone. If your needs change later, contact us directly.",
            },
            {
                q: "What if I need to change my RSVP or my plans change?",
                a: "No problem. Please reach out to us directly as soon as you know so we can update our guest count and logistics.",
            },
            {
                q: "Will there be transportation between venues?",
                a: "Yes — we have arranged shuttle service from select hotels at both locations. Please indicate shuttle needs on your RSVP form.",
            },
        ],
    },
    {
        category: "Colombia Wedding",
        region: "colombia",
        items: [
            {
                q: "Do I need a visa to enter Colombia?",
                a: "US, Canadian, EU, and UK citizens do not require a visa for stays under 90 days. Check with your country's embassy for specific requirements.",
            },
            {
                q: "Is a passport required?",
                a: "Yes — a valid passport is required for all international travelers to Colombia. Ensure yours is valid for at least 6 months beyond your travel dates.",
            },
            {
                q: "When should I arrive in Colombia?",
                a: "Please plan to arrive at least one day before the wedding to allow for travel delays and give yourself time to rest and settle in.",
            },
            {
                q: "Which airport should I fly into for Colombia?",
                a: "Pereira (PEI) is about an hour by car from Manizales and is the easiest option for most guests. Manizales (MZL) is closest to town but only has domestic flights, usually connecting through Bogotá or Medellín. Please arrange a taxi or private transfer ahead of time.",
            },
            {
                q: "Do I need to know Spanish?",
                a: "Basic to intermediate Spanish is helpful. We will have bilingual staff and a bilingual ceremony, but we strongly encourage you to practice some Spanish before the trip — Duolingo is a great way to learn the basics.",
            },
            {
                q: "What is the dress code for Colombia?",
                a: "Tropical formal / Festive attire. The ceremony is outdoors in a tropical garden. Bridesmaids will wear Coral; groomsmen will wear Sand.",
            },
            {
                q: "What should I pack?",
                a: "Manizales sits high in the Andes, so days are mild and evenings can be cool and rainy. Pack layers, a light jacket, a rain layer, comfortable shoes for garden terrain, and sunscreen. Bring your passport and a copy of your travel documents, and keep them with you rather than in checked luggage.",
            },
            {
                q: "What currency should I bring?",
                a: "The Colombian Peso (COP) is the local currency. Credit cards are widely accepted. We recommend bringing some cash for local experiences.",
            },
            {
                q: "Will my phone work in Colombia?",
                a: "Check with your carrier about an international plan, or consider a travel eSIM before you leave. Hotel Wi-Fi is typically available, but it's good to have a backup.",
            },
            {
                q: "Do I need any vaccinations or travel insurance?",
                a: "Requirements vary by traveler and by region, so please check the CDC's travel health notices for Colombia and talk with your doctor before you go. We also recommend travel insurance that covers trip cancellation and medical care abroad.",
            },
        ],
    },
    {
        category: "USA Wedding",
        region: "florida",
        items: [
            {
                q: "Which airport should I fly into?",
                a: "Gainesville Regional Airport (GNV) is the closest. Jacksonville (JAX) is about 1 hour 15 minutes away, and Orlando (MCO) and Tampa (TPA) are roughly 2 hours away, so plan on a rental car if you choose one of those.",
            },
            {
                q: "Do I need a rental car?",
                a: "If you fly into Gainesville and stay at one of our recommended hotels, you may be able to rely on the shuttle service. If you fly into Orlando or Tampa, we recommend a rental car for the drive to Gainesville.",
            },
            {
                q: "What is the dress code for the USA wedding?",
                a: "Black tie / Formal attire. Women: floor-length gowns or formal cocktail dresses. Men: tuxedo or dark formal suit. Bridesmaids in Terracotta; groomsmen in Sand.",
            },
            {
                q: "What will the weather be like in April?",
                a: "Gainesville is typically warm and humid in late April, with the occasional spring shower. Check the forecast a few days before you travel and pack accordingly.",
            },
            {
                q: "Is there parking at the venue?",
                a: "The Baughman Center is on the University of Florida campus and its parking is limited. We'll share parking instructions before the wedding, so consider carpooling or using a rideshare.",
            },
        ],
    },
    {
        category: "Accommodations",
        items: [
            {
                q: "Where should I stay in Colombia?",
                a: "We're finalizing hotel recommendations and room blocks for Manizales, and we'll post them on the Travel page as soon as they're ready. If you'd like to book on your own now, Manizales is the closest city to the venue.",
                region: "colombia",
            },
            {
                q: "Where should I stay in Gainesville?",
                a: "Room block details for Gainesville are coming soon. If you'd like to book now, options near the university include the Hilton University of Florida Conference Center, Hilton Garden Inn Gainesville, and Sweetwater Branch Inn downtown. Gainesville hotels fill up on busy university weekends, so booking early is wise.",
                region: "florida",
            },
        ],
    },
    {
        category: "Registry & Gifts",
        items: [
            {
                q: "Where are you registered?",
                a: "We are registered on Zola (primary), Williams-Sonoma, Crate & Barrel, and Honeyfund for our honeymoon. See our Registry page for links.",
            },
            {
                q: "Should I bring a gift to the wedding?",
                a: "Please don't bring physical gifts to either venue — we'd love for you to travel light! Gifts can be shipped to our home address (provided on Zola).",
            },
        ],
    },
];

export default function FAQPage() {
    const visibility = useGuestVisibility();

    if (!visibility.loaded) return null;

    // Hide any section or question that belongs to a wedding this guest isn't attending.
    const faqs = ALL_FAQS
        .filter((section) => isVisible(section.region, visibility))
        .map((section) => ({
            category: section.category,
            items: section.items
                .filter((item) => isVisible(item.region, visibility))
                .map(({ q, a }) => ({ q, a })),
        }))
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