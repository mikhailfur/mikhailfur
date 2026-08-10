import { notFound } from "next/navigation";
import { ErrorPage } from "@/components/error-pages/error-page";
import { MaintenanceTerminal } from "@/components/error-pages/maintenance-terminal";
import { repositoryUrl } from "@/data/github-commits";

const errorPages = {
  "404": {
    title: "Path not found.",
    description: "The requested route is not in this workspace.",
    detail: "No matching entry exists in the current directory.",
    primaryHref: "/",
    primaryLabel: "Return home",
    secondaryHref: "/404",
    secondaryLabel: "Retry",
  },
  "500": {
    title: "The process stopped.",
    description: "Something failed while the server was assembling this page.",
    detail: "The fault was local. Nothing has been lost.",
    primaryHref: "/500",
    primaryLabel: "Try again",
    secondaryHref: "/",
    secondaryLabel: "Return home",
  },
  "501": {
    title: "Command not implemented.",
    description: "This endpoint understands the request, but cannot execute it yet.",
    detail: "The feature is outside the current build.",
    primaryHref: "/",
    primaryLabel: "Return home",
    secondaryHref: "/501",
    secondaryLabel: "Retry",
  },
  "502": {
    title: "Bad gateway signal.",
    description: "The upstream service returned an unusable response.",
    detail: "The connection crossed the boundary, then broke.",
    primaryHref: "/502",
    primaryLabel: "Try again",
    secondaryHref: "/",
    secondaryLabel: "Return home",
  },
} as const;

type ErrorCode = keyof typeof errorPages;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return Object.keys(errorPages).map((code) => ({ code }));
}

export default async function ErrorCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  if (code === "503") {
    return <ErrorPage code="503" title="Service is offline." description="The site is taking a short maintenance pause." detail="Come back in a moment. The terminal will still be here." primaryHref="/503" primaryLabel="Try again" secondaryHref="/" secondaryLabel="Return home" extra={<MaintenanceTerminal commits={[]} repositoryUrl={repositoryUrl} />} />;
  }

  const page = errorPages[code as ErrorCode];
  if (!page) notFound();

  return <ErrorPage code={code as ErrorCode} {...page} />;
}
