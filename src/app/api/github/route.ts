import { Octokit } from "@octokit/rest";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repoUrl = new URL(searchParams.get("repoUrl") || "");
  const [, owner, repo] = repoUrl.pathname.split("/");

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const response = await octokit.rest.repos.get({
    owner: owner,
    repo: repo,
  });

  console.log(response.data.name);
  return Response.json({ name: response.data.name });
}
