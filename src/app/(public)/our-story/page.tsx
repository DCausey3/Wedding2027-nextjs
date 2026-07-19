import type { Metadata } from "next";
import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = { title: "Our Story" };

// Palette — Sky Blue + Apricot + Ivory + Sand
const NAVY = "#2c3e4a";
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const APRICOT = "#FFB482";

const MOMENTS = [
    {
        year: "2023",
        title: "A Simple Swipe",
        body: "It all started with a match on Hinge in August 2023. Neither of us expected a dating app to lead us to the love of our lives — but the connection was undeniable from the very first conversation.",
    },
    {
        year: "2023",
        title: "Loaded Fries & Fast Five",
        body: "Our first date was at Flippin' Fries Factory in The Krates. Damariel was so nervous he barely ate — until one question changed everything: \"What's your favorite movie?\" Jhoana's answer, Fast & Furious 7, sealed the deal. That lunch turned into an entire day together.",
    },
    {
        year: "2024",
        title: "Growing Together",
        body: "We celebrated life's victories and supported each other through every challenge — Damariel finishing college, Jhoana preparing for medical school. We learned the best relationships are built on friendship, trust, teamwork, and faith.",
    },
    {
        year: "Feb 2025",
        title: "A New Chapter in Texas",
        body: "When Damariel had the opportunity to start his career in Texas, only one opinion mattered — Jhoana's. Her answer confirmed what he already knew: they were building a future together, and she moved to Texas with him.",
    },
    {
        year: "May 2026",
        title: "The Proposal",
        body: "After weeks of planning — finding the perfect ring, asking for her family's blessing, and secretly coordinating a photographer — Damariel took Jhoana to the Dallas Arboretum and Botanical Garden. Surrounded by blooming gardens, he got down on one knee. She said yes.",
    },
    {
        year: "2027",
        title: "Two Celebrations",
        body: "Now, with grateful hearts and surrounded by the love of family and friends, we're beginning our greatest adventure yet — with celebrations in both Colombia and Fort Worth, Texas.",
    },
];

export default function OurStoryPage() {
    return (
        <div style={{ backgroundColor: IVORY }}>
            {/* Page hero */}
            <div className="pt-32 pb-20 px-6 text-center" style={{ backgroundColor: NAVY }}>
                <p className="label-overline mb-4" style={{ color: APRICOT }}>Our Journey</p>
                <h1 className="heading-display" style={{ color: IVORY }}>
                    The Story{" "}
                    <span className="italic" style={{ color: APRICOT }}>So Far</span>
                </h1>
            </div>

            {/* Engagement photos grid */}
            <section className="section-pad container-wedding mx-auto">
                <div className="grid grid-cols-12 gap-4 mb-20">
                    <div className="col-span-7 aspect-video overflow-hidden rounded-2xl">
                        <Image
                            src="/IMG_8208.jpeg"
                            alt="Jhoana and Damariel together"
                            width={900} height={506}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    <div className="col-span-5 aspect-[4/3] overflow-hidden rounded-2xl">
                        <Image
                            src="/IMG_2961.jpeg"
                            alt="The ring"
                            width={600} height={450}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>

                {/* Timeline */}
                <SectionHeader overline="Chapter by Chapter" title="How We" titleItalic="Got Here" className="mb-16" />

                <div className="max-w-2xl mx-auto relative">
                    <div className="absolute left-6 top-0 bottom-0 w-px" style={{ backgroundColor: `${SAND}` , opacity: 0.6 }} aria-hidden="true" />
                    {MOMENTS.map((moment, i) => (
                        <div key={i} className="relative flex gap-8 mb-12">
                            <div className="flex-shrink-0 z-10">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: NAVY }}>
                                    <span className="font-serif text-[0.65rem] text-center leading-tight px-1" style={{ color: IVORY }}>{moment.year}</span>
                                </div>
                            </div>
                            <div className="flex-1 pb-4">
                                <h3 className="font-serif text-xl font-normal mb-2" style={{ color: NAVY }}>{moment.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: NAVY, opacity: 0.65 }}>{moment.body}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Full narrative */}
                <div className="max-w-2xl mx-auto mt-4 mb-20">
                    <SectionHeader overline="In Their Own Words" title="The Full" titleItalic="Story" className="mb-12" />

                    <div className="space-y-6 text-sm leading-relaxed" style={{ color: NAVY, opacity: 0.75 }}>
                        <p>It all started with a simple swipe on Hinge.</p>

                        <p>
                            Neither of us expected that trying out a dating app would lead to finding the love of our lives. After
                            matching, we spent a few days getting to know each other through the app. Little did Damariel know that
                            Jhoana was actually recovering in bed from an injury during those first conversations. Even so, the
                            connection was undeniable.
                        </p>

                        <p>
                            Before long, we exchanged phone numbers and our conversations became even more frequent. It didn't
                            take long before we decided to meet in person.
                        </p>

                        <p>
                            Our first date was at <strong style={{ color: NAVY, opacity: 1 }}>Flippin' Fries Factory</strong> in
                            The Krates. We shared a basket of loaded fries, although Damariel was so nervous he barely ate! As the
                            conversation flowed, one simple question changed everything:
                        </p>

                        <p className="italic pl-4" style={{ borderLeft: `2px solid ${APRICOT}` }}>
                            "What's your favorite movie?"
                        </p>

                        <p>
                            When Jhoana answered <strong style={{ color: NAVY, opacity: 1 }}>Fast & Furious 7</strong>, Damariel
                            couldn't believe it. As a huge Fast & Furious fan himself, he instantly knew they had something special
                            in common. That lunch date quickly turned into an entire day together, talking, laughing, and getting
                            to know one another.
                        </p>

                        <p>
                            Over the next year, our relationship continued to grow. We celebrated life's victories together and
                            supported each other through every challenge. Damariel completed college while Jhoana prepared for the
                            next step in her journey toward medical school. Through it all, we became each other's biggest
                            supporters, learning that the best relationships are built on friendship, trust, teamwork, and faith.
                        </p>

                        <p>
                            When Damariel received an opportunity to begin his career in Texas, there was only one opinion that
                            truly mattered — Jhoana's. Before making the decision, he asked how she felt about starting this new
                            chapter together and whether she would be willing to make the move. Her answer confirmed what he
                            already knew in his heart: they were building a future together.
                        </p>

                        <p>As their love continued to grow, Damariel knew it was time to ask the most important question of his life.</p>

                        <p>
                            After weeks of planning, finding the perfect ring, asking for her family's blessing, and secretly
                            coordinating with a photographer, he invited Jhoana on what seemed like an ordinary date to the{" "}
                            <strong style={{ color: NAVY, opacity: 1 }}>Dallas Arboretum and Botanical Garden</strong>.
                        </p>

                        <p>Surrounded by beautiful gardens and blooming flowers, Damariel got down on one knee and asked Jhoana to spend forever with him.</p>

                        <p className="text-base" style={{ color: NAVY, opacity: 1 }}>She said <strong>yes</strong>.</p>

                        <p>
                            Now, with grateful hearts and surrounded by the love of our family and friends, we're excited to begin
                            our greatest adventure yet — together.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-16 grid grid-cols-3 gap-4 max-w-sm mx-auto text-center">
                    {[
                        { value: "2", label: "Weddings" },
                        { value: "2", label: "Countries" },
                        { value: "∞", label: "Love" },
                    ].map((s) => (
                        <div key={s.label}>
                            <p className="font-serif text-4xl font-light" style={{ color: APRICOT }}>{s.value}</p>
                            <p className="label-overline mt-1" style={{ color: NAVY, opacity: 0.4 }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}