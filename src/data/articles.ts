import type { Article, Language } from "@/types/portfolio";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const articlesDirectory = path.join(process.cwd(), "src", "data", "articles");

function parseArticle(source: string, fileName: string): Article {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`Missing frontmatter in src/data/articles/${fileName}`);

  const fields = Object.fromEntries(
    match[1].split(/\r?\n/).flatMap((line) => {
      const separator = line.indexOf(":");
      return separator === -1 ? [] : [[line.slice(0, separator).trim(), line.slice(separator + 1).trim()]];
    }),
  );
  const required = ["id", "type", "title", "date", "excerpt"] as const;
  for (const field of required) {
    if (!fields[field]) throw new Error(`Missing ${field} in src/data/articles/${fileName}`);
  }

  return {
    id: fields.id,
    type: fields.type,
    title: fields.title,
    date: fields.date,
    excerpt: fields.excerpt,
    content: match[2].trim(),
  };
}

export async function getArticles(language: Language): Promise<Article[]> {
  try {
    const fileNames = (await readdir(articlesDirectory)).filter((fileName) => fileName.endsWith(`.${language}.md`));
    const articles = await Promise.all(
      fileNames.map(async (fileName) =>
        parseArticle(await readFile(path.join(articlesDirectory, fileName), "utf8"), fileName),
      ),
    );
    return articles.sort((left, right) => Date.parse(right.date) - Date.parse(left.date));
  } catch {
    return [];
  }
}

export async function getLocalizedArticles() {
  const entries = await Promise.all(
    (["ru", "en", "ko"] as const).map(async (language) => [language, await getArticles(language)] as const),
  );
  return Object.fromEntries(entries) as Record<Language, Article[]>;
}
