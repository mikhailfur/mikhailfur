import { access, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const articlesDirectory = path.join(process.cwd(), "src", "data", "articles");
const targets = ["en", "ko"];

async function loadEnvironmentFile() {
  try {
    const source = await readFile(path.join(process.cwd(), ".env"), "utf8");
    for (const line of source.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

await loadEnvironmentFile();
const model = process.env.OPENROUTER_MODEL ?? "google/gemma-4-31b-it";

function parseFrontmatter(source, fileName) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`Missing frontmatter in ${fileName}`);
  const fields = Object.fromEntries(match[1].split(/\r?\n/).flatMap((line) => {
    const separator = line.indexOf(":");
    return separator === -1 ? [] : [[line.slice(0, separator).trim(), line.slice(separator + 1).trim()]];
  }));
  for (const field of ["id", "type", "title", "date", "excerpt"]) {
    if (!fields[field]) throw new Error(`Missing ${field} in ${fileName}`);
  }
  return { fields, body: match[2].trim() };
}

function cleanResponse(content) {
  return content.trim().replace(/^```(?:markdown|md)?\s*/i, "").replace(/\s*```$/, "").trim();
}

async function translate(source, sourceFile, target) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY. Add it to .env or export it before translating missing articles.");
  const language = target === "en" ? "English" : "Korean";
  const prompt = `Translate this Russian Markdown article into ${language}. Return only the complete translated Markdown document, including its YAML frontmatter. Preserve id and date exactly. Translate type, title, excerpt, redacted values, headings, prose, and link labels. Keep Markdown structure, URLs, code blocks, code, product names, and technical identifiers unchanged. Each translated redacted value must appear verbatim in the translated body, preferably in the same bold phrase. Do not add commentary.\n\n${source}`;
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, temperature: 0.2, messages: [{ role: "user", content: prompt }] }),
  });
  if (!response.ok) throw new Error(`${sourceFile} -> ${target}: OpenRouter returned ${response.status} ${await response.text()}`);
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error(`${sourceFile} -> ${target}: OpenRouter returned no text content`);
  const translated = cleanResponse(content);
  const original = parseFrontmatter(source, sourceFile);
  const parsed = parseFrontmatter(translated, `${sourceFile}.${target}`);
  if (parsed.fields.id !== original.fields.id || parsed.fields.date !== original.fields.date) {
    throw new Error(`${sourceFile} -> ${target}: translated id or date differs from the source`);
  }
  return `${translated}\n`;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

const files = (await readdir(articlesDirectory)).filter((fileName) => fileName.endsWith(".ru.md"));
if (!files.length) throw new Error("No Russian source articles found. Source files must end in .ru.md.");

for (const fileName of files) {
  const source = await readFile(path.join(articlesDirectory, fileName), "utf8");
  for (const target of targets) {
    const outputFile = fileName.replace(/\.ru\.md$/, `.${target}.md`);
    const outputPath = path.join(articlesDirectory, outputFile);
    if (await exists(outputPath)) {
      console.log(`Skipped ${outputFile}: translation already exists`);
      continue;
    }
    const output = await translate(source, fileName, target);
    await writeFile(outputPath, output, "utf8");
    console.log(`Translated ${fileName} -> ${outputFile}`);
  }
}
