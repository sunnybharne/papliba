import { ArrowRightIcon } from './Icons';

interface ArchitectureDiagramProps {
  compact?: boolean;
}

function FlowArrow({ label }: { label: string }) {
  return (
    <div className="architecture-arrow" aria-label={label}>
      <span>{label}</span>
      <ArrowRightIcon />
    </div>
  );
}

export function ArchitectureDiagram({ compact = false }: ArchitectureDiagramProps) {
  return (
    <figure className={`architecture-figure${compact ? ' architecture-figure--compact' : ''}`}>
      <figcaption>
        <span className="diagram-kicker">PROPOSED SYSTEM</span>
        <span>Local-first by design</span>
      </figcaption>
      <div className="architecture-flow">
        <section className="architecture-node architecture-node--interface">
          <div className="node-number">01</div>
          <div className="node-icon" aria-hidden="true">
            ◫
          </div>
          <p className="node-label">INTERFACE</p>
          <h3>React client</h3>
          <p>Sessions, activity, changes, approvals</p>
          <div className="node-tags">
            <span>React</span>
            <span>TypeScript</span>
            <span>Vite</span>
          </div>
        </section>

        <FlowArrow label="typed events" />

        <section className="architecture-node architecture-node--bridge">
          <div className="node-number">02</div>
          <div className="node-icon" aria-hidden="true">
            ⇄
          </div>
          <p className="node-label">LOCAL BOUNDARY</p>
          <h3>Papliba bridge</h3>
          <p>Process lifecycle, event relay, permissions</p>
          <div className="node-tags">
            <span>WebSocket</span>
            <span>ASP.NET Core</span>
          </div>
        </section>

        <FlowArrow label="JSON lines" />

        <section className="architecture-node architecture-node--agent">
          <div className="node-number">03</div>
          <div className="node-icon node-icon--terminal" aria-hidden="true">
            &gt;_
          </div>
          <p className="node-label">AGENT RUNTIME</p>
          <h3>Pi RPC process</h3>
          <p>Agent loop, tools, model providers</p>
          <div className="node-tags">
            <span>pi --mode rpc</span>
            <span>stdio</span>
          </div>
        </section>
      </div>
      <div className="architecture-foundation">
        <span>YOUR MACHINE</span>
        <span className="foundation-line" />
        <span>workspace · credentials · session data</span>
      </div>
    </figure>
  );
}
