import { SiteShell } from "@/components/site/site-shell";
import { getLocalizedArticles } from "@/data/articles";
import { getGithubProjects } from "@/data/projects";

export const revalidate = 3600;

export default async function HomePage() {
  const [articlesByLanguage, projects] = await Promise.all([
    getLocalizedArticles(),
    getGithubProjects(),
  ]);

  return <SiteShell articlesByLanguage={articlesByLanguage} projects={projects} />;
}
