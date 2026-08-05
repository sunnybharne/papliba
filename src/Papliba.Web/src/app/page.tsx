import Link from "next/link";

const productHighlights = [
  {
    title: "Organize work first",
    text: "Start with organizations and projects so every workflow has a clear place to live.",
  },
  {
    title: "Build small steps",
    text: "Create simple workers that do one job well, then connect them into larger flows.",
  },
  {
    title: "Keep control local",
    text: "Papliba starts local-first, with room for team and server versions later.",
  },
];

const workflowSteps = ["Trigger", "Worker", "Worker", "Output"];

export default function Home() {
  return (
    <main className="marketing-shell">
      <header className="marketing-nav">
        <Link className="marketing-brand" href="/">
          <strong>Papliba</strong>
          <span>Workflow builder</span>
        </Link>

        <nav className="marketing-links" aria-label="Marketing navigation">
          <Link href="/docs">Docs</Link>
          <Link href="/changelog">Changelog</Link>
          <Link href="/releases">Releases</Link>
        </nav>

        <Link className="primary-button" href="/app">
          Open app
        </Link>
      </header>

      <section className="marketing-hero">
        <div className="marketing-hero-copy">
          <span className="marketing-eyebrow">Local-first automation</span>
          <h1>Turn repeatable work into connected workflows.</h1>
          <p>
            Papliba is a visual workflow product where triggers, workers, and
            outputs can be connected together. It starts simple with
            organizations and projects, then grows toward reusable automation.
          </p>

          <div className="marketing-actions">
            <Link className="primary-button" href="/app">
              Try the app demo
            </Link>
            <Link className="ghost-button" href="/docs">
              Read the docs
            </Link>
          </div>
        </div>

        <div className="product-preview" aria-label="Papliba product preview">
          <div className="preview-sidebar">
            <div className="preview-brand">Papliba</div>
            <div className="preview-search">Search</div>
            <div className="preview-section-label">Organization</div>
            <div className="preview-org-row">
              <span>P</span>
              <strong>papliba-labs</strong>
            </div>
            <div className="preview-project">customer-workflows</div>
            <div className="preview-project">content-automation</div>
          </div>

          <div className="preview-workspace">
            <span>Workflow draft</span>
            <strong>New customer onboarding</strong>
            <div className="preview-flow">
              {workflowSteps.map((step) => (
                <div className="preview-flow-step" key={step}>
                  {step}
                </div>
              ))}
            </div>
            <div className="preview-note">
              One worker can pass its output to the next step.
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-section-heading">
          <span>Product idea</span>
          <h2>Simple enough to explain, flexible enough to grow.</h2>
        </div>

        <div className="marketing-card-grid">
          {productHighlights.map((highlight) => (
            <article className="marketing-card" key={highlight.title}>
              <strong>{highlight.title}</strong>
              <p>{highlight.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-band">
        <div>
          <span>Product path</span>
          <h2>Personal first, teams later.</h2>
          <p>
            The personal version can run locally for individual users. A future
            team version can add shared workflows, permissions, audit logs, and
            managed provider keys.
          </p>
        </div>

        <Link className="ghost-button" href="/docs">
          View project docs
        </Link>
      </section>
    </main>
  );
}
