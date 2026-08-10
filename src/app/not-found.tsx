import { ErrorPage } from "@/components/error-pages/error-page";

export default function NotFound() {
  return <ErrorPage code="404" title="Path not found." description="The requested route is not in this workspace." detail="No matching entry exists in the current directory." primaryHref="/" primaryLabel="Return home" secondaryHref="/404" secondaryLabel="Open 404" />;
}
