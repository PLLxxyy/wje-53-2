import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getStyleConfig, getExportConfig, EXPORT_CONFIGS } from '../config/styles';
import { downloadImage, estimateFileSize, copyImageToClipboard } from '../services/exportService';
import { Download, Copy, Check, Loader2, FileImage } from 'lucide-react';

export function DownloadPanel() {
  const {
    contributionData,
    selectedStyle,
    exportResolution,
    setExportResolution,
    loadingStatus,
  } = useAppStore();

  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const isDisabled = loadingStatus !== 'success' || !contributionData;

  const handleDownload = async () => {
    if (!contributionData || isDisabled) return;

    setIsDownloading(true);
    try {
      const style = getStyleConfig(selectedStyle);
      const config = getExportConfig(exportResolution);
      await downloadImage(contributionData, style, config);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!contributionData || isDisabled) return;

    setIsCopying(true);
    try {
      const style = getStyleConfig(selectedStyle);
      const config = getExportConfig(exportResolution);
      const success = await copyImageToClipboard(contributionData, style, config);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Copy error:', error);
    } finally {
      setIsCopying(false);
    }
  };

  const estimatedSize = contributionData
    ? estimateFileSize(getExportConfig(exportResolution), contributionData)
    : '—';

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">导出设置</h3>
        <span className="text-xs text-zinc-600">高清长图</span>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-zinc-500">选择分辨率</label>
        <div className="grid grid-cols-3 gap-2">
          {(
            Object.entries(EXPORT_CONFIGS) as [
              'hd' | 'fullhd' | 'print',
              typeof EXPORT_CONFIGS[keyof typeof EXPORT_CONFIGS]
            ][]
          ).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => !isDisabled && setExportResolution(key)}
              disabled={isDisabled}
              className={`p-2 rounded-lg border-2 transition-all duration-200 text-left ${
                exportResolution === key
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600 disabled:opacity-50'
              }`}
            >
              <div className="text-xs font-medium text-zinc-300">
                {config.label}
              </div>
              <div className="text-[10px] text-zinc-500">
                {config.width}px 宽
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-2 bg-zinc-900/50 rounded-lg text-xs">
        <div className="flex items-center gap-2 text-zinc-500">
          <FileImage className="w-3.5 h-3.5" />
          <span>预估文件大小</span>
        </div>
        <span className="font-medium text-zinc-300">{estimatedSize}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleCopy}
          disabled={isDisabled || isCopying}
          className="px-4 py-3 bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isCopying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span>{copied ? '已复制' : '复制图片'}</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isDisabled || isDownloading}
          className="px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isDownloading ? '生成中...' : '下载图片'}</span>
        </button>
      </div>

      {isDisabled && (
        <p className="text-xs text-zinc-600 text-center">
          生成数据后即可下载
        </p>
      )}
    </div>
  );
}
