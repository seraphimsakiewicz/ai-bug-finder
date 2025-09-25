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
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [scanCompleted, setScanCompleted] = useState<boolean>(false);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [view, setView] = useState<"bugs" | "code">("bugs");

  useEffect(() => {
    const s = getSocket();

    const onConnect = () => console.log("socket connected:", s.id);

    const onProgress = (payload: { message: string }) => {
      setProgressMessage(payload.message);
    };

    const onFileAnalyzed = (payload: { filePath: string; bugs: Bug[] }) => {
      // console.log("file-analyzed", payload);
      setBugs((prevBugs) => [...prevBugs, ...payload.bugs]);
    };

    const onComplete = (payload: { name: string; count: number }) => {
      console.log("analysis-complete", payload);
      setLoading(false);
      setScanCompleted(true);
    };
    const onError = (e: Error) => {
      console.error("analysis-error", e);
      setLoading(false);
      setScanCompleted(false);
    };

    s.on("connect", onConnect);
    s.on("file-analyzed", onFileAnalyzed);
    s.on("analysis-complete", onComplete);
    s.on("analysis-error", onError);
    s.on("analysis-progress", onProgress);

    return () => {
      s.off("connect", onConnect);
      s.off("file-analyzed", onFileAnalyzed);
      s.off("analysis-complete", onComplete);
      s.off("analysis-error", onError);
      s.off("analysis-progress", onProgress);
    };
  }, []);

  const submitRepoName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBugs([]);
    setLoading(true);
    setScanCompleted(false);
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
            Repository Analysisss
          </CardTitle>
          <CardDescription>
            Enter a public GitHubbb repository URL to begin security analysis
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
        <Tabs value={view} onValueChange={(v) => setView(v as "bugs" | "code")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="bugs" className="gap-2">
              Bugs View
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              Code Viewww
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bugs">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Bugs</h2>
              </div>

              {/* Bugs List */}
              <div className="border rounded-lg">
                {bugs.length === 0 ? (
                  <div className="p-8 text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No bugs found
                    </h3>
                    <p className="text-muted-foreground">
                      Great! No security bugs were detected in this repository.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {bugs.map((bug, index) => (
                      <div
                        key={`${bug.id}-${index}`}
                        className="p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                        // onClick={() => onbugSelect(bug.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                                  {bug.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {bug.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="font-mono">
                                    {bug.filePath}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {bugs.length > 0 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {bugs.length} bugs
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="code">Code view hi</TabsContent>
        </Tabs>
      ) : (
        <div className="text-center text-muted-foreground">
          Enter a repository URL above to start scanning for security bugs.
        </div>
      )}
    </div>
  );
}
