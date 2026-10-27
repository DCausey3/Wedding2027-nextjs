"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "../../app/context/AuthContext";
import { useLanguage } from "../providers/LanguageProvider";

const COLORS = {
    navy: "#2c3e4a",
    ivory: "#FFF7EC",
    sand: "#E6D2B3",
    apricot: "#FFB482",
    muted: "#8a9aa5",
};

export function Footer() {
    const { guest, loaded } = useAuth();
    const router = useRouter();
    const { lang } = useLanguage();

    // Avoid a flash of "enabled" links before sessionStorage rehydration finishes.
    const locked = !loaded || !guest;
    const footerLinks = [
        { href: "/rsvp", label: "RSVP" },
        { href: "/registry", label: lang === "es" ? "Regalos" : "Registry" },
        { href: "/faq", label: "FAQ" },
        { href: "/contact", label: lang === "es" ? "Contacto" : "Contact" },
    ];

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

                    <nav aria-label={lang === "es" ? "Navegación del pie de página" : "Footer navigation"}>
                        <ul className="flex flex-wrap justify-center gap-6 list-none">
                            {footerLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={locked ? "/" : link.href}
                                        onClick={locked ? handleLockedClick : undefined}
                                        aria-disabled={locked}
                                        title={locked ? lang === "es" ? "Inicia sesión para acceder a esta página" : "Log in to access this page" : undefined}
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
                        {lang === "es" ? "Hecho con amor" : "Made with love"} &hearts;
                        &nbsp;·&nbsp;
                        {lang === "es" ? "Sitio web por" : "Site by"}{" "}
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