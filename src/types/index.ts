export interface ContributionDay {
  date: string;
  contributionCount: number;
  weekday: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface GitHubUser {
  login: string;
  name: string | null;
  avatarUrl: string;
  contributionsCollection: {
    contributionCalendar: ContributionCalendar;
  };
}

export interface GitHubApiResponse {
  data: {
    user: GitHubUser;
  };
  errors?: Array<{ message: string }>;
}

export interface DayData {
  date: string;
  count: number;
  level: number;
  isMaxContribution: boolean;
  inLongestStreak: boolean;
}

export interface Statistics {
  totalContributions: number;
  longestStreak: number;
  longestStreakStart: string;
  longestStreakEnd: string;
  currentStreak: number;
  mostActiveMonth: string;
  mostActiveMonthCount: number;
  maxContributions: number;
  maxContributionsDate: string;
}

export interface ProcessedData {
  days: DayData[];
  stats: Statistics;
  username: string;
  displayName: string;
  totalContributions: number;
}

export type StyleId = 'scroll' | 'tape' | 'rainbow' | 'minimal';

export interface StyleConfig {
  id: StyleId;
  name: string;
  description: string;
  background: {
    color: string;
    texture?: 'paper' | 'noise' | 'scanline' | null;
  };
  cellColors: string[];
  textColor: string;
  accentColor: string;
  secondaryTextColor: string;
  fontFamily: {
    title: string;
    body: string;
    numbers: string;
  };
  decorations: {
    showScrollRod?: boolean;
    showBinaryBorder?: boolean;
    showGlow?: boolean;
    showSeal?: boolean;
  };
}

export interface ExportConfig {
  width: number;
  cellSize: number;
  cellGap: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  dpi: number;
  label: string;
}

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: number;
}

export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AppState {
  username: string;
  loadingStatus: LoadingStatus;
  contributionData: ProcessedData | null;
  selectedStyle: StyleId;
  exportResolution: 'hd' | 'fullhd' | 'print';
  errorMessage: string | null;
  rateLimitInfo: RateLimitInfo | null;
}
