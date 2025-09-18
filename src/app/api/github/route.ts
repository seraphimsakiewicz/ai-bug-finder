import { Octokit } from "@octokit/rest";

export async function GET() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const response = await octokit.rest.repos.get({
    owner: "octocat",
    repo: "Hello-World",
  });

  console.log(response.data.name);
  return Response.json({ name: response.data.name });
}
