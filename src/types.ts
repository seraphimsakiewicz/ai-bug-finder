export interface Bug {
  id: string;
  title: string;
  description: string;
  lines: number[]; // e.g. [34,55]
}

export type FileIssue = {
  filePath: string;
  bugs: Bug[];
  id: string;
};

export type SelectedFile = {
  filePath: string;
  content: string;
};
