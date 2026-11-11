import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorPage } from "@/components/site/error-page";

const CODES = [404, 500, 501, 502, 503] as const;
type Code = (typeof CODES)[number];

function isCode(value: string): value is `${Code}` {
  return CODES.map(String).includes(value);
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Ошибка ${code}`,
    robots: { index: false, follow: false },
  };
}

export default async function ErrorCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!isCode(code)) notFound();
  return <ErrorPage code={Number(code) as Code} />;
}
