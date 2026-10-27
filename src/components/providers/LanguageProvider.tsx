"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "es";

type LanguageContextValue = {
    lang: Language;
    setLang: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
    lang: "en",
    setLang: () => {},
});

function isLanguage(value: string | null): value is Language {
    return value === "en" || value === "es";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Language>("en");

    useEffect(() => {
        let savedLanguage: string | null = null;
        try {
            savedLanguage = window.localStorage.getItem("lang");
        } catch {
            // Browser privacy settings can disable local storage.
        }

        if (isLanguage(savedLanguage)) {
            setLangState(savedLanguage);
            return;
        }

        const preferredLanguages = navigator.languages?.length
            ? navigator.languages
            : [navigator.language];
        setLangState(
            preferredLanguages.some((language) => language.toLowerCase().startsWith("es"))
                ? "es"
                : "en",
        );
    }, []);

    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    const setLang = (language: Language) => {
        setLangState(language);
        try {
            window.localStorage.setItem("lang", language);
        } catch {
            // The current selection still applies until the page is closed.
        }
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
