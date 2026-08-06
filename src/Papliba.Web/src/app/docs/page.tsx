import Link from "next/link";
import { SiteShell } from "../site-shell";

const docsCards = [
  {
    href: "/changelog",
    label: "Project history",
    title: "Changelog",
    text: "Track every meaningful change as Papliba evolves.",
  },
  {
    href: "/releases",
    label: "Release notes",
    title: "Releases",
    text: "Read the human-facing notes for each public version.",
  },
  {
    href: "https://github.com/sunnybharne/papliba",
    label: "Source code",
    title: "GitHub",
    text: "View the open-source repository, license, and contribution docs.",
  },
];

export default function DocsPage() {
  return (
    <SiteShell
      current="/docs"
      description="Product and project documentation for Papliba."
      eyebrow="Documentation"
      title="Docs"
    >
      <section className="site-hero-panel">
        <h1>Learn what Papliba is and how the project is evolving.</h1>
        <p>
          Papliba is starting as a small product: projects, workflows, and a
          local-first workspace. The long-term direction is a visual workflow
          builder that connects triggers, workers, and outputs.
        </p>

        <div className="site-actions">
          <Link className="primary-button" href="/app">
            Open app demo
          </Link>
          <Link className="ghost-button" href="/changelog">
            View changelog
          </Link>
        </div>
      </section>

      <section className="site-card-grid" aria-label="Documentation links">
        {docsCards.map((card) => (
          <Link
            className="site-card site-card-link"
            href={card.href}
            key={card.href}
          >
            <span>{card.label}</span>
            <strong>{card.title}</strong>
            <p>{card.text}</p>
          </Link>
        ))}
      </section>
    </SiteShell>
  );
}
