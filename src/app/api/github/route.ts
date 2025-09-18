import { Octokit } from "@octokit/rest";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repoUrl = new URL(searchParams.get("repoUrl") || "");
  const [, repoOwner, repoName] = repoUrl.pathname.split("/");

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const treeResponse = await octokit.rest.git.getTree({
    owner: repoOwner,
    repo: repoName,
    tree_sha: "HEAD",
    recursive: "true",
  });

  return Response.json({
    count: treeResponse.data.tree.length,
    name: repoName,
  });
}
