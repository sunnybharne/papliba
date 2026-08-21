import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, ExternalIcon } from '../components/Icons';
import { product } from '../content/product';

const phases = [
  {
    status: 'NOW',
    title: 'Make the direction concrete',
    version: '0.8 · architecture preview',
    state: 'complete',
    items: [
      'Product story and design principles',
      'React product and documentation site',
      'Proposed system architecture',
      'CI, Pages, tests, and contribution workflow',
    ],
  },
  {
    status: 'NEXT',
    title: 'Prove the connection',
    version: '0.9 · technical spike',
    state: 'next',
    items: [
      'Minimal ASP.NET Core loopback companion',
      'Start and stop a Pi RPC child process',
      'Map JSONL commands and streaming events',
      'Render one read-only session timeline',
    ],
  },
  {
    status: 'THEN',
    title: 'Build the useful loop',
    version: '0.10 · private alpha',
    state: 'planned',
    items: [
      'Prompt, abort, steering, and follow-up controls',
      'Tool activity and file-change inspection',
      'Workspace and session selection',
      'Installable local packaging',
    ],
  },
  {
    status: 'LATER',
    title: 'Open the surface',
    version: 'Beyond the first usable alpha',
    state: 'planned',
    items: [
      'Extension contribution points',
      'Reusable workflow and view presets',
      'Accessibility and performance hardening',
      'Cross-platform release automation',
    ],
  },
] as const;

export function RoadmapPage() {
  return (
    <>
      <section className="page-hero roadmap-hero section-grid-bg">
        <div className="shell page-hero__inner">
          <p className="eyebrow">PUBLIC ROADMAP</p>
          <h1>Earn the interface one boundary at a time.</h1>
          <p>
            Papliba begins with architecture, then proves the smallest real Pi connection before
            expanding the UI. Implementation happens in private product repositories while this
            public roadmap reports verifiable progress. Sequence matters more than invented release
            dates.
          </p>
        </div>
      </section>

      <section className="section roadmap-section">
        <div className="shell">
          <div className="roadmap-legend">
            <span>
              <i className="legend-dot legend-dot--complete" /> Available
            </span>
            <span>
              <i className="legend-dot legend-dot--next" /> Next focus
            </span>
            <span>
              <i className="legend-dot" /> Planned
            </span>
          </div>
          <div className="roadmap-list">
            {phases.map((phase, index) => (
              <article className={`roadmap-phase roadmap-phase--${phase.state}`} key={phase.status}>
                <div className="roadmap-phase__rail">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <i />
                </div>
                <div className="roadmap-phase__body">
                  <div className="roadmap-phase__heading">
                    <div>
                      <span className="phase-status">{phase.status}</span>
                      <h2>{phase.title}</h2>
                    </div>
                    <span className="phase-version">{phase.version}</span>
                  </div>
                  <ul>
                    {phase.items.map((item) => (
                      <li key={item}>
                        {phase.state === 'complete' ? (
                          <CheckIcon />
                        ) : (
                          <span className="open-check" />
                        )}
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section release-policy-section">
        <div className="shell release-policy">
          <div>
            <p className="eyebrow">RELEASE POLICY</p>
            <h2>Versions describe evidence, not ambition.</h2>
          </div>
          <div className="release-policy__copy">
            <p>
              Papliba uses Semantic Versioning and a changelog. Pre-1.0 releases may change the
              architecture, but each release must state what is usable and what remains proposed.
            </p>
            <a
              className="text-link"
              href={`${product.repository}/blob/main/CHANGELOG.md`}
              target="_blank"
              rel="noreferrer"
            >
              Read the changelog <ExternalIcon />
            </a>
          </div>
        </div>
      </section>

      <section className="section roadmap-cta-section section-grid-bg">
        <div className="shell roadmap-cta">
          <div>
            <p className="eyebrow">THE NEXT PROOF</p>
            <h2>Connect one local Pi session—honestly and securely.</h2>
            <p>
              The technical spike will validate process ownership, event mapping, and the browser
              trust boundary before the interface grows.
            </p>
          </div>
          <div className="roadmap-cta__actions">
            <Link className="button button--primary" to="/architecture">
              Review the architecture <ArrowRightIcon />
            </Link>
            <a
              className="button button--ghost"
              href={product.repository}
              target="_blank"
              rel="noreferrer"
            >
              Watch on GitHub <ExternalIcon />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
