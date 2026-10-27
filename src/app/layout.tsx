import type { Metadata } from "next";
import "./globals.css";
import { SupabaseProvider } from "../components/providers/SupabaseProvider";
import { LanguageProvider } from "../components/providers/LanguageProvider";
// 1. Import your AuthProvider (adjust the path if it lives somewhere else)
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: {
        default: "Jhoana & Damariel | Wedding 2027",
        template: "%s | Jhoana & Damariel",
    },
    description:
        "Join us as we celebrate our love — two weddings, two countries, one love story.",
    openGraph: {
        type: "website",
        siteName: "Jhoana & Damariel Wedding",
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>
        <SupabaseProvider>
            <LanguageProvider>
                {/* AuthProvider stays inside SupabaseProvider so auth code can access Supabase. */}
                <AuthProvider>{children}</AuthProvider>
                <Toaster
                    position="top-center"
                    toastOptions={{
                        style: {
                            fontFamily: "var(--font-inter)",
                            borderRadius: "12px",
                        },
                    }}
                />
            </LanguageProvider>
        </SupabaseProvider>
        </body>
        </html>
    );
}