import { BrandMark } from './Brand';

const fileRows = [
  { name: 'Build checks', state: 'complete', symbol: '✓' },
  { name: 'Runtime policy', state: 'complete', symbol: '✓' },
  { name: 'Release notes', state: 'review', symbol: '!' },
] as const;

export function ConceptCanvas() {
  return (
    <div className="concept-window" aria-label="Product preview of the Papliba private alpha">
      <div className="concept-window__topbar">
        <div className="window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="concept-label">Private alpha · controlled run</span>
        <span className="connection-state">
          <i /> runtime connected
        </span>
      </div>
      <div className="concept-window__body">
        <aside className="concept-rail" aria-hidden="true">
          <span className="rail-brand">
            <BrandMark />
          </span>
          <div className="rail-icons">
            <span className="rail-icon rail-icon--active" />
            <span className="rail-icon" />
            <span className="rail-icon" />
          </div>
        </aside>
        <div className="concept-session">
          <div className="session-heading">
            <div>
              <span className="mini-label">WORKFLOW / RELEASE READINESS</span>
              <h3>Decide if the release can proceed</h3>
            </div>
            <span className="running-pill">
              <i /> running
            </span>
          </div>
          <div className="activity-stream">
            <div className="activity-row">
              <span className="activity-node activity-node--lime" />
              <div>
                <strong>Evidence collection completed</strong>
                <p>Checks, workspace state, and policy signals are ready</p>
              </div>
              <time>now</time>
            </div>
            <div className="tool-card">
              <div className="tool-card__heading">
                <span className="tool-icon">⌁</span>
                <span>Approval checkpoint</span>
                <span className="tool-count">3 signals</span>
              </div>
              <div className="file-list">
                {fileRows.map((file) => (
                  <div className="file-row" key={file.name}>
                    <span className={`file-state file-state--${file.state}`}>{file.symbol}</span>
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
              <div className="review-row">
                <span>Human approval required before the final summary</span>
                <button type="button" aria-label="Approve once (product preview)" disabled>
                  Approve once
                </button>
              </div>
            </div>
            <div className="activity-row activity-row--muted">
              <span className="activity-node" />
              <div>
                <strong>The final summary waits here</strong>
                <p>Every consequential transition remains explicit</p>
              </div>
            </div>
          </div>
          <div className="concept-composer">
            <span>Steer this run…</span>
            <kbd>⌘ ↵</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
