export const metadata = {
    title: "Privacy Policy — Causey/Cárdenas Wedding",
};

export default function PrivacyPolicyPage() {
    return (
        <main
            style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                maxWidth: "720px",
                margin: "60px auto",
                padding: "0 20px",
                lineHeight: 1.7,
                color: "#2b2b2b",
                background: "#fffdf8",
            }}
        >
            <h1 style={{ fontSize: "1.8rem", marginBottom: "0.2em", color: "#5b4636" }}>
                Privacy Policy — Causey/Cárdenas Wedding
            </h1>
            <p style={{ fontStyle: "italic", color: "#777", marginBottom: "2em" }}>
                Effective date: August 1, 2027
            </p>

            <p>
                This website (causeycardenasforever.com) is operated by Causey Innovations
                LLC on behalf of the couple for the purpose of wedding planning and guest
                communication.
            </p>

            <SectionHeading>Information We Collect</SectionHeading>
            <p>
                We collect the name, phone number, and email address (if provided) of
                invited guests for the purpose of sending wedding-related updates,
                including save-the-date announcements, RSVP confirmations, and travel
                information.
            </p>

            <SectionHeading>How We Use Your Information</SectionHeading>
            <p>
                Your phone number is used solely to send text messages (SMS/MMS/WhatsApp)
                related to our wedding, including save-the-date notices, invite codes,
                RSVP reminders, and travel details. Your email, if provided, is used to
                send additional travel and event information as it becomes available.
            </p>

            <SectionHeading>Message Frequency</SectionHeading>
            <p>
                Guests can expect to receive occasional messages (approximately 2–5
                total) related to save-the-date announcements, RSVP status, and wedding
                updates. Message and data rates may apply.
            </p>

            <SectionHeading>Non-Sharing of Information</SectionHeading>
            <p>
                We do not sell, rent, or share your phone number or personal information
                with third parties for marketing purposes. Your information is used
                exclusively for wedding-related communication from the couple.
            </p>

            <SectionHeading>Opt-Out</SectionHeading>
            <p>You may opt out of text messages at any time by replying STOP. Reply HELP for help.</p>

            <SectionHeading>Contact</SectionHeading>
            <p>
                Questions about this policy can be directed to{" "}
                <a href="mailto:[your email]" style={{ color: "#8a6d3b" }}>
                   d.causey@causeyinnovations.com
                </a>
                .
            </p>

            <footer
                style={{
                    marginTop: "3em",
                    fontSize: "0.9rem",
                    color: "#999",
                    textAlign: "center",
                }}
            >
                Causey &amp; Cárdenas · June 13 , 2027
            </footer>
        </main>
    );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <h2
            style={{
                fontSize: "1.15rem",
                marginTop: "2em",
                color: "#5b4636",
                borderBottom: "1px solid #e4dcc8",
                paddingBottom: "4px",
            }}
        >
            {children}
        </h2>
    );
}