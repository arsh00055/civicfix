import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Issue, IssueFilters } from '@/types/issue.types';

interface IssuesState {
  issues: Issue[];
  filteredIssues: Issue[];
  selectedIssue: Issue | null;
  filters: IssueFilters;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const initialState: IssuesState = {
  issues: [],
  filteredIssues: [],
  selectedIssue: null,
  filters: {
    status: '',
    category: '',
    priority: '',
    location: '',
    search: '',
    dateRange: { start: '', end: '' },
    assignedTo: '',
    reporterId: '',
  },
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  },
};

const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setIssues: (state, action: PayloadAction<Issue[]>) => {
      state.issues = action.payload;
      state.filteredIssues = action.payload;
    },
    addIssue: (state, action: PayloadAction<Issue>) => {
      state.issues = [action.payload, ...state.issues];
      state.filteredIssues = [action.payload, ...state.filteredIssues];
    },
    updateIssue: (state, action: PayloadAction<Issue>) => {
      state.issues = state.issues.map(issue =>
        issue.id === action.payload.id ? action.payload : issue
      );
      state.filteredIssues = state.filteredIssues.map(issue =>
        issue.id === action.payload.id ? action.payload : issue
      );
      
      if (state.selectedIssue?.id === action.payload.id) {
        state.selectedIssue = action.payload;
      }
    },
    deleteIssue: (state, action: PayloadAction<string>) => {
      state.issues = state.issues.filter(issue => issue.id !== action.payload);
      state.filteredIssues = state.filteredIssues.filter(issue => issue.id !== action.payload);
      
      if (state.selectedIssue?.id === action.payload) {
        state.selectedIssue = null;
      }
    },
    setSelectedIssue: (state, action: PayloadAction<Issue | null>) => {
      state.selectedIssue = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<IssueFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPagination: (state, action: PayloadAction<Partial<IssuesState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    incrementVote: (state, action: PayloadAction<string>) => {
      state.issues = state.issues.map(issue => 
        issue.id === action.payload 
          ? { ...issue, upvotes: (issue.upvotes || 0) + 1 }
          : issue
      );
      
      state.filteredIssues = state.filteredIssues.map(issue =>
        issue.id === action.payload
          ? { ...issue, upvotes: (issue.upvotes || 0) + 1 }
          : issue
      );
      
      if (state.selectedIssue?.id === action.payload) {
        state.selectedIssue = {
          ...state.selectedIssue,
          upvotes: (state.selectedIssue.upvotes || 0) + 1,
        };
      }
    },
    assignIssue: (state, action: PayloadAction<{ issueId: string; volunteerId: string; volunteerName: string }>) => {
      const { issueId, volunteerId, volunteerName } = action.payload;

      state.issues = state.issues.map(issue =>
        issue.id === issueId
          ? { 
              ...issue,
              status: 'assigned' as const,
              assignedTo: { 
                ...issue.assignedTo,
                id: volunteerId, 
                name: volunteerName, 
                role: (issue.assignedTo && issue.assignedTo.role) ? issue.assignedTo.role : 'volunteer',
                avatar: issue.assignedTo?.avatar,
                rating: issue.assignedTo?.rating,
              }
            }
          : issue
      );

      state.filteredIssues = state.filteredIssues.map(issue =>
        issue.id === issueId
          ? { 
              ...issue,
              status: 'assigned' as const,
              assignedTo: { 
                ...issue.assignedTo,
                id: volunteerId, 
                name: volunteerName, 
                role: (issue.assignedTo && issue.assignedTo.role) ? issue.assignedTo.role : 'volunteer',
                avatar: issue.assignedTo?.avatar,
                rating: issue.assignedTo?.rating,
              }
            }
          : issue
      );

      
      if (state.selectedIssue?.id === issueId) {
        state.selectedIssue = {
          ...state.selectedIssue,
          status: 'assigned' as const,
          assignedTo: {
            id: volunteerId, name: volunteerName,
            role: 'volunteer'
          }
        };
      }
    },
    updateIssueStatus: (state, action: PayloadAction<{ issueId: string; status: Issue['status'] }>) => {
      const { issueId, status } = action.payload;
      
      state.issues = state.issues.map(issue =>
        issue.id === issueId ? { ...issue, status } : issue
      );
      
      state.filteredIssues = state.filteredIssues.map(issue =>
        issue.id === issueId ? { ...issue, status } : issue
      );
      
      if (state.selectedIssue?.id === issueId) {
        state.selectedIssue = { ...state.selectedIssue, status };
      }
    },
  },
});

export const { 
  setIssues, 
  addIssue,
  updateIssue,
  deleteIssue,
  setSelectedIssue, 
  setFilters,
  clearFilters,
  setLoading,
  setError,
  setPagination,
  incrementVote,
  assignIssue,
  updateIssueStatus
} = issuesSlice.actions;

export default issuesSlice.reducer;