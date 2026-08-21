import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, ExternalIcon } from '../components/Icons';
import { product } from '../content/product';

const phases = [
  {
    status: 'PUBLIC',
    title: 'Make the system legible',
    version: '0.8 · public foundation',
    state: 'complete',
    items: [
      'Product story and design principles',
      'React product and documentation site',
      'Documented system architecture',
      'CI, Pages, tests, and contribution workflow',
    ],
  },
  {
    status: 'ALPHA',
    title: 'Prove controlled execution',
    version: 'Private working alpha',
    state: 'active',
    items: [
      'React agent-operations workspace',
      'ASP.NET Core companion and Pi RPC lifecycle',
      'Read-only workspace runtime policy',
      'Approval-gated workflows and event timeline',
    ],
  },
  {
    status: 'NEXT',
    title: 'Make the alpha durable',
    version: 'Product hardening',
    state: 'next',
    items: [
      'Persistent run history and audit evidence',
      'Identity and workspace access controls',
      'Policy-driven approval rules',
      'Installable packaging and update path',
    ],
  },
  {
    status: 'LATER',
    title: 'Harden for organizations',
    version: 'Enterprise readiness',
    state: 'planned',
    items: [
      'Organization administration and entitlements',
      'Deployment and environment policy',
      'Reusable workflow governance',
      'Cross-platform release operations',
    ],
  },
] as const;

export function RoadmapPage() {
  return (
    <>
      <section className="page-hero roadmap-hero section-grid-bg">
        <div className="shell page-hero__inner">
          <p className="eyebrow">PUBLIC ROADMAP</p>
          <h1>The boundary is proven. Now harden the product.</h1>
          <p>
            A working private alpha now connects the control plane to a real local runtime. The
            roadmap moves from that proof toward durable, governed team operations.
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
              <i className="legend-dot legend-dot--active" /> Active alpha
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
                        {phase.state === 'complete' || phase.state === 'active' ? (
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
              architecture, but each release must state what is usable and what remains planned.
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
            <p className="eyebrow">THE NEXT LAYER</p>
            <h2>Turn a working alpha into a durable operating system.</h2>
            <p>
              Persistence, identity, policy, and packaging come next—without weakening the local
              execution boundary already validated by the alpha.
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
              Follow the public roadmap <ExternalIcon />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
