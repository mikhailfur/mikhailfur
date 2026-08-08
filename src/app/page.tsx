import { TerminalBlog } from "@/components/home/terminal-blog";
import { getLocalizedArticles } from "@/data/articles";
import { getGithubProjects } from "@/data/github-projects";

export default async function HomePage() {
  const [articlesByLanguage, projects] = await Promise.all([
    getLocalizedArticles(),
    getGithubProjects(),
  ]);

  return (
    <TerminalBlog
      articlesByLanguage={articlesByLanguage}
      initialProjects={projects}
    />
  );
}

