import { create } from 'zustand';
import type {
  AppState,
  ProcessedData,
  StyleId,
  RateLimitInfo,
  LoadingStatus,
} from '../types';
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
  fetchData: (username: string, token?: string) => Promise<void>;
  clearData: () => void;
  setError: (message: string | null) => void;
  setRateLimitInfo: (info: RateLimitInfo | null) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  username: '',
  loadingStatus: 'idle',
  contributionData: null,
  selectedStyle: 'scroll',
  exportResolution: 'fullhd',
  errorMessage: null,
  rateLimitInfo: null,

  setUsername: (username: string) => {
    set({ username });
  },

  setSelectedStyle: (style: StyleId) => {
    set({ selectedStyle: style });
  },

  setExportResolution: (resolution: 'hd' | 'fullhd' | 'print') => {
    set({ exportResolution: resolution });
  },

  fetchData: async (username: string, token?: string) => {
    const trimmedUsername = username.trim();

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
    });

    try {
      const { data, rateLimit } = await fetchContributions(
        trimmedUsername,
        token
      );

      const processedData = processGitHubData(data);

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
