export type GithubCommit = {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
};

type GithubCommitResponse = {
  sha?: string;
  html_url?: string;
  commit?: {
    message?: string;
    author?: { name?: string; date?: string };
  };
};

const repositoryUrl = "https://github.com/mikhailfur/mikhailfur";

export async function getLatestGithubCommits(): Promise<GithubCommit[]> {
  try {
    const response = await fetch("https://api.github.com/repos/mikhailfur/mikhailfur/commits?per_page=6", {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(2500),
    });

    if (!response.ok) return [];
    const payload = (await response.json()) as GithubCommitResponse[];

    return payload.flatMap((entry) => {
      const sha = entry.sha?.slice(0, 7);
      const message = entry.commit?.message?.split("\n", 1)[0];
      if (!sha || !message) return [];
      return [{
        sha,
        message,
        author: entry.commit?.author?.name || "unknown",
        date: entry.commit?.author?.date || "",
        url: entry.html_url || repositoryUrl,
      }];
    });
  } catch {
    return [];
  }
}

export { repositoryUrl };
