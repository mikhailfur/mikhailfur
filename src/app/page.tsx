import { TerminalBlog } from "@/components/home/terminal-blog";
import { getLocalizedArticles } from "@/data/articles";

export default async function HomePage() {
  return <TerminalBlog articlesByLanguage={await getLocalizedArticles()} />;
}
