"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      setRepoName(data.name);
      setRepoFileCount(data.count);
      setBugs(data.bugs);
      formEl.reset();
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Repository Analysis
          </CardTitle>
          <CardDescription>
            Enter a public GitHub repository URL to begin security analysis
          </CardDescription>
          {/* <p>https://github.com/seraphimsakiewicz/evently</p> */}
        </CardHeader>
        <CardContent>
          <form className="flex gap-3" onSubmit={submitRepoName}>
            <Input
              type="url"
              name="repoUrl"
              placeholder="https://github.com/username/repository"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </form>
        </CardContent>
      </Card>
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
