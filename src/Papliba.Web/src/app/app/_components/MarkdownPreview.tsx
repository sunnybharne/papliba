type MarkdownPreviewProps = {
  markdown: string;
};

export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return (
      <div className="organization-markdown-preview">
        <p className="muted-copy">No organization details yet.</p>
      </div>
    );
  }

  return (
    <div className="organization-markdown-preview">
      {lines.map((line, index) => {
        if (line.startsWith("### ")) {
          return <h4 key={index}>{line.slice(4)}</h4>;
        }

        if (line.startsWith("## ")) {
          return <h3 key={index}>{line.slice(3)}</h3>;
        }

        if (line.startsWith("# ")) {
          return <h2 key={index}>{line.slice(2)}</h2>;
        }

        if (line.startsWith("- ")) {
          return (
            <p className="markdown-list-item" key={index}>
              <span aria-hidden="true" className="markdown-bullet" />
              {line.slice(2)}
            </p>
          );
        }

        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}
