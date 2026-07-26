import type { Metadata } from "next";
import { Mail, Phone, Heart } from "lucide-react";
import { ContactForm } from "@/components/wedding/ContactForm";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = { title: "Contact" };

// ─── Palette — Sky Blue + Apricot + Ivory + Sand ───────────────────────────
const SKY_DEEP = "#123B54";
const IVORY = "#FFF7EC";
const SAND_LIGHT = "#F2E8D5";
const APRICOT = "#FFB482";

export default function ContactPage() {
    return (
        <div style={{ backgroundColor: IVORY }}>
            <div className="pt-32 pb-20 px-6 text-center" style={{ backgroundColor: SKY_DEEP }}>
                <p className="label-overline mb-4" style={{ color: APRICOT }}>Reach Out</p>
                <h1 className="heading-display" style={{ color: IVORY }}>
                    Get in <span className="italic" style={{ color: APRICOT }}>Touch</span>
                </h1>
            </div>

            <section className="section-pad">
                <div className="container-wedding mx-auto">
                    <div className="max-w-lg mx-auto text-center">
                        <SectionHeader overline="We'd love to hear from you" title="Questions?" align="center" />
                        <p className="mt-4 text-sm leading-relaxed mx-auto" style={{ color: `${SKY_DEEP}99` }}>
                            Whether you have questions about travel, accommodations, attire, or anything else — we&apos;re here to help make your experience seamless and joyful.
                        </p>
                        <div className="mt-8 space-y-4 flex flex-col items-center">
                            <div className="flex items-center gap-3 justify-center">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: SAND_LIGHT }}>
                                    <Mail size={16} style={{ color: APRICOT }} />
                                </div>
                                <div className="text-left">
                                    <p className="label-overline mb-0.5" style={{ color: `${SKY_DEEP}66` }}>Email</p>
                                    <a
                                        href="mailto:causeycardenas@gmail.com"
                                        className="text-sm transition-colors"
                                        style={{ color: SKY_DEEP }}
                                    >
                                        causeycardenas@gmail.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 justify-center">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: SAND_LIGHT }}>
                                    <Phone size={16} style={{ color: APRICOT }} />
                                </div>
                                <div className="text-left">
                                    <p className="label-overline mb-0.5" style={{ color: `${SKY_DEEP}66` }}>WhatsApp or text</p>
                                    <p className="text-sm" style={{ color: SKY_DEEP }}>+1 (813)464-1733 or (352)284-1736</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 justify-center">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: SAND_LIGHT }}>
                                    <Heart size={16} style={{ color: APRICOT, fill: APRICOT }} />
                                </div>
                                <div className="text-left">
                                    <p className="label-overline mb-0.5" style={{ color: `${SKY_DEEP}66` }}>Response Time</p>
                                    <p className="text-sm" style={{ color: SKY_DEEP }}>Within 48 hours</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}