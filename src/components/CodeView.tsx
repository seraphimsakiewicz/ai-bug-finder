import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bug } from "@/types/bug";
import {
  AlertTriangle,
  FileText,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Shield,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

// Helper to get file name from path
const getFileName = (path: string) => {
  return path.split("/").pop() || path;
};

// Helper to get directory from path
const getDirectory = (path: string) => {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/") || "/";
};

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
  // Group overlapping bugs by line ranges
  const getOverlappingBugs = (bugs: Bug[], lineNumber: number) => {
    return bugs.filter(
      (bug) => lineNumber >= bug.lines[0] && lineNumber <= bug.lines[1]
    );
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
        {/* Left Panel - Files with Issues */}
        <div className="lg:col-span-1">
          <Card className="h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader className="pb-3">
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
              <ScrollArea className="h-[680px]">
                <div className="p-4 space-y-3">
                  {fileIssues.map((fileIssue) => (
                    <div
                      key={fileIssue.filePath}
                      className="border border-border/50 rounded-lg overflow-hidden"
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 text-left hover:bg-accent/50 rounded-none whitespace-normal"
                        disabled={loading || !scanCompleted}
                        onClick={() => onFileClick(fileIssue.filePath)}
                      >
                        <div className="flex items-center gap-2 w-full overflow-hidden">
                          {expandedFiles.has(fileIssue.filePath) ? (
                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                          )}
                          <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <p className="font-semibold text-sm truncate">
                                    {getFileName(fileIssue.filePath)}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {getDirectory(fileIssue.filePath)}
                                  </p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-mono text-xs break-all">
                                  {fileIssue.filePath}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            <Badge
                              variant="destructive"
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
                        <div className="border-t border-border/50 bg-muted/30">
                          {fileIssue.bugs.map((bug, index) => (
                            <Button
                              key={bug.id}
                              variant={
                                selectedBug?.id === bug.id
                                  ? "secondary"
                                  : "ghost"
                              }
                              className={`w-full justify-start h-auto p-3 text-left rounded-none hover:bg-accent/50 whitespace-normal ${
                                index !== fileIssue.bugs.length - 1
                                  ? "border-b border-border/30"
                                  : ""
                              }`}
                              disabled={loading || !scanCompleted}
                              onClick={() => onLeftPanelBugClick(bug)}
                            >
                              <div className="flex items-start gap-2 w-full overflow-hidden">
                                <div className="flex-1 min-w-0 max-w-80">
                                  <p className="text-sm font-medium line-clamp-2 break-words">
                                    {bug.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
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
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Middle Panel - Code Display */}
        <div className="lg:col-span-2">
          <Card className="h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                {selectedFile ? (
                  <span className="font-mono text-base truncate">
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
              <ScrollArea className="h-[680px]">
                {selectedFile ? (
                  <div className="font-mono text-sm">
                    {selectedFile.content.split("\n").map((line, index) => {
                      const lineNumber = index + 1;
                      const fileBugs =
                        fileIssues.find(
                          (f) => f.filePath === selectedFile.filePath
                        )?.bugs || [];
                      const overlappingBugs = getOverlappingBugs(
                        fileBugs,
                        lineNumber
                      );
                      const isSelectedBugLine =
                        selectedBug &&
                        lineNumber >= selectedBug.lines[0] &&
                        lineNumber <= selectedBug.lines[1];

                      return (
                        <div
                          key={lineNumber}
                          className={`group relative ${
                            overlappingBugs.length > 0
                              ? "bg-red-500/15 hover:bg-red-500/25"
                              : "hover:bg-accent/30"
                          } ${
                            isSelectedBugLine
                              ? "bg-yellow-500/20 hover:bg-yellow-500/30"
                              : ""
                          }`}
                        >
                          {/* Line with border indicator for bugs */}
                          <div
                            className={`flex items-start gap-4 px-4 py-0.5 ${
                              overlappingBugs.length > 0
                                ? "border-l-4 border-red-500"
                                : ""
                            }`}
                          >
                            <span className="text-muted-foreground w-12 text-right flex-shrink-0 select-none text-xs">
                              {lineNumber}
                            </span>
                            <div className="flex-1 overflow-x-auto">
                              <pre className="text-foreground">
                                <code>{line || " "}</code>
                              </pre>
                            </div>
                            {/* Bug indicators on the right */}
                            {overlappingBugs.length > 0 && (
                              <div className="flex items-center gap-1 pr-2">
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="flex items-center gap-1">
                                      <AlertTriangle className="h-4 w-4 text-red-500" />
                                      {overlappingBugs.length > 1 && (
                                        <Badge
                                          variant="destructive"
                                          className="text-xs px-1 py-0"
                                        >
                                          {overlappingBugs.length}
                                        </Badge>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-sm">
                                    <div className="space-y-2">
                                      {overlappingBugs.map((bug, idx) => (
                                        <div key={bug.id}>
                                          {idx > 0 && (
                                            <hr className="border-border/50" />
                                          )}
                                          <p className="font-semibold text-sm">
                                            {bug.title}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            Lines {bug.lines[0]}-{bug.lines[1]}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No file selected</p>
                    <p className="text-sm mt-2">
                      Click on a file in the left panel to view its contents
                    </p>
                  </div>
                )}
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Bug Details */}
        <div className="lg:col-span-1">
          <Card className="h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Issue Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[680px] pr-4">
                {selectedBug ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">
                        {selectedBug.title}
                      </h3>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          SECURITY ISSUE
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">
                          Description
                        </h4>
                        <p className="text-sm leading-relaxed">
                          {selectedBug.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground pt-8">
                    <Shield className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No issue selected</p>
                    <p className="text-sm mt-2">
                      Select an issue to view detailed information
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
