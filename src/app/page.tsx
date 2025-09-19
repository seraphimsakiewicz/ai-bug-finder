"use client";

import React, { useState } from "react";

export default function Home() {
  const [repoName, setRepoName] = useState<string>("");
  const [repoFileCount, setRepoFileCount] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const submitRepoName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // https://github.com/seraphimsakiewicz/evently
    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const repoUrl = formData.get("repoUrl");
    if (typeof repoUrl === "string") {
      const response = await fetch(
        `/api/github?repoUrl=${encodeURIComponent(repoUrl)}`
      );
      const data = await response.json();
      setLoading(false);
      setRepoName(data.name);
      setRepoFileCount(data.count);
      setAnalysis(data.analysis);
      setCode(data.code);
      formEl.reset();
    }
  };

  return (
    <div>
      <form onSubmit={submitRepoName}>
        <input type="text" name="repoUrl" placeholder="GitHub repo URL" />
        <button type="submit">Analyze</button>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p>Repo: {repoName}</p>
          <p>File Count: {repoFileCount}</p>
          <code>{code}</code>
          <p>Analysis: {analysis}</p>
        </div>
      )}
    </div>
  );
}
