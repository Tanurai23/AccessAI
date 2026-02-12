export interface AuditIssue {
  id: string;
  type: string;
  severity: string;
  element: string;
  description: string;
  fixed: boolean;
  aiSuggestion?: string;
}