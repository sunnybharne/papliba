import { MarkdownContent, readProjectMarkdown } from "../../docs-markdown";
import { SiteShell } from "../../site-shell";

export default async function ReleasePage() {
  const releaseNotes = await readProjectMarkdown(
    "docs",
    "releases",
    "v0.5.0.md",
  );

  return (
    <SiteShell
      current="/releases"
      description="The fifth public Papliba release."
      eyebrow="Release notes"
      title="v0.5.0"
    >
      <MarkdownContent markdown={releaseNotes} />
    </SiteShell>
  );
}
