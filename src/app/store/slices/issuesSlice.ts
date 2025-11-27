import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Issue } from '../../../types';

interface IssuesState {
  issues: Issue[];
  filteredIssues: Issue[];
  selectedIssue: Issue | null;
  filters: {
    status: string;
    category: string;
    priority: string;
  };
  isLoading: boolean;
}

const initialState: IssuesState = {
  issues: [],
  filteredIssues: [],
  selectedIssue: null,
  filters: {
    status: 'all',
    category: 'all',
    priority: 'all',
  },
  isLoading: false,
};

const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setIssues: (state, action: PayloadAction<Issue[]>) => {
      state.issues = action.payload;
      state.filteredIssues = action.payload;
    },
    setSelectedIssue: (state, action: PayloadAction<Issue | null>) => {
      state.selectedIssue = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<IssuesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setIssues, setSelectedIssue, setFilters, setLoading } = issuesSlice.actions;
export default issuesSlice.reducer;