export type ReportType = 
  | 'issues' 
  | 'users' 
  | 'performance' 
  | 'financial' 
  | 'system'
  | 'volunteer'
  | 'geographic'
  | 'category'
  | 'trends';

export type ReportFormat = 'pdf' | 'csv' | 'excel' | 'json' | 'html';

export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed' | 'cancelled';

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  generatedAt: string;
  period: {
    start: string;
    end: string;
    timezone: string;
  };
  filters?: Record<string, any>;
  downloadUrl?: string;
  previewUrl?: string;
  status: ReportStatus;
  fileSize?: string;
  generatedBy: string;
  generationTime?: number;
  error?: string;
  metadata?: {
    rows?: number;
    columns?: number;
    charts?: number;
    lastUpdated?: string;
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  format: ReportFormat;
  filters: ReportFilters;
  schedule?: ReportSchedule;
  recipients: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportFilters {
  dateRange?: {
    start?: string;
    end?: string;
    relative?: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'last_year';
  };
  categories?: string[];
  statuses?: string[];
  priorities?: string[];
  locations?: string[];
  users?: string[];
  volunteers?: string[];
  minVotes?: number;
  maxVotes?: number;
  tags?: string[];
  includeResolved?: boolean;
  includeClosed?: boolean;
  assignedOnly?: boolean;
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
  minute: number;
  timezone: string;
  nextRun?: string;
}

export interface ReportData {
  summary: ReportSummary;
  details: any[];
  charts?: ReportChart[];
  tables?: ReportTable[];
  metrics?: ReportMetric[];
}

export interface ReportSummary {
  totalIssues: number;
  resolvedIssues: number;
  resolutionRate: number;
  averageResolutionTime: number;
  activeVolunteers: number;
  totalUsers: number;
  newUsers: number;
  geographicDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
}

export interface ReportChart {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'scatter';
  title: string;
  data: any;
  options?: any;
}

export interface ReportTable {
  title: string;
  headers: string[];
  rows: any[][];
  summary?: string;
}

export interface ReportMetric {
  title: string;
  value: number | string;
  change?: number;
  isPositive?: boolean;
  format?: 'number' | 'percentage' | 'currency' | 'duration';
  description?: string;
}

export interface ReportGenerationRequest {
  type: ReportType;
  format: ReportFormat;
  filters?: ReportFilters;
  title?: string;
  description?: string;
  schedule?: ReportSchedule;
  recipients?: string[];
  templateId?: string;
}

export interface ReportExportOptions {
  includeCharts: boolean;
  includeTables: boolean;
  includeSummary: boolean;
  includeRawData: boolean;
  compress: boolean;
  passwordProtect?: boolean;
}