import Link from "next/link";
import { listReleaseFiles } from "../docs-markdown";
import { SiteShell } from "../site-shell";

export default async function ReleasesPage() {
  const releaseFiles = await listReleaseFiles();

  return (
    <SiteShell
      current="/releases"
      description="Human-facing release notes for each Papliba version."
      eyebrow="Project history"
      title="Releases"
    >
      <section className="site-card-grid">
        {releaseFiles.map((file) => {
          const version = file.replace(".md", "");
          const releasePath = version.replaceAll(".", "-");

          return (
            <Link
              className="site-card site-card-link"
              href={`/releases/${releasePath}`}
              key={file}
            >
              <span>Release notes</span>
              <strong>{version}</strong>
              <p>Read the highlights and notes for this release.</p>
            </Link>
          );
        })}
      </section>
    </SiteShell>
  );
}
