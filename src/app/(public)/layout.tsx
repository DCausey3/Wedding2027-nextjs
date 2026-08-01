"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";

export default function PublicLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Hides navbar/footer if the pathname is "/save-the-date" (ignores query parameters)
    const isSaveTheDatePage = pathname.startsWith("/save-the-date");

    return (
        <>
            {!isSaveTheDatePage && <Navbar />}
            <main id="main-content">{children}</main>
            {!isSaveTheDatePage && <Footer />}
        </>
    );
}