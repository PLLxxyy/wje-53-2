import { useState, useRef } from 'react';
import { Search, Loader2, Sparkles, Calendar } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { generateMockData } from '../services/dataProcessor';

export function UsernameInput() {
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    loadingStatus,
    fetchData,
    setError,
    contributionData,
    clearData,
    selectedYear,
    availableYears,
    fetchYearData,
  } = useAppStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      fetchData(inputValue.trim());
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value, 10);
    if (contributionData) {
      fetchYearData(year);
    } else {
      useAppStore.setState({ selectedYear: year });
    }
  };

  const handleGenerateDemo = async () => {
    setIsGenerating(true);
    setError(null);

    setTimeout(() => {
      const mockData = generateMockData(selectedYear);
      useAppStore.setState({
        contributionData: mockData,
        loadingStatus: 'success',
        username: 'demo-user',
      });
      setIsGenerating(false);
    }, 800);
  };

  const handleClear = () => {
    setInputValue('');
    clearData();
    inputRef.current?.focus();
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入 GitHub 用户名，如 torvalds"
              className="w-full px-4 py-3 pl-11 pr-12 text-sm bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
              disabled={loadingStatus === 'loading' || isGenerating}
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            {inputValue && loadingStatus !== 'loading' && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ×
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={selectedYear}
              onChange={handleYearChange}
              disabled={loadingStatus === 'loading' || isGenerating}
              className="px-4 py-3 pl-10 pr-10 text-sm bg-zinc-900/50 border border-zinc-700 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!inputValue.trim() || loadingStatus === 'loading' || isGenerating}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
          >
            {loadingStatus === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>获取中...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>生成贡献图</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-zinc-800"></div>
        <span className="text-xs text-zinc-600">或者</span>
        <div className="flex-1 h-px bg-zinc-800"></div>
      </div>

      <button
        type="button"
        onClick={handleGenerateDemo}
        disabled={loadingStatus === 'loading' || isGenerating}
        className="w-full px-4 py-3 bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>生成演示数据中...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>使用演示数据预览</span>
          </>
        )}
      </button>

      {contributionData && (
        <button
          type="button"
          onClick={handleClear}
          className="w-full px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          重新输入
        </button>
      )}

      <p className="text-xs text-zinc-600 text-center">
        匿名 API 每小时限 60 次，建议添加 Token 以提高限额
      </p>
    </div>
  );
}
