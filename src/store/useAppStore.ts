import { create } from 'zustand';
import type {
  AppState,
  ProcessedData,
  StyleId,
  RateLimitInfo,
  LoadingStatus,
} from '../types';
import { RECENT_YEAR } from '../types';
import {
  fetchContributions,
  GitHubApiError,
  validateUsername,
} from '../services/githubApi';
import { processGitHubData } from '../services/dataProcessor';

interface AppStore extends AppState {
  setUsername: (username: string) => void;
  setSelectedStyle: (style: StyleId) => void;
  setExportResolution: (resolution: 'hd' | 'fullhd' | 'print') => void;
  setSelectedYear: (year: number) => void;
  fetchData: (username: string, year?: number, token?: string) => Promise<void>;
  fetchYearData: (year: number, token?: string) => Promise<void>;
  clearData: () => void;
  setError: (message: string | null) => void;
  setRateLimitInfo: (info: RateLimitInfo | null) => void;
  initAvailableYears: () => void;
}

function getCurrentYear(): number {
  return new Date().getFullYear();
}

function generateAvailableYears(): number[] {
  const currentYear = getCurrentYear();
  const years: number[] = [RECENT_YEAR];
  for (let year = currentYear; year >= 2008; year--) {
    years.push(year);
  }
  return years;
}

export const useAppStore = create<AppStore>((set, get) => ({
  username: '',
  loadingStatus: 'idle',
  contributionData: null,
  selectedStyle: 'scroll',
  exportResolution: 'fullhd',
  errorMessage: null,
  rateLimitInfo: null,
  selectedYear: RECENT_YEAR,
  availableYears: generateAvailableYears(),

  setUsername: (username: string) => {
    set({ username });
  },

  setSelectedStyle: (style: StyleId) => {
    set({ selectedStyle: style });
  },

  setExportResolution: (resolution: 'hd' | 'fullhd' | 'print') => {
    set({ exportResolution: resolution });
  },

  setSelectedYear: (year: number) => {
    set({ selectedYear: year });
  },

  initAvailableYears: () => {
    set({ availableYears: generateAvailableYears() });
  },

  fetchData: async (username: string, year?: number, token?: string) => {
    const trimmedUsername = username.trim();
    const targetYear = year ?? get().selectedYear;

    if (!trimmedUsername) {
      set({
        errorMessage: '请输入 GitHub 用户名',
        loadingStatus: 'error',
      });
      return;
    }

    if (!validateUsername(trimmedUsername)) {
      set({
        errorMessage: '用户名格式不正确，请检查后重试',
        loadingStatus: 'error',
      });
      return;
    }

    set({
      loadingStatus: 'loading',
      errorMessage: null,
      username: trimmedUsername,
      selectedYear: targetYear,
    });

    try {
      const { data, rateLimit } = await fetchContributions(
        trimmedUsername,
        targetYear,
        token
      );

      const processedData = processGitHubData(data, targetYear);

      set({
        contributionData: processedData,
        loadingStatus: 'success',
        rateLimitInfo: rateLimit,
      });
    } catch (error) {
      let errorMessage = '获取数据失败，请稍后重试';
      let loadingStatus: LoadingStatus = 'error';

      if (error instanceof GitHubApiError) {
        errorMessage = error.message;
        if (error.rateLimit) {
          set({ rateLimitInfo: error.rateLimit });
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        errorMessage,
        loadingStatus,
        contributionData: null,
      });
    }
  },

  fetchYearData: async (year: number, token?: string) => {
    const { username } = get();

    if (!username) {
      set({
        errorMessage: '请先输入 GitHub 用户名',
        loadingStatus: 'error',
      });
      return;
    }

    set({
      loadingStatus: 'loading',
      errorMessage: null,
      selectedYear: year,
    });

    try {
      const { data, rateLimit } = await fetchContributions(
        username,
        year,
        token
      );

      const processedData = processGitHubData(data, year);

      set({
        contributionData: processedData,
        loadingStatus: 'success',
        rateLimitInfo: rateLimit,
      });
    } catch (error) {
      let errorMessage = '获取数据失败，请稍后重试';
      let loadingStatus: LoadingStatus = 'error';

      if (error instanceof GitHubApiError) {
        errorMessage = error.message;
        if (error.rateLimit) {
          set({ rateLimitInfo: error.rateLimit });
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        errorMessage,
        loadingStatus,
        contributionData: null,
      });
    }
  },

  clearData: () => {
    set({
      contributionData: null,
      loadingStatus: 'idle',
      errorMessage: null,
    });
  },

  setError: (message: string | null) => {
    set({ errorMessage: message });
  },

  setRateLimitInfo: (info: RateLimitInfo | null) => {
    set({ rateLimitInfo: info });
  },
}));
