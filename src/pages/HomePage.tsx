import { Link } from 'react-router-dom';
import { ConceptCanvas } from '../components/ConceptCanvas';
import { ArrowRightIcon, CheckIcon, ExternalIcon } from '../components/Icons';
import { SectionHeading } from '../components/SectionHeading';
import { product } from '../content/product';

const problems = [
  {
    number: '01',
    title: 'Know what is running',
    copy: 'Follow every run, runtime event, and result without reconstructing the story from terminal output.',
  },
  {
    number: '02',
    title: 'Approve the boundary',
    copy: 'Place human review exactly where a workflow crosses from analysis into consequential action.',
  },
  {
    number: '03',
    title: 'Keep the evidence',
    copy: 'Give operators and teams a shared, inspectable record of what happened and why.',
  },
] as const;

const principles = [
  {
    label: 'LOCAL EXECUTION',
    title: 'Authority stays close',
    copy: 'The companion runs beside the workspace. Process control and local access stay inside the boundary you operate.',
  },
  {
    label: 'AUDITABLE BY DESIGN',
    title: 'Nothing important is hidden',
    copy: 'Commands, tool activity, decisions, and errors remain inspectable instead of disappearing behind a loading state.',
  },
  {
    label: 'RUNTIME DISCIPLINE',
    title: 'Orchestrate, do not imitate',
    copy: 'Papliba uses Pi RPC as a technical boundary, leaving the agent loop, tools, sessions, and models with the runtime.',
  },
] as const;

export function HomePage() {
  return (
    <>
      <section className="hero section-grid-bg">
        <div className="shell hero__inner">
          <div className="hero__copy">
            <div className="status-kicker">
              <span className="status-kicker__dot" />
              Public direction · {product.phase}
            </div>
            <h1>
              Agent work,
              <span>with a control plane.</span>
            </h1>
            <p className="hero__lead">
              Papliba gives teams one calm place to start, observe, and approve agentic
              workflows—while execution stays close to the workspace.
            </p>
            <div className="hero__actions">
              <Link className="button button--primary" to="/architecture">
                See how it works <ArrowRightIcon />
              </Link>
              <Link className="button button--ghost" to="/docs">
                Read the docs
              </Link>
            </div>
            <p className="hero__honesty">
              <span>v{product.version}</span> The public site documents the direction. A working
              private alpha is in active development.
            </p>
          </div>
          <div className="hero__visual">
            <div className="hero-orbit hero-orbit--one" />
            <div className="hero-orbit hero-orbit--two" />
            <ConceptCanvas />
          </div>
        </div>
      </section>

      <section className="section problem-section">
        <div className="shell">
          <SectionHeading
            eyebrow="THE CONTROL PLANE"
            title="Fast agents still need deliberate operations."
            copy="Papliba turns agent execution into a route a team can see, review, and control—from intent to evidence."
          />
          <div className="problem-grid">
            {problems.map((problem) => (
              <article className="problem-card" key={problem.number}>
                <span className="card-number">{problem.number}</span>
                <div className="card-glyph" aria-hidden="true">
                  {problem.number === '01' ? '↳' : problem.number === '02' ? '◆' : '≡'}
                </div>
                <h3>{problem.title}</h3>
                <p>{problem.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section principles-section">
        <div className="shell principles-layout">
          <div className="principles-intro">
            <p className="eyebrow">DESIGN PRINCIPLES</p>
            <h2>Clarity is a control, not decoration.</h2>
            <p>These principles shape the working alpha and every product decision that follows.</p>
            <Link className="text-link" to="/architecture">
              See the trust boundaries <ArrowRightIcon />
            </Link>
          </div>
          <div className="principle-list">
            {principles.map((principle) => (
              <article className="principle-item" key={principle.label}>
                <div className="principle-check">
                  <CheckIcon />
                </div>
                <div>
                  <span>{principle.label}</span>
                  <h3>{principle.title}</h3>
                  <p>{principle.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section status-section">
        <div className="shell">
          <div className="status-panel">
            <div className="status-panel__copy">
              <span className="status-panel__tag">PRODUCT STATUS · v{product.version}</span>
              <h2>The direction is public. The working alpha stays private.</h2>
              <p>
                Papliba now has a functioning control-plane application, local companion, runtime
                connection, and approval-gated workflows. The implementation remains private while
                the product principles and technical boundaries stay inspectable here.
              </p>
              <div className="status-panel__actions">
                <Link className="button button--light" to="/roadmap">
                  View the roadmap <ArrowRightIcon />
                </Link>
                <a
                  className="button button--dark-outline"
                  href={product.repository}
                  target="_blank"
                  rel="noreferrer"
                >
                  Follow on GitHub <ExternalIcon />
                </a>
              </div>
            </div>
            <div className="release-card">
              <div className="release-card__header">
                <span>PRIVATE ALPHA SIGNAL</span>
                <span className="release-state">WORKING</span>
              </div>
              <ul>
                <li>
                  <CheckIcon /> React operations workspace
                </li>
                <li>
                  <CheckIcon /> Local C# companion
                </li>
                <li>
                  <CheckIcon /> Pi RPC run lifecycle
                </li>
                <li>
                  <CheckIcon /> Human approval checkpoints
                </li>
              </ul>
              <p>
                Private source, packaged downloads, and enterprise modules are not published here.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section closing-section section-grid-bg">
        <div className="shell closing-section__inner">
          <span className="eyebrow">OPERATE WITH INTENT</span>
          <h2>Designed for teams that need more than chat.</h2>
          <p>
            Follow the public decisions, inspect the architecture, and watch the control plane
            mature without exposing the private product implementation.
          </p>
          <div className="hero__actions">
            <a
              className="button button--primary"
              href={product.repository}
              target="_blank"
              rel="noreferrer"
            >
              Follow the public project <ExternalIcon />
            </a>
            <Link className="button button--ghost" to="/docs">
              Start with the docs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
