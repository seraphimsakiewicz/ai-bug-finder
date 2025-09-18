"use client";

import React from "react";

export default function Home() {
  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const repoUrl = formData.get("repoUrl");
    const response = await fetch("/api/github");
    await response.json();
    formEl.reset();
  };
  return (
    <div>
      <form onSubmit={submitForm}>
        <input type="text" name="repoUrl" placeholder="GitHub repo URL" />
        <button type="submit">Analyze</button>
      </form>
    </div>
  );
}
