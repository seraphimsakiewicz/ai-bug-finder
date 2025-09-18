"use client";

import React, { useState } from "react";

export default function Home() {
  const [repoName, setRepoName] = useState<string>("");

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const repoUrl = formData.get("repoUrl");
    if (typeof repoUrl === "string") {
      const response = await fetch(
        `/api/github?repoUrl=${encodeURIComponent(repoUrl)}`
      );
      const data = await response.json();
      setRepoName(data.name);
      formEl.reset();
    }
  };
  return (
    <div>
      <form onSubmit={submitForm}>
        <input type="text" name="repoUrl" placeholder="GitHub repo URL" />
        <button type="submit">Analyze</button>
      </form>
      {repoName && <p>Repo: {repoName}</p>}
    </div>
  );
}
