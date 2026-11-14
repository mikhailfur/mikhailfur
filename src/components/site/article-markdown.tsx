"use client";

type InlineProps = {
  text: string;
};

function MarkdownInline({ text }: InlineProps) {
  const tokens = [
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

function MarkdownTable({ lines }: { lines: string[] }) {
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
                <MarkdownInline text={cell} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} data-label={header[cellIndex] ?? undefined}>
                  <MarkdownInline text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MarkdownBody({ content }: { content: string }) {
  return (
    <>
      {content.split(/\r?\n\s*\r?\n/).map((block, index) => {
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
              <MarkdownInline text={heading[2]} />
            </Tag>
          );
        }

        const list = block.split(/\r?\n/);
        if (list[0]?.startsWith("> ")) {
          return (
            <blockquote key={index}>
              {list.map((line, lineIndex) => (
                <p key={lineIndex}>
                  <MarkdownInline text={line.replace(/^>\s?/, "")} />
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
          return <MarkdownTable key={index} lines={list} />;
        }

        if (list.every((line) => /^[-*]\s+\[[ xX]\]\s+/.test(line))) {
          return (
            <ul className="task-list" key={index}>
              {list.map((line, lineIndex) => {
                const task = line.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
                return (
                  <li key={`${index}-${lineIndex}`}>
                    <input type="checkbox" checked={task?.[1].toLowerCase() === "x"} readOnly />
                    <MarkdownInline text={task?.[2] ?? line} />
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
                  <MarkdownInline text={line.replace(/^[-*]\s+/, "")} />
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
                  <MarkdownInline text={line.replace(/^\d+\.\s+/, "")} />
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={index}>
            <MarkdownInline text={block.replace(/\r?\n/g, " ")} />
          </p>
        );
      })}
    </>
  );
}
