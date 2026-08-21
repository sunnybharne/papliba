import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CopyCode } from '../components/CopyCode';
import { ExternalIcon } from '../components/Icons';
import { product } from '../content/product';

const localSetup = `git clone https://github.com/sunnybharne/papliba.git
cd papliba
nvm use
npm ci
npm run dev`;

const qualityChecks = `npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build`;

const docNav = [
  { label: 'Start here', id: 'start-here' },
  { label: 'Project status', id: 'project-status' },
  { label: 'Technology', id: 'technology' },
  { label: 'Local development', id: 'local-development' },
  { label: 'Quality workflow', id: 'quality-workflow' },
  { label: 'Source documents', id: 'source-documents' },
] as const;

export function DocsPage() {
  const [searchParams] = useSearchParams();
  const selectedSection = searchParams.get('section');

  useEffect(() => {
    if (!selectedSection) return;
    document.getElementById(selectedSection)?.scrollIntoView({ block: 'start' });
  }, [selectedSection]);

  return (
    <>
      <section className="docs-hero section-grid-bg">
        <div className="shell docs-hero__inner">
          <div>
            <p className="eyebrow">DOCUMENTATION</p>
            <h1>Start with what is true today.</h1>
            <p>
              Papliba is in architecture preview. These docs separate the current website from the
              proposed local application so contributors can make decisions from the same facts.
            </p>
          </div>
          <div className="docs-version-card">
            <span>CURRENT VERSION</span>
            <strong>v{product.version}</strong>
            <p>{product.phase}</p>
          </div>
        </div>
      </section>

      <div className="shell docs-layout">
        <aside className="docs-sidebar">
          <span>ON THIS PAGE</span>
          <nav aria-label="Documentation sections">
            {docNav.map((item) => (
              <Link key={item.id} to={`/docs?section=${item.id}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <a
            className="docs-sidebar__github"
            href={product.repository}
            target="_blank"
            rel="noreferrer"
          >
            View source <ExternalIcon />
          </a>
        </aside>

        <article className="docs-content">
          <section id="start-here">
            <p className="docs-overline">OVERVIEW</p>
            <h2>Start here</h2>
            <p className="docs-lead">
              Papliba is an open-source product direction for a visual Pi interface. The goal is to
              make agent activity easier to follow and review while preserving Pi as the underlying
              coding-agent runtime.
            </p>
            <div className="docs-note docs-note--lime">
              <strong>What you can use now</strong>
              <p>
                The product website, architecture decision, roadmap, and contributor foundation.
                There is no downloadable Papliba agent application in this release.
              </p>
            </div>
          </section>

          <section id="project-status">
            <p className="docs-overline">STATUS</p>
            <h2>Project status</h2>
            <div className="status-matrix">
              <div>
                <span className="matrix-state matrix-state--done">AVAILABLE</span>
                <strong>Product and documentation site</strong>
                <p>React/Vite static site deployed to GitHub Pages.</p>
              </div>
              <div>
                <span className="matrix-state matrix-state--decision">PROPOSED</span>
                <strong>Local companion architecture</strong>
                <p>ASP.NET Core bridge between the browser and Pi RPC.</p>
              </div>
              <div>
                <span className="matrix-state matrix-state--planned">PLANNED</span>
                <strong>Interactive agent workspace</strong>
                <p>Sessions, streaming activity, changes, and approval surfaces.</p>
              </div>
            </div>
          </section>

          <section id="technology">
            <p className="docs-overline">TECHNOLOGY</p>
            <h2>Technology choices</h2>
            <p>
              The current repository is intentionally one React application rather than a Next.js
              project. It produces static assets that GitHub Pages can host directly.
            </p>
            <div className="technology-grid">
              <div>
                <span>NOW</span>
                <h3>Product site</h3>
                <ul>
                  <li>React + TypeScript</li>
                  <li>Vite build system</li>
                  <li>Hash-based routing</li>
                  <li>GitHub Pages hosting</li>
                </ul>
              </div>
              <div>
                <span>PROPOSED</span>
                <h3>Local application</h3>
                <ul>
                  <li>Same React client</li>
                  <li>ASP.NET Core companion</li>
                  <li>SignalR or WebSocket transport</li>
                  <li>Pi RPC child process</li>
                </ul>
              </div>
            </div>
            <div className="docs-note">
              <strong>Why the companion is necessary</strong>
              <p>
                A website hosted on GitHub Pages cannot spawn a local process or safely access a
                workspace. The future companion provides that trusted local boundary.
              </p>
            </div>
          </section>

          <section id="local-development">
            <p className="docs-overline">DEVELOPMENT</p>
            <h2>Run the site locally</h2>
            <p>
              Use Node 24 LTS. The repository pins the expected runtime in <code>.nvmrc</code> and
              commits the npm lockfile for reproducible installs.
            </p>
            <CopyCode>{localSetup}</CopyCode>
            <p>
              Vite prints the local URL. Changes under <code>src/</code> update immediately during
              development.
            </p>
          </section>

          <section id="quality-workflow">
            <p className="docs-overline">QUALITY</p>
            <h2>Quality workflow</h2>
            <p>
              Every pull request runs formatting, linting, type checking, tests, and the production
              build. Run them together with <code>npm run validate</code>, or separately:
            </p>
            <CopyCode label="Checks">{qualityChecks}</CopyCode>
            <p>
              Husky runs lint-staged before a commit and Commitlint checks Conventional Commit
              messages. These local hooks are a fast feedback layer; CI remains the source of truth.
            </p>
          </section>

          <section id="source-documents">
            <p className="docs-overline">DEEPER READING</p>
            <h2>Source documents</h2>
            <div className="source-link-list">
              <a
                href={`${product.repository}/blob/main/docs/PRODUCT.md`}
                target="_blank"
                rel="noreferrer"
              >
                <span>
                  <strong>Product brief</strong>
                  <small>Audience, problem, principles, and scope</small>
                </span>
                <ExternalIcon />
              </a>
              <a
                href={`${product.repository}/blob/main/docs/ARCHITECTURE.md`}
                target="_blank"
                rel="noreferrer"
              >
                <span>
                  <strong>Architecture decision</strong>
                  <small>Boundaries, protocol, security, and alternatives</small>
                </span>
                <ExternalIcon />
              </a>
              <a
                href={`${product.repository}/blob/main/docs/ROADMAP.md`}
                target="_blank"
                rel="noreferrer"
              >
                <span>
                  <strong>Roadmap</strong>
                  <small>Now, next, and later without invented dates</small>
                </span>
                <ExternalIcon />
              </a>
              <a href={product.piRpcDocs} target="_blank" rel="noreferrer">
                <span>
                  <strong>Official Pi RPC docs</strong>
                  <small>The integration contract Papliba plans to use</small>
                </span>
                <ExternalIcon />
              </a>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}
