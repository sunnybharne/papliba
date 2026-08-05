import Link from "next/link";

const siteLinks = [
  { href: "/", label: "Product" },
  { href: "/docs", label: "Docs" },
  { href: "/app", label: "App demo" },
  { href: "/changelog", label: "Changelog" },
  { href: "/releases", label: "Releases" },
];

type SiteShellProps = {
  children: React.ReactNode;
  current: string;
  description: string;
  eyebrow: string;
  title: string;
};

export function SiteShell({
  children,
  current,
  description,
  eyebrow,
  title,
}: SiteShellProps) {
  return (
    <main className="site-shell">
      <aside className="sidebar site-sidebar" aria-label="Papliba website">
        <div className="brand-row">
          <Link className="brand-name site-brand" href="/">
            <strong>Papliba</strong>
            <span>website</span>
          </Link>
        </div>

        <nav className="site-nav" aria-label="Website navigation">
          {siteLinks.map((link) => (
            <Link
              aria-current={current === link.href ? "page" : undefined}
              className="site-nav-link"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a
            className="account-button site-github-link"
            href="https://github.com/sunnybharne/papliba"
            rel="noreferrer"
            target="_blank"
          >
            <span className="avatar">GH</span>
            <span>
              <strong>GitHub</strong>
            </span>
          </a>
        </div>
      </aside>

      <section className="site-panel">
        <header className="workspace-header">
          <div className="workspace-title-text">
            <span>{eyebrow}</span>
            <strong>{title}</strong>
          </div>
        </header>

        <div className="site-content">
          <section className="site-intro">
            <p>{description}</p>
          </section>

          {children}
        </div>
      </section>
    </main>
  );
}
