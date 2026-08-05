import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

type MarkdownBlock =
  | { level: number; text: string; type: "heading" }
  | { items: string[]; type: "list" }
  | { text: string; type: "paragraph" };

const projectRoot = path.join(process.cwd(), "..", "..");

export async function readProjectMarkdown(...segments: string[]) {
  return readFile(path.join(projectRoot, ...segments), "utf8");
}

export async function listReleaseFiles() {
  const releasesDirectory = path.join(projectRoot, "docs", "releases");
  const files = await readdir(releasesDirectory);

  return files
    .filter((file) => file.endsWith(".md") && file !== "README.md")
    .sort()
    .reverse();
}

function parseMarkdown(markdown: string) {
  const blocks: MarkdownBlock[] = [];
  const lines = markdown.split("\n");
  let listItems: string[] = [];

  function closeList() {
    if (listItems.length === 0) {
      return;
    }

    blocks.push({ items: listItems, type: "list" });
    listItems = [];
  }

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      closeList();
      continue;
    }

    if (trimmedLine.startsWith("- ")) {
      listItems.push(trimmedLine.slice(2));
      continue;
    }

    closeList();

    if (trimmedLine.startsWith("### ")) {
      blocks.push({ level: 3, text: trimmedLine.slice(4), type: "heading" });
      continue;
    }

    if (trimmedLine.startsWith("## ")) {
      blocks.push({ level: 2, text: trimmedLine.slice(3), type: "heading" });
      continue;
    }

    if (trimmedLine.startsWith("# ")) {
      blocks.push({ level: 1, text: trimmedLine.slice(2), type: "heading" });
      continue;
    }

    blocks.push({ text: trimmedLine, type: "paragraph" });
  }

  closeList();

  return blocks;
}

export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <article className="markdown-panel">
      {parseMarkdown(markdown).map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = `h${block.level}` as "h1" | "h2" | "h3";

          return <HeadingTag key={index}>{block.text}</HeadingTag>;
        }

        if (block.type === "list") {
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }

        return <p key={index}>{block.text}</p>;
      })}
    </article>
  );
}
