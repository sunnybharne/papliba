import Link from "next/link";
import styles from "./concept.module.css";

const workflowNodes = [
  {
    type: "Trigger",
    title: "New idea",
    detail: "Capture a request, file, note, or manual input.",
    status: "Ready",
  },
  {
    type: "Worker",
    title: "Planner",
    detail: "Turns the input into a clear sequence of tasks.",
    status: "Draft",
  },
  {
    type: "Worker",
    title: "Reviewer",
    detail: "Checks quality, risk, missing context, and approvals.",
    status: "Queued",
  },
  {
    type: "Output",
    title: "Task board",
    detail: "Saves the final work as cards and a run summary.",
    status: "Preview",
  },
];

const runs = [
  "Collected input",
  "Created task list",
  "Waiting for review",
];

export default function ConceptPage() {
  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Papliba Preview</p>
          <h1>Workflow Builder</h1>
        </div>
        <Link className={styles.homeLink} href="/">
          Hello World
        </Link>
      </header>

      <section className={styles.workspace} aria-label="Papliba concept preview">
        <aside className={styles.sidebar}>
          <div className={styles.brandBlock}>
            <strong>Papliba</strong>
            <span>Personal workspace</span>
          </div>

          <nav className={styles.navList} aria-label="Workflow list">
            <Link className={styles.activeItem} href="/concept">
              Launch workflow
            </Link>
            <Link href="/concept">Research queue</Link>
            <Link href="/concept">File cleanup</Link>
            <Link href="/concept">Weekly summary</Link>
          </nav>
        </aside>

        <section className={styles.canvas}>
          <div className={styles.canvasHeader}>
            <div>
              <p className={styles.eyebrow}>Canvas</p>
              <h2>Launch workflow</h2>
            </div>
            <button className={styles.runButton} type="button">
              Run preview
            </button>
          </div>

          <div className={styles.nodeRail}>
            {workflowNodes.map((node, index) => (
              <article className={styles.node} key={node.title}>
                <span className={styles.nodeType}>{node.type}</span>
                <h3>{node.title}</h3>
                <p>{node.detail}</p>
                <strong>{node.status}</strong>
                {index < workflowNodes.length - 1 && (
                  <span className={styles.connector} aria-hidden="true" />
                )}
              </article>
            ))}
          </div>
        </section>

        <aside className={styles.inspector}>
          <p className={styles.eyebrow}>Inspector</p>
          <h2>Planner worker</h2>

          <dl className={styles.details}>
            <div>
              <dt>Input</dt>
              <dd>New idea</dd>
            </div>
            <div>
              <dt>Output</dt>
              <dd>Task list</dd>
            </div>
            <div>
              <dt>Approval</dt>
              <dd>Required</dd>
            </div>
          </dl>

          <div className={styles.runList}>
            <h3>Latest run</h3>
            {runs.map((run) => (
              <p key={run}>{run}</p>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
