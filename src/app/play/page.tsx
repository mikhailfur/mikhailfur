import type { Metadata } from "next";
import { TerminalBlog } from "@/components/home/terminal-blog";
import { getLocalizedArticles } from "@/data/articles";
import { getGithubProjects } from "@/data/github-projects";

export const metadata: Metadata = {
  title: "MKH_ARCADE | mikhail_fur",
  description: "Wallz and pixel Snake games inside the mikhail_fur terminal.",
};

export default async function PlayPage() {
  const [articlesByLanguage, projects] = await Promise.all([
    getLocalizedArticles(),
    getGithubProjects(),
  ]);

  return (
    <TerminalBlog
      articlesByLanguage={articlesByLanguage}
      initialProjects={projects}
      initialMode="shell"
      initialShellSession="arcade"
    />
  );
}
