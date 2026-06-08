import { Github, Sparkles } from 'lucide-react';
import {
  UsernameInput,
  StyleSelector,
  StatsPanel,
  PreviewCanvas,
  DownloadPanel,
  RateLimitWarning,
} from '../components';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900/50 to-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-400">用代码书写的艺术</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              GitHub 贡献纪年
            </span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            把 365 天的代码提交转化为精美的艺术长图，记录你的开源历程
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-[380px] flex-shrink-0 space-y-4">
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
                <Github className="w-5 h-5 text-zinc-400" />
                <h2 className="text-base font-semibold text-white">获取贡献数据</h2>
              </div>
              <UsernameInput />
              <RateLimitWarning />
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-5">
              <StyleSelector />
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-5">
              <StatsPanel />
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-5">
              <DownloadPanel />
            </div>
          </aside>

          <main className="flex-1 min-h-[600px] flex flex-col">
            <PreviewCanvas />
          </main>
        </div>

        <footer className="mt-12 pt-8 border-t border-zinc-800 text-center">
          <p className="text-sm text-zinc-500">
            数据来源：GitHub API · 支持四种艺术风格 · 可下载高清长图打印或分享
          </p>
          <p className="text-xs text-zinc-600 mt-2">
            Made with ❤️ for developers
          </p>
        </footer>
      </div>
    </div>
  );
}
