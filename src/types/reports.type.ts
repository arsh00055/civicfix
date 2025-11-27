export type ReportType = 'issues' | 'users' | 'performance' | 'financial' | 'system';
export type ReportFormat = 'pdf' | 'csv' | 'excel';

export interface Report {
  id: string;
  title: string;
  description: string;
  type: ReportType;
  format: ReportFormat;
  generatedAt: string;
  period: string;
  downloadUrl?: string;
  status?: 'generating' | 'completed' | 'failed';
  fileSize?: string;
}