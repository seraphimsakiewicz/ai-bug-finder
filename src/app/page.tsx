"use client";

import React, { useState } from "react";

type Bug = {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  lineNumber: number;
  filePath: string;
};

export default function Home() {
  const [repoName, setRepoName] = useState<string>("");
  const [repoFileCount, setRepoFileCount] = useState<string>("");
  const [bugs, setBugs] = useState<Bug[]>([]);
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
      setBugs(data.bugs);
      formEl.reset();
    }
  };

  return (
    <div>
      <form onSubmit={submitRepoName}>
        <input
          type="text"
          name="repoUrl"
          // value="https://github.com/seraphimsakiewicz/evently"
          placeholder="GitHub repo URL"
        />
        <button type="submit">Analyze</button>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p>Repo: {repoName}</p>
          <p>File Count: {repoFileCount}</p>
          <div>
            <h2>Bugs</h2>
            {bugs.map((item) => {
              return (
                <div
                  key={`${item.title.split("").join("-")}-${item.lineNumber}`}
                >
                  <p>Title:{item.title}</p>
                  <p>Description:{item.description}</p>
                  <p>severity:{item.severity}</p>
                  <p>lineNumber:{item.lineNumber}</p>
                  <p>File Path: {item.filePath}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
