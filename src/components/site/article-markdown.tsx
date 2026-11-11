"use client";

import type { Article } from "@/types/portfolio";

type InlineProps = {
  article: Article;
  text: string;
  revealed: Set<string>;
  onReveal: (word: string) => void;
};

function MarkdownInline({ article, text, revealed, onReveal }: InlineProps) {
  const redacted = article.redacted.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const tokens = [
    redacted.length ? redacted.join("|") : "(?!)",
    "!\\[[^\\]]*\\]\\([^\\s)]+(?:\\s+\\\"[^\\\"]*\\\")?\\)",
    "\\[[^\\]]+\\]\\([^\\s)]+\\)",
    "\\*\\*[^*]+\\*\\*",
    "~~[^~]+~~",
    "(?<!\\*)\\*[^*]+\\*(?!\\*)",
    "(?<!_)_[^_]+_(?!_)",
    "`[^`]+`",
  ].join("|");

  return (
    <>
      {text.split(new RegExp(`(${tokens})`, "g")).map((part, index) => {
        const hidden = article.redacted.find((value) => part.includes(value));
        if (hidden) {
          const isRevealed = revealed.has(hidden);
          return (
            <button
              type="button"
              key={`${hidden}-${index}`}
              className={`redacted-word${isRevealed ? " is-revealed" : ""}`}
              onClick={() => onReveal(hidden)}
              aria-label={isRevealed ? hidden : "Reveal redacted word"}
              title={isRevealed ? hidden : "Reveal"}
            >
              {hidden}
            </button>
          );
        }

        const image = part.match(/^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)$/);
        if (image) {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${part}-${index}`} src={image[2]} alt={image[1]} loading="lazy" />
          );
        }

        const link = part.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
        if (link) {
          return (
            <a key={`${part}-${index}`} href={link[2]} target="_blank" rel="noreferrer">
              {link[1]}
            </a>
          );
        }

        if (part.startsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("~~")) return <del key={index}>{part.slice(2, -2)}</del>;
        if (part.startsWith("*") || part.startsWith("_")) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function MarkdownTable({
  article,
  lines,
  revealed,
  onReveal,
}: Omit<InlineProps, "text"> & { lines: string[] }) {
  const cells = (line: string) =>
    line
      .trim()
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((cell) => cell.trim());

  const header = cells(lines[0]);
  const rows = lines.slice(2).map(cells);

  return (
    <div className="markdown-table-wrap">
      <table>
        <thead>
          <tr>
            {header.map((cell, index) => (
              <th key={index}>
                <MarkdownInline article={article} text={cell} revealed={revealed} onReveal={onReveal} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>
                  <MarkdownInline article={article} text={cell} revealed={revealed} onReveal={onReveal} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MarkdownBody({
  article,
  revealed,
  onReveal,
}: {
  article: Article;
  revealed: Set<string>;
  onReveal: (word: string) => void;
}) {
  return (
    <>
      {article.content.split(/\r?\n\s*\r?\n/).map((block, index) => {
        if (block.startsWith("```")) {
          return (
            <pre key={index}>
              <code>{block.replace(/^```[^\n]*\n?|\n?```$/g, "")}</code>
            </pre>
          );
        }
        if (/^---+\s*$/.test(block)) return <hr key={index} />;

        const heading = block.match(/^(#{1,6})\s+(.+)$/);
        if (heading) {
          const Tag = `h${heading[1].length}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
          return (
            <Tag key={index}>
              <MarkdownInline article={article} text={heading[2]} revealed={revealed} onReveal={onReveal} />
            </Tag>
          );
        }

        const list = block.split(/\r?\n/);
        if (list[0]?.startsWith("> ")) {
          return (
            <blockquote key={index}>
              {list.map((line, lineIndex) => (
                <p key={lineIndex}>
                  <MarkdownInline
                    article={article}
                    text={line.replace(/^>\s?/, "")}
                    revealed={revealed}
                    onReveal={onReveal}
                  />
                </p>
              ))}
            </blockquote>
          );
        }

        if (
          list.length > 1 &&
          /^\|.+\|$/.test(list[0]) &&
          /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(list[1])
        ) {
          return (
            <MarkdownTable
              key={index}
              article={article}
              lines={list}
              revealed={revealed}
              onReveal={onReveal}
            />
          );
        }

        if (list.every((line) => /^[-*]\s+\[[ xX]\]\s+/.test(line))) {
          return (
            <ul className="task-list" key={index}>
              {list.map((line, lineIndex) => {
                const task = line.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
                return (
                  <li key={`${index}-${lineIndex}`}>
                    <input type="checkbox" checked={task?.[1].toLowerCase() === "x"} readOnly />
                    <MarkdownInline
                      article={article}
                      text={task?.[2] ?? line}
                      revealed={revealed}
                      onReveal={onReveal}
                    />
                  </li>
                );
              })}
            </ul>
          );
        }

        if (list.every((line) => /^[-*]\s+/.test(line))) {
          return (
            <ul key={index}>
              {list.map((line, lineIndex) => (
                <li key={`${index}-${lineIndex}`}>
                  <MarkdownInline
                    article={article}
                    text={line.replace(/^[-*]\s+/, "")}
                    revealed={revealed}
                    onReveal={onReveal}
                  />
                </li>
              ))}
            </ul>
          );
        }

        if (list.every((line) => /^\d+\.\s+/.test(line))) {
          return (
            <ol key={index}>
              {list.map((line, lineIndex) => (
                <li key={`${index}-${lineIndex}`}>
                  <MarkdownInline
                    article={article}
                    text={line.replace(/^\d+\.\s+/, "")}
                    revealed={revealed}
                    onReveal={onReveal}
                  />
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={index}>
            <MarkdownInline
              article={article}
              text={block.replace(/\r?\n/g, " ")}
              revealed={revealed}
              onReveal={onReveal}
            />
          </p>
        );
      })}
    </>
  );
}
