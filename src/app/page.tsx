import { SiteShell } from "@/components/site/site-shell";
import { getLocalizedArticles } from "@/data/articles";
import { getLocalizedConstitution } from "@/data/constitution";
import { getGithubProjects } from "@/data/projects";

export const revalidate = 3600;

export default async function HomePage() {
  const [articlesByLanguage, constitutionByLanguage, projects] = await Promise.all([
    getLocalizedArticles(),
    getLocalizedConstitution(),
    getGithubProjects(),
  ]);

  return (
    <SiteShell
      articlesByLanguage={articlesByLanguage}
      constitutionByLanguage={constitutionByLanguage}
      projects={projects}
    />
  );
}
