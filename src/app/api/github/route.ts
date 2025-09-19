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

  const codeFile = treeResponse.data.tree.find((file) => {
    return (
      file.type === "blob" &&
      (file.path?.endsWith(".js") ||
        file.path?.endsWith(".tsx") ||
        file.path?.endsWith(".ts"))
    );
  });

  console.log("codeFile", codeFile);
  if (codeFile) {
    const fileResponse = await octokit.rest.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: codeFile.path!,
    });
    const fileContent = Buffer.from(
      fileResponse.data.content,
      "base64"
    ).toString();
    console.log("fileContent", fileContent);
  }

  return Response.json({
    count: treeResponse.data.tree.length,
    name: repoName,
  });
}
