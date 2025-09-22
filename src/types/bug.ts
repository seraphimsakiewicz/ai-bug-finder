// types/bug.ts
export interface Bug {
  id: string;
  title: string;
  description: string;
  bugLines: number[]; // e.g. [34,55]
  filePath: string;
  fullCode: string[]; // e.g. ["line 1 of code goes here", "line 2 of code goes here"]
}
