import { useAppStore } from '../store/useAppStore';
import { formatMonthDisplay, formatDateDisplay } from '../services/dataProcessor';
import { Flame, Calendar, BarChart3, Trophy } from 'lucide-react';

export function StatsPanel() {
  const { contributionData, loadingStatus } = useAppStore();

  if (loadingStatus !== 'success' || !contributionData) {
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-300">数据统计</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-zinc-900/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const { stats } = contributionData;

  const statItems = [
    {
      label: '总提交',
      value: stats.totalContributions.toLocaleString(),
      unit: '次',
      icon: <BarChart3 className="w-4 h-4" />,
      color: 'text-blue-400',
    },
    {
      label: '最长连续',
      value: stats.longestStreak.toString(),
      unit: '天',
      icon: <Flame className="w-4 h-4" />,
      color: 'text-orange-400',
    },
    {
      label: '当前连续',
      value: stats.currentStreak.toString(),
      unit: '天',
      icon: <Flame className="w-4 h-4" />,
      color: 'text-green-400',
    },
  ];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">数据统计</h3>
        <span className="text-xs text-zinc-600">
          {contributionData.isRecentYear ? '最近一年' : `${contributionData.year} 年`}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {statItems.map((item, idx) => (
          <div
            key={idx}
            className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <div className={`mb-1 ${item.color}`}>{item.icon}</div>
            <div className="text-lg font-bold text-white">
              {item.value}
              <span className="text-xs font-normal text-zinc-500 ml-1">
                {item.unit}
              </span>
            </div>
            <div className="text-xs text-zinc-500">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-zinc-500">最活跃月份：</span>
          <span className="text-zinc-300 font-medium">
            {formatMonthDisplay(stats.mostActiveMonth)}
          </span>
          <span className="text-amber-500">
            ({stats.mostActiveMonthCount} 次)
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Trophy className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-zinc-500">最高产日：</span>
          <span className="text-zinc-300 font-medium">
            {formatDateDisplay(stats.maxContributionsDate)}
          </span>
          <span className="text-yellow-500">
            ({stats.maxContributions} 次)
          </span>
        </div>
        {stats.longestStreak > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-zinc-500">最长连续：</span>
            <span className="text-zinc-300 font-medium">
              {formatDateDisplay(stats.longestStreakStart)} ~{' '}
              {formatDateDisplay(stats.longestStreakEnd)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
