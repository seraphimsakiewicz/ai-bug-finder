"use client";

import React, { useState } from "react";

export default function Home() {
  const [repoName, setRepoName] = useState<string>("");
  const [repoFileCount, setRepoFileCount] = useState<string>("");

  const submitRepoName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // https://github.com/seraphimsakiewicz/evently
    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const repoUrl = formData.get("repoUrl");
    if (typeof repoUrl === "string") {
      const response = await fetch(
        `/api/github?repoUrl=${encodeURIComponent(repoUrl)}`
      );
      const data = await response.json();
      setRepoName(data.name);
      setRepoFileCount(data.count);
      formEl.reset();
    }
  };

  return (
    <div>
      <form onSubmit={submitRepoName}>
        <input type="text" name="repoUrl" placeholder="GitHub repo URL" />
        <button type="submit">Analyze</button>
      </form>
      {repoName && (
        <div>
          <p>Repo: {repoName}</p>
          <p>File Count: {repoFileCount}</p>
        </div>
      )}
    </div>
  );
}
