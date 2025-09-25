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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bug } from "@/types/bug";
import { getSocket } from "@/lib/socket";
import {
  AlertTriangle,
  FileText,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

type FileIssue = {
  filePath: string;
  bugs: Bug[];
};

type SelectedFile = {
  filePath: string;
  content: string;
};

export default function Home() {
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [scanCompleted, setScanCompleted] = useState<boolean>(false);
  const [fileIssues, setFileIssues] = useState<FileIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [view, setView] = useState<"bugs" | "code">("bugs");
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [repoInfo, setRepoInfo] = useState<{
    owner: string;
    name: string;
  } | null>(null);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [scanStartTime, setScanStartTime] = useState<Date | null>(null);
  const [scanCompletionTime, setScanCompletionTime] = useState<Date | null>(
    null
  );

  // update ui as u recieve bugs.
  // in readme, say vertsion ur using such as node

  useEffect(() => {
    const s = getSocket();

    const onConnect = () => console.log("socket connected:", s.id);

    const onProgress = (payload: { message: string }) => {
      setProgressMessage(payload.message);
    };

    const onFileAnalyzed = (payload: { filePath: string; bugs: Bug[] }) => {
      console.log("file-analyzed", payload);
      if (payload.bugs.length > 0) {
        setFileIssues((prev) => [...prev, payload]);
      } else {
        console.log("no bugs found for file!", payload.filePath);
      }
    };

    const onFileContentReceived = (payload: {
      filePath: string;
      content: string;
    }) => {
      console.log("file-content-received", payload);
      setSelectedFile(payload);
    };

    const onFileContentError = (payload: {
      filePath: string;
      error: string;
    }) => {
      console.error("file-content-error", payload);
    };

    const onComplete = (payload: { name: string; count: number }) => {
      console.log("analysis-complete", payload);
      const completionTime = new Date();
      setLoading(false);
      setScanCompleted(true);
      setScanCompletionTime(completionTime);
    };
    const onError = (e: Error) => {
      console.error("analysis-error", e);
      setLoading(false);
      setScanCompleted(false);
    };

    s.on("connect", onConnect);
    s.on("file-analyzed", onFileAnalyzed);
    s.on("file-content-received", onFileContentReceived);
    s.on("file-content-error", onFileContentError);
    s.on("analysis-complete", onComplete);
    s.on("analysis-error", onError);
    s.on("analysis-progress", onProgress);

    return () => {
      s.off("connect", onConnect);
      s.off("file-analyzed", onFileAnalyzed);
      s.off("file-content-received", onFileContentReceived);
      s.off("file-content-error", onFileContentError);
      s.off("analysis-complete", onComplete);
      s.off("analysis-error", onError);
      s.off("analysis-progress", onProgress);
    };
  }, []);

  const submitRepoName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFileIssues([]);
    setSelectedFile(null);
    setSelectedBug(null);
    setLoading(true);
    setScanCompleted(false);
    setScanStartTime(new Date());
    setScanCompletionTime(null);

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const repoUrl = formData.get("repoUrl");
    if (typeof repoUrl !== "string") {
      return;
    }

    // Parse repo info for later use
    const url = new URL(repoUrl);
    const [, owner, name] = url.pathname.split("/");
    setRepoInfo({ owner, name });

    const s = getSocket();
    s.emit("analyze-repo", repoUrl);
    formEl.reset();
  };

  // Flatten bugs for Issues view
  const allBugs = fileIssues.flatMap((file) =>
    file.bugs.map((bug) => ({ ...bug, filePath: file.filePath }))
  );

  // Handle bug click - fetch file content and switch to code view
  const handleBugClick = (bug: Bug, filePath: string) => {
    if (!repoInfo) return;

    setSelectedBug(bug);
    setView("code");

    // Expand the file in the left panel
    setExpandedFiles((prev) => new Set([...prev, filePath]));

    // Fetch file content if not already loaded or different file
    if (!selectedFile || selectedFile.filePath !== filePath) {
      const s = getSocket();
      s.emit("get-file-content", {
        repoOwner: repoInfo.owner,
        repoName: repoInfo.name,
        filePath,
      });
    }
  };

  // Handle file click in code view
  const handleFileClick = (filePath: string) => {
    if (!repoInfo) return;

    // Toggle expanded state
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(filePath)) {
      newExpanded.delete(filePath);
    } else {
      newExpanded.add(filePath);
    }
    setExpandedFiles(newExpanded);

    // Fetch file content if not already loaded
    if (!selectedFile || selectedFile.filePath !== filePath) {
      const s = getSocket();
      s.emit("get-file-content", {
        repoOwner: repoInfo.owner,
        repoName: repoInfo.name,
        filePath,
      });
    }
  };

  // Handle bug click in left panel
  const handleLeftPanelBugClick = (bug: Bug) => {
    setSelectedBug(bug);
  };

  // Format elapsed time helper
  const formatElapsedTime = (startTime: Date, endTime: Date): string => {
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
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
      {/* Blue-bordered loading indicator */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Analysis in progress...
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {progressMessage || "Scanning repository for security issues"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                {allBugs.length} bugs found
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {fileIssues.length} files with issues
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Green completion banner */}
      {scanCompleted && scanStartTime && scanCompletionTime && repoInfo && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Scanned {scanCompletionTime.toLocaleDateString()}{" "}
                {scanCompletionTime.toLocaleTimeString()}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                https://github.com/{repoInfo.owner}/{repoInfo.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                Completed in{" "}
                {formatElapsedTime(scanStartTime, scanCompletionTime)}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                {allBugs.length} bugs found in {fileIssues.length} files
              </p>
            </div>
          </div>
        </div>
      )}

      {scanCompleted || fileIssues.length > 0 ? (
        <Tabs value={view} onValueChange={(v) => setView(v as "bugs" | "code")}>
          {/* componentize each tabs content */}
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="bugs" className="gap-2">
              Bugs View
            </TabsTrigger>
            <TabsTrigger
              value="code"
              className="gap-2"
              disabled={loading || !scanCompleted}
            >
              Code View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bugs">
            <div className="space-y-6">
              {/* Bugs List */}
              <div className="border rounded-lg">
                {allBugs.length === 0 ? (
                  <div className="p-8 text-center">
                    {loading && !scanCompleted ? (
                      <>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          No bugs found yet
                        </h3>
                        <p className="text-muted-foreground">
                          Analysis is still running. Bugs will appear here as
                          they&apos;re detected.
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          No bugs found
                        </h3>
                        <p className="text-muted-foreground">
                          Great! No security bugs were detected in this
                          repository.
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="divide-y">
                    {allBugs.map((bug, index) => (
                      <div
                        key={`${bug.id}-${index}`}
                        className="p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                        aria-disabled={loading || !scanCompleted}
                        onClick={() =>
                          !loading &&
                          scanCompleted &&
                          handleBugClick(bug, bug.filePath)
                        }
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
                                  <span>
                                    Lines {bug.lines[0]}-{bug.lines[1]}
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
              {allBugs.length > 0 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {allBugs.length} bugs
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="code">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
              {/* Left Panel - Files with Issues */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5" />
                      Files with Issues
                    </CardTitle>
                    <CardDescription>
                      {fileIssues.length} files contain security issues
                      {loading && !scanCompleted && " (analysis ongoing)"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                      <div className="p-4 space-y-2">
                        {fileIssues.map((fileIssue) => (
                          <div key={fileIssue.filePath}>
                            {/* File Header */}
                            <Button
                              variant="ghost"
                              className="w-full justify-start h-auto p-3 text-left"
                              disabled={loading || !scanCompleted}
                              onClick={() =>
                                handleFileClick(fileIssue.filePath)
                              }
                            >
                              <div className="flex items-center gap-2 w-full">
                                {expandedFiles.has(fileIssue.filePath) ? (
                                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                )}
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-mono text-sm truncate">
                                    {fileIssue.filePath}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className="text-xs mt-1"
                                  >
                                    {fileIssue.bugs.length} issue
                                    {fileIssue.bugs.length !== 1 ? "s" : ""}
                                  </Badge>
                                </div>
                              </div>
                            </Button>

                            {/* Nested Bugs */}
                            {expandedFiles.has(fileIssue.filePath) && (
                              <div className="ml-6 space-y-1">
                                {fileIssue.bugs.map((bug) => (
                                  <Button
                                    key={bug.id}
                                    variant={
                                      selectedBug?.id === bug.id
                                        ? "secondary"
                                        : "ghost"
                                    }
                                    className="w-full justify-start h-auto p-2 text-left text-xs"
                                    disabled={loading || !scanCompleted}
                                    onClick={() => handleLeftPanelBugClick(bug)}
                                  >
                                    <div className="flex items-center gap-2 w-full">
                                      <AlertTriangle className="h-3 w-3 text-red-400 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="truncate">{bug.title}</p>
                                        <p className="text-muted-foreground">
                                          Lines {bug.lines[0]}-{bug.lines[1]}
                                        </p>
                                      </div>
                                    </div>
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Middle Panel - Code Display */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5" />
                      {selectedFile ? (
                        <span className="font-mono text-base">
                          {selectedFile.filePath}
                        </span>
                      ) : (
                        "Select a file to view code"
                      )}
                    </CardTitle>
                    {selectedFile && (
                      <CardDescription>
                        {fileIssues.find(
                          (f) => f.filePath === selectedFile.filePath
                        )?.bugs.length || 0}{" "}
                        security issues found
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                      {selectedFile ? (
                        <div className="font-mono text-sm">
                          {selectedFile.content
                            .split("\n")
                            .map((line, index) => {
                              const lineNumber = index + 1;
                              const fileBugs =
                                fileIssues.find(
                                  (f) => f.filePath === selectedFile.filePath
                                )?.bugs || [];
                              const lineHasBug = fileBugs.some(
                                (bug) =>
                                  lineNumber >= bug.lines[0] &&
                                  lineNumber <= bug.lines[1]
                              );
                              const isSelectedBugLine =
                                selectedBug &&
                                lineNumber >= selectedBug.lines[0] &&
                                lineNumber <= selectedBug.lines[1];

                              return (
                                <div
                                  key={lineNumber}
                                  className={`flex items-start gap-4 px-4 py-1 hover:bg-accent/30 ${
                                    lineHasBug
                                      ? "bg-red-500/10 border-l-4 border-red-400"
                                      : ""
                                  } ${
                                    isSelectedBugLine ? "bg-primary/20" : ""
                                  }`}
                                >
                                  <span className="text-muted-foreground w-12 text-right flex-shrink-0 select-none">
                                    {lineNumber}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <code className="text-foreground whitespace-pre">
                                      {line}
                                    </code>
                                    {lineHasBug && (
                                      <div className="flex items-center gap-2 mt-1">
                                        {fileBugs
                                          .filter(
                                            (bug) =>
                                              lineNumber >= bug.lines[0] &&
                                              lineNumber <= bug.lines[1]
                                          )
                                          .map((bug) => (
                                            <div
                                              key={bug.id}
                                              className="flex items-center gap-1"
                                            >
                                              <AlertTriangle className="h-3 w-3 text-red-400" />
                                              <span className="text-xs text-muted-foreground">
                                                {bug.title}
                                              </span>
                                            </div>
                                          ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p>
                            Click on a file in the left panel to view its
                            contents
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Bug Details */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertTriangle className="h-5 w-5" />
                      Issue Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedBug ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {selectedBug.title}
                          </h3>
                          <Badge variant="destructive" className="mt-2">
                            SECURITY ISSUE
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedBug.description}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Location</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="font-mono text-xs">
                                {
                                  fileIssues.find((f) =>
                                    f.bugs.some((b) => b.id === selectedBug.id)
                                  )?.filePath
                                }
                              </span>
                            </div>
                            <p className="text-muted-foreground">
                              Lines: {selectedBug.lines[0]} -{" "}
                              {selectedBug.lines[1]}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Recommendation</h4>
                          <p className="text-sm text-muted-foreground">
                            Review and fix the security vulnerability. Consider
                            implementing proper input validation, access
                            controls, or other security best practices.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Select an issue to view details</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center text-muted-foreground">
          Enter a repository URL above to start scanning for security bugs.
        </div>
      )}
    </div>
  );
}
