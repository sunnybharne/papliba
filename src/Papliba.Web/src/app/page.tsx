import Link from "next/link";
import { SiteShell } from "./site-shell";

export default function Home() {
  return (
    <SiteShell
      current="/"
      description="Papliba is a local-first workflow builder for connecting triggers, workers, and outputs."
      eyebrow="Project website"
      title="Papliba"
    >
      <section className="site-hero-panel">
        <h1>Build small workflows that are easy to understand.</h1>
        <p>
          Papliba starts with organizations and projects. The long-term goal is
          a visual workflow builder where one worker can pass output to the next.
        </p>

        <div className="site-actions">
          <Link className="primary-button" href="/app">
            Open app demo
          </Link>
          <Link className="ghost-button" href="/releases/v0-1-0">
            View v0.1.0
          </Link>
        </div>
      </section>

      <section className="site-card-grid" aria-label="Project information">
        <article className="site-card">
          <span>Current version</span>
          <strong>v0.1.0</strong>
          <p>The first public iteration with project foundation and UI demo.</p>
        </article>

        <article className="site-card">
          <span>Workflow idea</span>
          <strong>Trigger -&gt; Worker -&gt; Output</strong>
          <p>Start simple, then grow toward visual automation workflows.</p>
        </article>

        <article className="site-card">
          <span>License</span>
          <strong>Apache-2.0</strong>
          <p>Open source, clear for learning, reuse, and contribution.</p>
        </article>
      </section>
    </SiteShell>
  );
}
