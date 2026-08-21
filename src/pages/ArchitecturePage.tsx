import { ArchitectureDiagram } from '../components/ArchitectureDiagram';
import { ExternalIcon } from '../components/Icons';
import { product } from '../content/product';

const boundaries = [
  {
    title: 'React client',
    owns: 'Presentation, navigation, browser state, and human review surfaces.',
    avoids: 'Direct filesystem access, credentials, and process execution.',
  },
  {
    title: 'Local companion',
    owns: 'Loopback security, Pi process lifecycle, workspace policy, and event relay.',
    avoids: 'Reimplementing Pi’s agent loop or silently broadening permissions.',
  },
  {
    title: 'Pi RPC',
    owns: 'Agent sessions, tools, model providers, prompts, compaction, and streaming events.',
    avoids: 'Papliba-specific presentation and browser transport concerns.',
  },
] as const;

export function ArchitecturePage() {
  return (
    <>
      <section className="page-hero section-grid-bg">
        <div className="shell page-hero__inner">
          <p className="eyebrow">PROPOSED ARCHITECTURE · ADR-001</p>
          <h1>A thin interface over the real Pi runtime.</h1>
          <p>
            Papliba will not rebuild the coding agent in a browser. The proposal keeps authority in
            a local companion and talks to Pi through its official, language-neutral RPC mode.
          </p>
          <div className="fact-row">
            <span>React + Vite</span>
            <i />
            <span>ASP.NET Core companion</span>
            <i />
            <span>Pi RPC</span>
          </div>
        </div>
      </section>

      <section className="section architecture-section">
        <div className="shell">
          <div className="architecture-callout">
            <strong>Architecture status</strong>
            <p>
              This is a proposed boundary for the future application. The current release is a
              static React product and documentation site hosted on GitHub Pages.
            </p>
          </div>
          <ArchitectureDiagram />
        </div>
      </section>

      <section className="section boundaries-section">
        <div className="shell">
          <div className="split-heading">
            <div>
              <p className="eyebrow">RESPONSIBILITY MAP</p>
              <h2>One clear owner for every concern.</h2>
            </div>
            <p>
              The seams are intentional. They make the system easier to secure, test, replace, and
              understand.
            </p>
          </div>
          <div className="boundary-grid">
            {boundaries.map((boundary, index) => (
              <article className="boundary-card" key={boundary.title}>
                <span>0{index + 1}</span>
                <h3>{boundary.title}</h3>
                <dl>
                  <div>
                    <dt>OWNS</dt>
                    <dd>{boundary.owns}</dd>
                  </div>
                  <div>
                    <dt>DOES NOT OWN</dt>
                    <dd>{boundary.avoids}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section sequence-section">
        <div className="shell sequence-layout">
          <div>
            <p className="eyebrow">EXAMPLE FLOW</p>
            <h2>One prompt, visible end to end.</h2>
            <p>
              Papliba’s protocol will preserve Pi’s streaming events and attach product-level
              context without mutating the underlying agent behavior.
            </p>
          </div>
          <ol className="sequence-list">
            <li>
              <span>1</span>
              <div>
                <strong>React sends a typed prompt command</strong>
                <p>The browser talks only to the loopback companion.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>The companion writes one JSONL command</strong>
                <p>Pi runs as a managed child process using RPC mode.</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>Pi streams events through stdout</strong>
                <p>Tool activity, text deltas, and state changes remain intact.</p>
              </div>
            </li>
            <li>
              <span>4</span>
              <div>
                <strong>The interface renders a reviewable timeline</strong>
                <p>The user can inspect progress and act at defined boundaries.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="section decision-section">
        <div className="shell decision-layout">
          <div>
            <p className="eyebrow">WHY THIS SHAPE</p>
            <h2>Decisions, with trade-offs attached.</h2>
          </div>
          <div className="decision-table" role="table" aria-label="Architecture decisions">
            <div className="decision-table__header" role="row">
              <span role="columnheader">Decision</span>
              <span role="columnheader">Reason</span>
              <span role="columnheader">Trade-off</span>
            </div>
            <div role="row">
              <strong role="cell">React + Vite</strong>
              <span role="cell">
                Focused client with static deployment and no server framework.
              </span>
              <span role="cell">A working agent requires a separate local runtime.</span>
            </div>
            <div role="row">
              <strong role="cell">ASP.NET Core</strong>
              <span role="cell">
                Strong process APIs, streaming support, and a clear place for C#.
              </span>
              <span role="cell">Adds a second language and packaging target.</span>
            </div>
            <div role="row">
              <strong role="cell">Pi RPC</strong>
              <span role="cell">Official language-neutral surface; Pi retains agent behavior.</span>
              <span role="cell">Papliba must map JSONL safely and track protocol changes.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section source-note-section">
        <div className="shell source-note">
          <div>
            <p className="eyebrow">PRIMARY SOURCE</p>
            <h2>Built around Pi’s documented RPC contract.</h2>
            <p>
              WebSocket and SignalR are Papliba design choices. JSONL over stdin and stdout is the
              official Pi boundary.
            </p>
          </div>
          <a
            className="button button--primary"
            href={product.piRpcDocs}
            target="_blank"
            rel="noreferrer"
          >
            Read Pi RPC docs <ExternalIcon />
          </a>
        </div>
      </section>
    </>
  );
}
