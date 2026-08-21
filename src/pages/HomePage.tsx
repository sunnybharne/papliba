import { Link } from 'react-router-dom';
import { ConceptCanvas } from '../components/ConceptCanvas';
import { ArrowRightIcon, CheckIcon, ExternalIcon } from '../components/Icons';
import { SectionHeading } from '../components/SectionHeading';
import { product } from '../content/product';

const problems = [
  {
    number: '01',
    title: 'See the work',
    copy: 'Follow tool calls, file changes, and agent decisions in one calm activity stream.',
  },
  {
    number: '02',
    title: 'Keep the checkpoints',
    copy: 'Put review and approval moments exactly where consequential actions happen.',
  },
  {
    number: '03',
    title: 'Shape your workflow',
    copy: 'Grow from a focused Pi interface into a workspace your community can extend.',
  },
] as const;

const principles = [
  {
    label: 'LOCAL BY DEFAULT',
    title: 'Authority stays close',
    copy: 'The proposed companion runs on your machine. Workspace access and process control do not move to a hosted Papliba service.',
  },
  {
    label: 'TRANSPARENT',
    title: 'Nothing important is hidden',
    copy: 'Commands, tool activity, edits, and errors should be inspectable—not reduced to a mysterious loading spinner.',
  },
  {
    label: 'PI, NOT A REIMPLEMENTATION',
    title: 'One agent, another surface',
    copy: 'Papliba plans to use Pi RPC so Pi remains responsible for the agent loop, tools, sessions, and models.',
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
              Open source · {product.phase}
            </div>
            <h1>
              Your Pi agent,
              <span>with a window.</span>
            </h1>
            <p className="hero__lead">
              Papliba is a planned local-first control surface for Pi—designed to make agent
              activity visible, reviewable, and easier to shape.
            </p>
            <div className="hero__actions">
              <Link className="button button--primary" to="/architecture">
                Explore the architecture <ArrowRightIcon />
              </Link>
              <Link className="button button--ghost" to="/docs">
                Read the docs
              </Link>
            </div>
            <p className="hero__honesty">
              <span>v{product.version}</span> Product direction and system design—not a working
              agent UI yet.
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
            eyebrow="THE PRODUCT IDEA"
            title="Agents move fast. Understanding should keep up."
            copy="Papliba is being designed around the moments where a terminal-only workflow becomes hard to scan, explain, or control."
          />
          <div className="problem-grid">
            {problems.map((problem) => (
              <article className="problem-card" key={problem.number}>
                <span className="card-number">{problem.number}</span>
                <div className="card-glyph" aria-hidden="true">
                  {problem.number === '01' ? '◎' : problem.number === '02' ? '◇' : '⌘'}
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
            <h2>A UI should add clarity, not take control away.</h2>
            <p>
              These are constraints for the product, not finished features. They will guide every
              implementation decision.
            </p>
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
              <span className="status-panel__tag">CURRENT RELEASE · v{product.version}</span>
              <h2>The foundation is public. The application comes next.</h2>
              <p>
                This first preview establishes the product story, proposed architecture,
                contribution workflow, and delivery pipeline. The roadmap separates what exists
                today from what we intend to build.
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
                <span>IN THIS PREVIEW</span>
                <span className="release-state">PUBLISHED</span>
              </div>
              <ul>
                <li>
                  <CheckIcon /> Product direction
                </li>
                <li>
                  <CheckIcon /> Proposed architecture
                </li>
                <li>
                  <CheckIcon /> Contributor documentation
                </li>
                <li>
                  <CheckIcon /> Automated quality gates
                </li>
              </ul>
              <p>Agent connection and session UI are planned, not included.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section closing-section section-grid-bg">
        <div className="shell closing-section__inner">
          <span className="eyebrow">BUILD IN THE OPEN</span>
          <h2>Papliba is a direction you can inspect from day one.</h2>
          <p>
            Read the decisions, challenge the assumptions, or help turn the architecture into a
            useful Pi interface.
          </p>
          <div className="hero__actions">
            <a
              className="button button--primary"
              href={product.repository}
              target="_blank"
              rel="noreferrer"
            >
              Explore the repository <ExternalIcon />
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
