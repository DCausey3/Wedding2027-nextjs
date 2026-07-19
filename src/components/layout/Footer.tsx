"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "../../app/context/AuthContext";

const COLORS = {
    navy: "#2c3e4a",
    ivory: "#FFF7EC",
    sand: "#E6D2B3",
    apricot: "#FFB482",
    muted: "#8a9aa5",
};

const FOOTER_LINKS = [
    { href: "/events", label: "Events" },
    { href: "/travel", label: "Travel" },
    { href: "/rsvp", label: "RSVP" },
    { href: "/registry", label: "Registry" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
];

export function Footer() {
    const { guest, loaded } = useAuth();
    const router = useRouter();

    // Avoid a flash of "enabled" links before sessionStorage rehydration finishes.
    const locked = !loaded || !guest;

    const handleLockedClick = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push("/");
    };

    return (
        <footer style={{ backgroundColor: COLORS.navy }} className="py-12 px-6">
            <div className="container-wedding mx-auto">
                <div className="flex flex-col items-center text-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-px w-8" style={{ backgroundColor: COLORS.sand, opacity: 0.4 }} />
                        <Heart size={13} style={{ color: COLORS.apricot, fill: COLORS.apricot }} />
                        <div className="h-px w-8" style={{ backgroundColor: COLORS.sand, opacity: 0.4 }} />
                    </div>

                    <p className="font-serif text-2xl font-light" style={{ color: COLORS.ivory }}>
                        Jhoana <span className="italic" style={{ color: COLORS.sand }}>&amp;</span> Damariel
                    </p>

                    <nav aria-label="Footer navigation">
                        <ul className="flex flex-wrap justify-center gap-6 list-none">
                            {FOOTER_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={locked ? "/" : link.href}
                                        onClick={locked ? handleLockedClick : undefined}
                                        aria-disabled={locked}
                                        title={locked ? "Log in to access this page" : undefined}
                                        className="label-overline transition-colors"
                                        style={{
                                            color: "rgba(255,247,236,0.4)",
                                            cursor: locked ? "not-allowed" : "pointer",
                                            opacity: locked ? 0.5 : 1,
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!locked) e.currentTarget.style.color = COLORS.sand;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = "rgba(255,247,236,0.4)";
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <p className="text-xs mt-2" style={{ color: "rgba(255,247,236,0.2)" }}>
                        Made with love &hearts;
                        &nbsp;·&nbsp;
                        Site by{" "}
                        <a
                            href="https://causeyinnovations.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors"
                            style={{ color: "rgba(255,247,236,0.35)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.sand)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,247,236,0.35)")}
                        >
                            Causey Innovations
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}