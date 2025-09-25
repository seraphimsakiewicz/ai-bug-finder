// types/bug.ts
export interface Bug {
  id: string;
  title: string;
  description: string;
  lines: number[]; // e.g. [34,55]
}
