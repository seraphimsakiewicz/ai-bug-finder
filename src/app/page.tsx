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
import { Bug, FileIssue, SelectedFile } from "@/types";
import { getSocket } from "@/lib/socket";
import { BugsView } from "@/components/BugsView";
import { CodeView } from "@/components/CodeView";
// import { data } from "@/lib/mockdata";

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
  } | null>({
    owner: "seraphimsakiewicz",
    name: "evently",
  });
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [scanStartTime, setScanStartTime] = useState<Date | null>(null);
  const [scanCompletionTime, setScanCompletionTime] = useState<Date | null>(
    null
  );

  // in readme, say vertsion ur using such as node

  useEffect(() => {
    const s = getSocket();

    const onConnect = () => console.log("socket connected:", s.id);

    const onProgress = (payload: { message: string }) => {
      setProgressMessage(payload.message);
    };

    const onFileAnalyzed = (payload: {
      filePath: string;
      bugs: Bug[];
      id: string;
    }) => {
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
      console.log("all issues", fileIssues);
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
  });

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
  console.log("fileIssues", fileIssues);
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
    if (selectedFile?.filePath !== filePath) {
      setSelectedBug(null);
    }

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

    // Find which file this bug belongs to
    const bugFile = fileIssues.find((fileIssue) =>
      fileIssue.bugs.some((fileBug) => fileBug.id === bug.id)
    );

    if (!bugFile || !repoInfo) return;

    // If the bug is from a different file than currently selected, fetch that file's content
    if (!selectedFile || selectedFile.filePath !== bugFile.filePath) {
      const s = getSocket();
      s.emit("get-file-content", {
        repoOwner: repoInfo.owner,
        repoName: repoInfo.name,
        filePath: bugFile.filePath,
      });
    }
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
  //
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
            <BugsView
              allBugs={allBugs}
              loading={loading}
              scanCompleted={scanCompleted}
              onBugClick={handleBugClick}
            />
          </TabsContent>

          <TabsContent value="code">
            <CodeView
              fileIssues={fileIssues}
              selectedFile={selectedFile}
              selectedBug={selectedBug}
              expandedFiles={expandedFiles}
              loading={loading}
              scanCompleted={scanCompleted}
              onFileClick={handleFileClick}
              onLeftPanelBugClick={handleLeftPanelBugClick}
            />
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
