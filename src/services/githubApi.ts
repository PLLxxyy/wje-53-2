import type { GitHubApiResponse, GitHubUser, RateLimitInfo } from '../types';

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';

interface CacheEntry {
  data: GitHubUser;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

const CONTRIBUTION_QUERY = `
  query($username: String!) {
    user(login: $username) {
      login
      name
      avatarUrl
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              weekday
            }
          }
        }
      }
    }
  }
`;

function getCacheKey(username: string): string {
  const today = new Date().toISOString().split('T')[0];
  return `${username}-${today}`;
}

export function getCachedContributions(username: string): GitHubUser | null {
  const key = getCacheKey(username);
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

export function setCachedContributions(username: string, data: GitHubUser): void {
  const key = getCacheKey(username);
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function parseRateLimitHeaders(headers: Headers): RateLimitInfo | null {
  const remaining = headers.get('x-ratelimit-remaining');
  const limit = headers.get('x-ratelimit-limit');
  const reset = headers.get('x-ratelimit-reset');

  if (remaining && limit && reset) {
    return {
      remaining: parseInt(remaining, 10),
      limit: parseInt(limit, 10),
      reset: parseInt(reset, 10),
    };
  }
  return null;
}

export class GitHubApiError extends Error {
  public readonly type: 'rate_limit' | 'not_found' | 'invalid' | 'unknown';
  public readonly rateLimit?: RateLimitInfo;

  constructor(
    message: string,
    type: 'rate_limit' | 'not_found' | 'invalid' | 'unknown',
    rateLimit?: RateLimitInfo
  ) {
    super(message);
    this.name = 'GitHubApiError';
    this.type = type;
    this.rateLimit = rateLimit;
  }
}

export async function fetchContributions(
  username: string,
  token?: string
): Promise<{ data: GitHubUser; rateLimit: RateLimitInfo | null }> {
  const cached = getCachedContributions(username);
  if (cached) {
    return { data: cached, rateLimit: null };
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `bearer ${token}`;
  }

  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: CONTRIBUTION_QUERY,
        variables: { username },
      }),
    });

    const rateLimit = parseRateLimitHeaders(response.headers);

    if (response.status === 403) {
      const resetTime = rateLimit?.reset
        ? new Date(rateLimit.reset * 1000).toLocaleTimeString()
        : '稍后';
      throw new GitHubApiError(
        `API 调用频率超限，请在 ${resetTime} 后重试。建议添加 GitHub Token 以获得更高的请求限额。`,
        'rate_limit',
        rateLimit
      );
    }

    if (response.status === 404) {
      throw new GitHubApiError(
        `未找到用户 "${username}"，请检查用户名是否正确。`,
        'not_found',
        rateLimit
      );
    }

    if (!response.ok) {
      throw new GitHubApiError(
        `请求失败 (${response.status})，请稍后重试。`,
        'unknown',
        rateLimit
      );
    }

    const result: GitHubApiResponse = await response.json();

    if (result.errors && result.errors.length > 0) {
      const errorMessage = result.errors[0].message;
      if (errorMessage.includes('Could not resolve to a User')) {
        throw new GitHubApiError(
          `未找到用户 "${username}"，请检查用户名是否正确。`,
          'not_found',
          rateLimit
        );
      }
      throw new GitHubApiError(errorMessage, 'invalid', rateLimit);
    }

    if (!result.data?.user) {
      throw new GitHubApiError(
        `未找到用户 "${username}"，请检查用户名是否正确。`,
        'not_found',
        rateLimit
      );
    }

    setCachedContributions(username, result.data.user);

    return {
      data: result.data.user,
      rateLimit,
    };
  } catch (error) {
    if (error instanceof GitHubApiError) {
      throw error;
    }
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new GitHubApiError(
        '网络连接失败，请检查网络连接后重试。',
        'unknown'
      );
    }
    throw new GitHubApiError(
      error instanceof Error ? error.message : '未知错误',
      'unknown'
    );
  }
}

export function formatResetTime(resetTimestamp: number): string {
  const now = Date.now() / 1000;
  const secondsLeft = Math.max(0, resetTimestamp - now);
  const minutes = Math.floor(secondsLeft / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours} 小时 ${minutes % 60} 分钟`;
  }
  if (minutes > 0) {
    return `${minutes} 分钟`;
  }
  return `${Math.floor(secondsLeft)} 秒`;
}

export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
  return usernameRegex.test(username);
}
