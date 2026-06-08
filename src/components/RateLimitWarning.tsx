import { useAppStore } from '../store/useAppStore';
import { formatResetTime } from '../services/githubApi';
import { AlertTriangle, Clock, Info } from 'lucide-react';

export function RateLimitWarning() {
  const { rateLimitInfo, errorMessage, loadingStatus } = useAppStore();

  if (!rateLimitInfo) return null;

  const { remaining, limit, reset } = rateLimitInfo;
  const isLow = remaining < 10;
  const isCritical = remaining < 3;
  const isRateLimitError =
    loadingStatus === 'error' && errorMessage?.includes('频率超限');

  if (!isLow && !isRateLimitError) return null;

  return (
    <div
      className={`w-full p-3 rounded-lg border ${
        isCritical || isRateLimitError
          ? 'bg-red-950/30 border-red-800/50'
          : 'bg-amber-950/30 border-amber-800/50'
      }`}
    >
      <div className="flex items-start gap-2">
        {isCritical || isRateLimitError ? (
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
        ) : (
          <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1 text-xs">
          <div
            className={`font-medium mb-1 ${
              isCritical || isRateLimitError ? 'text-red-400' : 'text-amber-400'
            }`}
          >
            {isRateLimitError
              ? 'API 调用频率超限'
              : isCritical
              ? 'API 调用次数即将用完'
              : 'API 调用次数不足'}
          </div>
          <div className="text-zinc-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>剩余次数</span>
              <span className={isCritical ? 'text-red-400 font-medium' : ''}>
                {remaining} / {limit}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>重置时间</span>
              <span>{formatResetTime(reset)} 后</span>
            </div>
            {isRateLimitError && (
              <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-red-900/30">
                <Info className="w-3.5 h-3.5 text-zinc-500 mt-0.5 flex-shrink-0" />
                <span className="text-zinc-500">
                  匿名用户每小时限 60 次请求。如需更高限额，
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500 hover:text-amber-400 underline"
                  >
                    创建 GitHub Token
                  </a>{' '}
                  可提升至每小时 5000 次。
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
