import { MarkdownContent, readProjectMarkdown } from "../docs-markdown";
import { SiteShell } from "../site-shell";

export default async function ChangelogPage() {
  const changelog = await readProjectMarkdown("CHANGELOG.md");

  return (
    <SiteShell
      current="/changelog"
      description="A technical log of meaningful changes made to Papliba."
      eyebrow="Project history"
      title="Changelog"
    >
      <MarkdownContent markdown={changelog} />
    </SiteShell>
  );
}
