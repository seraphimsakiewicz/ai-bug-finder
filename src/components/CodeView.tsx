import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bug } from "@/types/bug";
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

interface CodeViewProps {
  fileIssues: FileIssue[];
  selectedFile: SelectedFile | null;
  selectedBug: Bug | null;
  expandedFiles: Set<string>;
  loading: boolean;
  scanCompleted: boolean;
  onFileClick: (filePath: string) => void;
  onLeftPanelBugClick: (bug: Bug) => void;
}

export function CodeView({
  fileIssues,
  selectedFile,
  selectedBug,
  expandedFiles,
  loading,
  scanCompleted,
  onFileClick,
  onLeftPanelBugClick,
}: CodeViewProps) {
  return (
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
                      onClick={() => onFileClick(fileIssue.filePath)}
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
                          <Badge variant="outline" className="text-xs mt-1">
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
                            onClick={() => onLeftPanelBugClick(bug)}
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
                {fileIssues.find((f) => f.filePath === selectedFile.filePath)
                  ?.bugs.length || 0}{" "}
                security issues found
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {selectedFile ? (
                <div className="font-mono text-sm">
                  {selectedFile.content.split("\n").map((line, index) => {
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
                        } ${isSelectedBugLine ? "bg-primary/20" : ""}`}
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
                    Click on a file in the left panel to view its contents
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
                      Lines: {selectedBug.lines[0]} - {selectedBug.lines[1]}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recommendation</h4>
                  <p className="text-sm text-muted-foreground">
                    Review and fix the security vulnerability. Consider
                    implementing proper input validation, access controls, or
                    other security best practices.
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
  );
}