const fileRows = [
  { name: 'src/session.ts', state: 'modified', symbol: 'M' },
  { name: 'src/protocol.ts', state: 'added', symbol: '+' },
  { name: 'tests/session.test.ts', state: 'added', symbol: '+' },
] as const;

export function ConceptCanvas() {
  return (
    <div className="concept-window" aria-label="Concept preview of the planned Papliba interface">
      <div className="concept-window__topbar">
        <div className="window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="concept-label">Concept preview</span>
        <span className="connection-state">
          <i /> local
        </span>
      </div>
      <div className="concept-window__body">
        <aside className="concept-rail" aria-hidden="true">
          <span className="rail-brand">P</span>
          <div className="rail-icons">
            <span className="rail-icon rail-icon--active" />
            <span className="rail-icon" />
            <span className="rail-icon" />
          </div>
        </aside>
        <div className="concept-session">
          <div className="session-heading">
            <div>
              <span className="mini-label">SESSION / PAPLIBA</span>
              <h3>Make agent activity visible</h3>
            </div>
            <span className="running-pill">
              <i /> running
            </span>
          </div>
          <div className="activity-stream">
            <div className="activity-row">
              <span className="activity-node activity-node--lime" />
              <div>
                <strong>Pi is inspecting the workspace</strong>
                <p>Reading the session and protocol boundaries</p>
              </div>
              <time>now</time>
            </div>
            <div className="tool-card">
              <div className="tool-card__heading">
                <span className="tool-icon">⌁</span>
                <span>Changes proposed</span>
                <span className="tool-count">3 files</span>
              </div>
              <div className="file-list">
                {fileRows.map((file) => (
                  <div className="file-row" key={file.name}>
                    <span className={`file-state file-state--${file.state}`}>{file.symbol}</span>
                    <code>{file.name}</code>
                  </div>
                ))}
              </div>
              <div className="review-row">
                <span>Review before anything leaves your machine</span>
                <button type="button" aria-label="Review changes (concept only)" disabled>
                  Review changes
                </button>
              </div>
            </div>
            <div className="activity-row activity-row--muted">
              <span className="activity-node" />
              <div>
                <strong>Your checkpoints stay in the flow</strong>
                <p>Approvals are a product boundary, not an afterthought</p>
              </div>
            </div>
          </div>
          <div className="concept-composer">
            <span>Ask Pi to continue…</span>
            <kbd>⌘ ↵</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
