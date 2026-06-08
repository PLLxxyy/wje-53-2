import { useAppStore } from '../store/useAppStore';
import { STYLES, STYLE_ORDER } from '../config/styles';
import type { StyleId } from '../types';

interface StyleCardProps {
  styleId: StyleId;
  isSelected: boolean;
  onClick: () => void;
}

function StyleCard({ styleId, isSelected, onClick }: StyleCardProps) {
  const style = STYLES[styleId];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-3 rounded-lg border-2 transition-all duration-300 text-left hover:scale-[1.02] ${
        isSelected
          ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20'
          : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: style.background.color }}
        >
          {styleId === 'scroll' && '📜'}
          {styleId === 'tape' && '📼'}
          {styleId === 'rainbow' && '🌈'}
          {styleId === 'minimal' && '⬜'}
        </div>
        <div>
          <h3
            className="font-medium text-sm"
            style={{ color: style.textColor }}
          >
            {style.name}
          </h3>
          <p className="text-xs text-zinc-500">{style.description}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-1">
        {style.cellColors.slice(0, 5).map((color, idx) => (
          <div
            key={idx}
            className="w-full h-4 rounded"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
      )}
    </button>
  );
}

export function StyleSelector() {
  const { selectedStyle, setSelectedStyle, loadingStatus } = useAppStore();

  const isDisabled = loadingStatus !== 'success';

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">选择风格</h3>
        <span className="text-xs text-zinc-600">4 种艺术风格</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {STYLE_ORDER.map((styleId) => (
          <StyleCard
            key={styleId}
            styleId={styleId}
            isSelected={selectedStyle === styleId}
            onClick={() => !isDisabled && setSelectedStyle(styleId)}
          />
        ))}
      </div>

      {isDisabled && (
        <p className="text-xs text-zinc-600 text-center">
          生成数据后即可选择风格
        </p>
      )}
    </div>
  );
}
