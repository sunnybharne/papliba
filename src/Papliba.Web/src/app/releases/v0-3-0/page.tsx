import { MarkdownContent, readProjectMarkdown } from "../../docs-markdown";
import { SiteShell } from "../../site-shell";

export default async function ReleasePage() {
  const releaseNotes = await readProjectMarkdown(
    "docs",
    "releases",
    "v0.3.0.md",
  );

  return (
    <SiteShell
      current="/releases"
      description="The third public Papliba release."
      eyebrow="Release notes"
      title="v0.3.0"
    >
      <MarkdownContent markdown={releaseNotes} />
    </SiteShell>
  );
}
