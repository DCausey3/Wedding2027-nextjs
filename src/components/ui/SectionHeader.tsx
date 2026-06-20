interface SectionHeaderProps {
  overline?: string;
  title: string;
  titleItalic?: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  id?: string;
}

export function SectionHeader({
  overline,
  title,
  titleItalic,
  subtitle,
  align = "center",
  className = "",
  id,
}: SectionHeaderProps) {
  const textAlign = align === "left" ? "text-left" : "text-center";

  return (
    <div className={`${textAlign} ${className}`}>
      {overline && (
        <p className="label-overline text-sand mb-3">{overline}</p>
      )}
      <h2 id={id} className="heading-section text-dark">
        {title}{" "}
        {titleItalic && <span className="italic text-sand">{titleItalic}</span>}
      </h2>
      {subtitle && (
        <p className="mt-4 text-sm text-dark/60 leading-relaxed max-w-xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
