"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  // const [repoName, setRepoName] = useState<string>("");
  // const [repoFileCount, setRepoFileCount] = useState<string>("");
  // const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [view, setView] = useState<"issues" | "code">("issues");

  const submitRepoName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // https://github.com/seraphimsakiewicz/evently
    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const repoUrl = formData.get("repoUrl");
    if (typeof repoUrl === "string") {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      // const response = await fetch(
      //   `/api/github?repoUrl=${encodeURIComponent(repoUrl)}`
      // );
      // const data = await response.json();
      // setRepoName(data.name);
      // setRepoFileCount(data.count);
      // setBugs(data.bugs);
      formEl.reset();
      setLoading(false);
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
          <p>https://github.com/seraphimsakiewicz/evently</p>
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
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "issues" | "code")}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="issues" className="gap-2">
              Issues View
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              Code View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="issues">Issues view hi</TabsContent>

          <TabsContent value="code">Code view hi</TabsContent>
        </Tabs>
      )}
    </div>
  );
}
