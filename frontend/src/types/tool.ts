export type ToolId =
  | "select"
  | "rectangle"
  | "ellipse"
  | "line"
  | "text"
  | "image"
  | "crop"
  | "hand";

export interface ToolDefinition {
  id: ToolId;
  label: string;
  shortcut: string; // single key hint shown in the tooltip
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}