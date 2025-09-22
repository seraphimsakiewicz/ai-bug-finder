"use client";

import React, { useEffect, useState } from "react";
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
import { Bug } from "@/types/bug";
import { getSocket } from "@/lib/socket";

export default function Home() {
  const [repoName, setRepoName] = useState<string>("");
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [scanCompleted, setScanCompleted] = useState<boolean>(false);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [view, setView] = useState<"issues" | "code">("issues");

  useEffect(() => {
    const s = getSocket();

    const onConnect = () => console.log("socket connected:", s.id);

    const onProgress = (payload: { message: string }) => {
      setProgressMessage(payload.message);
    };

    const onComplete = (payload: {
      name: string;
      bugs: Bug[];
      count: number;
    }) => {
      console.log("analysis-complete", payload);
      setRepoName(payload.name);
      setBugs(payload.bugs ?? []);
      setLoading(false);
      setScanCompleted(true);
    };
    const onError = (e: Error) => {
      console.error("analysis-error", e);
      setLoading(false);
      setScanCompleted(false);
    };

    s.on("connect", onConnect);
    s.on("analysis-complete", onComplete);
    s.on("analysis-error", onError);
    s.on("analysis-progress", onProgress);

    return () => {
      s.off("connect", onConnect);
      s.off("analysis-complete", onComplete);
      s.off("analysis-error", onError);
      s.off("analysis-progress", onProgress);
    };
  }, []);

  const submitRepoName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // https://github.com/seraphimsakiewicz/evently
    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const repoUrl = formData.get("repoUrl");
    if (typeof repoUrl !== "string") {
      return;
    }
    const s = getSocket();
    s.emit("analyze-repo", repoUrl);
    formEl.reset();
  };

  return (
    <div className="container mx-auto px-4 mt-12 max-w-7xl">
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
        <div>
          <p>Loading...</p>
          <p className="text-sm text-muted-foreground">{progressMessage}</p>
        </div>
      ) : scanCompleted ? (
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

          <TabsContent value="issues">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Repo: {repoName || "—"}
              </div>
              {bugs.length === 0 ? (
                <p>No issues yet.</p>
              ) : (
                <ul className="list-disc pl-5">
                  {bugs.map((b, i) => (
                    <li key={i}>
                      <strong>{b.title}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>

          <TabsContent value="code">Code view hi</TabsContent>
        </Tabs>
      ) : (
        <div className="text-center text-muted-foreground">
          Enter a repository URL above to start scanning for security issues.
        </div>
      )}
    </div>
  );
}
