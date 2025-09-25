import React from "react";
import { Bug } from "@/types/bug";

interface BugsViewProps {
  allBugs: (Bug & { filePath: string })[];
  loading: boolean;
  scanCompleted: boolean;
  onBugClick: (bug: Bug, filePath: string) => void;
}

export function BugsView({ allBugs, loading, scanCompleted, onBugClick }: BugsViewProps) {
  return (
    <div className="space-y-6">
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
                  onBugClick(bug, bug.filePath)
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

      {allBugs.length > 0 && (
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {allBugs.length} bugs
          </p>
        </div>
      )}
    </div>
  );
}