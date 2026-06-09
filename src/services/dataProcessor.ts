import type {
  GitHubUser,
  DayData,
  Statistics,
  ProcessedData,
  ContributionDay,
} from '../types';

interface StreakResult {
  longestStreak: number;
  longestStreakStart: string;
  longestStreakEnd: string;
  currentStreak: number;
  longestStreakDates: Set<string>;
}

function flattenContributionDays(user: GitHubUser): ContributionDay[] {
  const days: ContributionDay[] = [];
  const calendar = user.contributionsCollection.contributionCalendar;

  for (const week of calendar.weeks) {
    for (const day of week.contributionDays) {
      days.push(day);
    }
  }

  return days.sort((a, b) => (a.date < b.date ? -1 : 1));
}

function calculateContributionLevel(count: number, maxCount: number): number {
  if (count === 0) return 0;
  if (maxCount === 0) return 0;

  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function calculateStreaks(days: ContributionDay[]): StreakResult {
  let longestStreak = 0;
  let longestStreakStart = '';
  let longestStreakEnd = '';
  let currentStreak = 0;
  let tempStart = '';
  const longestStreakDates = new Set<string>();
  const tempStreakDates: string[] = [];

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    if (day.contributionCount > 0) {
      if (currentStreak === 0) {
        tempStart = day.date;
        tempStreakDates.length = 0;
      }
      currentStreak++;
      tempStreakDates.push(day.date);

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        longestStreakStart = tempStart;
        longestStreakEnd = day.date;
        longestStreakDates.clear();
        tempStreakDates.forEach((d) => longestStreakDates.add(d));
      }
    } else {
      currentStreak = 0;
    }
  }

  currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    longestStreak,
    longestStreakStart,
    longestStreakEnd,
    currentStreak,
    longestStreakDates,
  };
}

interface MonthData {
  month: string;
  count: number;
}

function calculateMostActiveMonth(days: ContributionDay[]): {
  mostActiveMonth: string;
  mostActiveMonthCount: number;
} {
  const monthMap = new Map<string, number>();

  for (const day of days) {
    const month = day.date.substring(0, 7);
    const current = monthMap.get(month) || 0;
    monthMap.set(month, current + day.contributionCount);
  }

  const months: MonthData[] = Array.from(monthMap.entries()).map(
    ([month, count]) => ({ month, count })
  );

  months.sort((a, b) => b.count - a.count);

  if (months.length > 0) {
    return {
      mostActiveMonth: months[0].month,
      mostActiveMonthCount: months[0].count,
    };
  }

  return {
    mostActiveMonth: '',
    mostActiveMonthCount: 0,
  };
}

function findMaxContributionDay(
  days: ContributionDay[]
): { maxContributions: number; maxContributionsDate: string } {
  let maxCount = 0;
  let maxDate = '';

  for (const day of days) {
    if (day.contributionCount > maxCount) {
      maxCount = day.contributionCount;
      maxDate = day.date;
    }
  }

  return {
    maxContributions: maxCount,
    maxContributionsDate: maxDate,
  };
}

export function processGitHubData(user: GitHubUser, year: number): ProcessedData {
  const allDays = flattenContributionDays(user);
  const calendar = user.contributionsCollection.contributionCalendar;

  const yearDays = allDays.filter((day) => day.date.startsWith(`${year}-`));

  const {
    longestStreak,
    longestStreakStart,
    longestStreakEnd,
    currentStreak,
    longestStreakDates,
  } = calculateStreaks(yearDays);

  const { mostActiveMonth, mostActiveMonthCount } =
    calculateMostActiveMonth(yearDays);

  const { maxContributions, maxContributionsDate } =
    findMaxContributionDay(yearDays);

  const days: DayData[] = yearDays.map((day) => ({
    date: day.date,
    count: day.contributionCount,
    level: calculateContributionLevel(day.contributionCount, maxContributions),
    isMaxContribution: day.date === maxContributionsDate,
    inLongestStreak: longestStreakDates.has(day.date),
  }));

  const stats: Statistics = {
    totalContributions: calendar.totalContributions,
    longestStreak,
    longestStreakStart,
    longestStreakEnd,
    currentStreak,
    mostActiveMonth,
    mostActiveMonthCount,
    maxContributions,
    maxContributionsDate,
  };

  const dateRange = {
    start: days.length > 0 ? days[0].date : `${year}-01-01`,
    end: days.length > 0 ? days[days.length - 1].date : `${year}-12-31`,
  };

  return {
    days,
    stats,
    username: user.login,
    displayName: user.name || user.login,
    totalContributions: calendar.totalContributions,
    year,
    dateRange,
  };
}

export function formatMonthDisplay(monthStr: string): string {
  if (!monthStr) return 'N/A';
  const [year, month] = monthStr.split('-');
  const monthNames = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ];
  return `${year} 年 ${monthNames[parseInt(month, 10) - 1]}`;
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

export function getWeekdayName(weekday: number): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[weekday];
}

export function generateMockData(year?: number): ProcessedData {
  const targetYear = year ?? new Date().getFullYear();
  const days: DayData[] = [];

  const startDate = new Date(targetYear, 0, 1);
  const endDate = new Date(targetYear, 11, 31);

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];

    const random = Math.random();
    let count = 0;
    if (random > 0.3) {
      count = Math.floor(Math.random() * 15) + 1;
    }

    days.push({
      date: dateStr,
      count,
      level: 0,
      isMaxContribution: false,
      inLongestStreak: false,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  let maxCount = 0;
  let maxIndex = 0;
  days.forEach((day, idx) => {
    if (day.count > maxCount) {
      maxCount = day.count;
      maxIndex = idx;
    }
  });

  let longestStreak = 0;
  let currentStreak = 0;
  let longestStart = 0;
  let longestEnd = 0;
  let tempStart = 0;

  days.forEach((day, idx) => {
    if (day.count > 0) {
      if (currentStreak === 0) tempStart = idx;
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        longestStart = tempStart;
        longestEnd = idx;
      }
    } else {
      currentStreak = 0;
    }
  });

  days.forEach((day, idx) => {
    day.level = calculateContributionLevel(day.count, maxCount);
    day.isMaxContribution = idx === maxIndex;
    day.inLongestStreak = idx >= longestStart && idx <= longestEnd;
  });

  const monthCounts = new Map<string, number>();
  days.forEach((day) => {
    const month = day.date.substring(0, 7);
    monthCounts.set(month, (monthCounts.get(month) || 0) + day.count);
  });

  let mostActiveMonth = '';
  let mostActiveCount = 0;
  monthCounts.forEach((count, month) => {
    if (count > mostActiveCount) {
      mostActiveCount = count;
      mostActiveMonth = month;
    }
  });

  currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  const dateRange = {
    start: days.length > 0 ? days[0].date : `${targetYear}-01-01`,
    end: days.length > 0 ? days[days.length - 1].date : `${targetYear}-12-31`,
  };

  return {
    days,
    stats: {
      totalContributions: days.reduce((sum, d) => sum + d.count, 0),
      longestStreak,
      longestStreakStart: days[longestStart]?.date || '',
      longestStreakEnd: days[longestEnd]?.date || '',
      currentStreak,
      mostActiveMonth,
      mostActiveMonthCount: mostActiveCount,
      maxContributions: maxCount,
      maxContributionsDate: days[maxIndex]?.date || '',
    },
    username: 'demo-user',
    displayName: '演示用户',
    totalContributions: days.reduce((sum, d) => sum + d.count, 0),
    year: targetYear,
    dateRange,
  };
}
