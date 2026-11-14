import type {
  Constitution,
  ConstitutionPart,
  ConstitutionPreamble,
  ConstitutionSection,
  Language,
} from "@/types/portfolio";
import { readFile } from "node:fs/promises";
import path from "node:path";

const constitutionDirectory = path.join(process.cwd(), "src", "data", "constitution");

type Frontmatter = Record<string, string>;

function parseFrontmatter(source: string, fileName: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`Missing frontmatter in ${fileName}`);

  const fields: Frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key) fields[key] = value;
  }

  return { fields, content: match[2].trim() };
}

function parsePreamble(fields: Frontmatter, content: string): ConstitutionPreamble {
  return {
    title: fields.title || "Constitution",
    subtitle: fields.subtitle || "",
    adopted: fields.adopted || "",
    place: fields.place || "",
    edition: fields.edition || "1.0",
    motto: fields.motto || "",
    content,
  };
}

function parseSection(heading: string, content: string): ConstitutionSection {
  const match = heading.match(/^(\d+(?:\.\d+)*)\.?\s+(.+)$/);
  const number = match?.[1] ?? "";
  const title = match?.[2] ?? heading;
  const id = number
    ? `section-${number.replace(/\./g, "-")}`
    : `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return { id, number, title, content };
}

function splitPart(body: string) {
  const lines = body.split(/\r?\n/);
  const intro: string[] = [];
  const sections: ConstitutionSection[] = [];
  let current: { heading: string; lines: string[] } | null = null;

  const flush = () => {
    if (current) {
      sections.push(parseSection(current.heading, current.lines.join("\n").trim()));
      current = null;
    }
  };

  for (const line of lines) {
    if (/^###\s+/.test(line)) {
      flush();
      current = { heading: line.replace(/^###\s+/, "").trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      intro.push(line);
    }
  }
  flush();

  return { intro: intro.join("\n").trim(), sections };
}

function parsePart(heading: string, body: string, index: number): ConstitutionPart {
  const match = heading.match(/^([IVXLCDM]+)\.\s*(.+)$/i);
  const number = match?.[1]?.toUpperCase() ?? String(index + 1);
  const title = match?.[2] ?? heading;
  const { intro, sections } = splitPart(body);

  return {
    id: `part-${number.toLowerCase()}`,
    number,
    title,
    intro,
    sections,
  };
}

function parseDocument(source: string, fileName: string) {
  const { fields, content } = parseFrontmatter(source, fileName);
  const lines = content.split(/\r?\n/);
  const preamble: string[] = [];
  const rawParts: { heading: string; lines: string[] }[] = [];
  let current: { heading: string; lines: string[] } | null = null;

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      if (current) rawParts.push(current);
      current = { heading: line.replace(/^##\s+/, "").trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      preamble.push(line);
    }
  }
  if (current) rawParts.push(current);

  const parts = rawParts.map((part, index) =>
    parsePart(part.heading, part.lines.join("\n").trim(), index),
  );

  return {
    preamble: parsePreamble(fields, preamble.join("\n").trim()),
    parts,
  };
}

async function readOptional(fileName: string) {
  try {
    return await readFile(path.join(constitutionDirectory, fileName), "utf8");
  } catch {
    return null;
  }
}

export async function getConstitution(language: Language): Promise<Constitution> {
  try {
    const localizedSource = await readOptional(`constitution.${language}.md`);
    const source = localizedSource ?? (await readOptional("constitution.ru.md"));
    if (!source) return { preamble: null, parts: [], localized: false };
    return {
      ...parseDocument(source, `constitution.${language}.md`),
      localized: localizedSource !== null,
    };
  } catch {
    return { preamble: null, parts: [], localized: false };
  }
}

export async function getLocalizedConstitution() {
  const entries = await Promise.all(
    (["ru", "en", "ko"] as const).map(async (language) => [language, await getConstitution(language)] as const),
  );
  return Object.fromEntries(entries) as Record<Language, Constitution>;
}
