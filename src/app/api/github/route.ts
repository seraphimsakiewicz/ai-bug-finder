import { Octokit } from "@octokit/rest";
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  const codeFiles = treeResponse.data.tree
    .filter((file) => {
      return (
        file.type === "blob" &&
        (file.path?.endsWith(".js") ||
          file.path?.endsWith(".tsx") ||
          file.path?.endsWith(".ts"))
      );
    })
    .slice(0, 3);

  const allBugs = [];

  for (const codeFile of codeFiles) {
    const fileResponse = await octokit.rest.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: codeFile.path!,
    });

    if (
      !Array.isArray(fileResponse.data) &&
      fileResponse.data.type === "file"
    ) {
      const fileContent = Buffer.from(
        fileResponse.data.content,
        "base64"
      ).toString();
      const aiResponse = await client.responses.create({
        model: "gpt-5-nano",
        input: `Analyze this code for security vulnerabilities. If the code has no bugs return buggy:false, otherwise return buggy:true.
         Return ONLY valid JSON in this format:
  {
    "bugs": [
      {
        "title": "Brief bug description",
        "description": "Detailed explanation", 
        "severity": "high|medium|low",
        "lineNumber": 42
        "filePath" ${codeFile.path}
      }
    ]
      "buggy": true | false
  }
  
  Code to analyze:
  ${fileContent}`,
      });
      const bugsData = JSON.parse(aiResponse.output_text);
      console.log("bugsData", bugsData);
      allBugs.push(...bugsData.bugs);
    }
  }
  console.log("allBugs", allBugs);
  return Response.json({
    count: treeResponse.data.tree.length,
    name: repoName,
    bugs: allBugs,
    // analysis: aiResponse.output_text.bugs,
    // code: fileContent,
  });
}
