import { NextResponse } from "next/server";
import { getGithubProjects } from "@/data/github-projects";

export async function GET() {
  const projects = await getGithubProjects();
  return NextResponse.json(projects);
}
