interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: 'left' | 'center';
}

export function SectionHeading({ eyebrow, title, copy, align = 'left' }: SectionHeadingProps) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy ? <p className="section-copy">{copy}</p> : null}
    </div>
  );
}
