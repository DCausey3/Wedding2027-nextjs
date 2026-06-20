import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#1a1209" }} className="py-12 px-6">
      <div className="container-wedding mx-auto">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Monogram */}
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-sand opacity-40" />
            <Heart size={13} className="text-sand fill-sand" />
            <div className="h-px w-8 bg-sand opacity-40" />
          </div>

          <p className="font-serif text-2xl font-light text-ivory">
            Jhoana <span className="italic text-sand">&amp;</span> Damariel
          </p>

          <p className="label-overline text-ivory/40">
            Colombia · November 2026 &nbsp;|&nbsp; USA · December 2026
          </p>

          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-6 list-none">
              {[
                { href: "/events", label: "Events" },
                { href: "/travel", label: "Travel" },
                { href: "/rsvp", label: "RSVP" },
                { href: "/registry", label: "Registry" },
                { href: "/faq", label: "FAQ" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="label-overline text-ivory/40 hover:text-sand transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="text-xs text-ivory/20 mt-2">
            Made with love &hearts; &nbsp;·&nbsp; Wedding 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
