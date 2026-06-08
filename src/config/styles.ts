import type { StyleConfig, StyleId, ExportConfig } from '../types';

export const STYLES: Record<StyleId, StyleConfig> = {
  scroll: {
    id: 'scroll',
    name: '古籍卷轴',
    description: '宣纸墨色，古韵悠长',
    background: {
      color: '#f5e6c8',
      texture: 'paper',
    },
    cellColors: ['#e8d5a8', '#8b7355', '#5c4a32', '#3d2f1f', '#1a1208'],
    textColor: '#2d1f0f',
    accentColor: '#a02c2c',
    secondaryTextColor: '#6b5344',
    fontFamily: {
      title: '"Noto Serif SC", "SimSun", serif',
      body: '"Noto Serif SC", "SimSun", serif',
      numbers: '"JetBrains Mono", monospace',
    },
    decorations: {
      showScrollRod: true,
      showSeal: true,
    },
  },
  tape: {
    id: 'tape',
    name: '数据磁带',
    description: '赛博朋克，数据回响',
    background: {
      color: '#0a0a0a',
      texture: 'scanline',
    },
    cellColors: ['#1a1a1a', '#0f3d0f', '#1f7a1f', '#39ff14', '#7fff00'],
    textColor: '#39ff14',
    accentColor: '#ff0066',
    secondaryTextColor: '#00ff88',
    fontFamily: {
      title: '"JetBrains Mono", "Courier New", monospace',
      body: '"JetBrains Mono", "Courier New", monospace',
      numbers: '"JetBrains Mono", monospace',
    },
    decorations: {
      showBinaryBorder: true,
      showGlow: true,
    },
  },
  rainbow: {
    id: 'rainbow',
    name: '彩虹编码',
    description: '七彩光谱，活力四射',
    background: {
      color: '#0d0d1a',
      texture: 'noise',
    },
    cellColors: ['#1a1a2e', '#9d4edd', '#c77dff', '#ff6b6b', '#ffd93d', '#6bcf7f', '#4dabf7'],
    textColor: '#ffffff',
    accentColor: '#ff6b9d',
    secondaryTextColor: '#a0a0c0',
    fontFamily: {
      title: '"Inter", system-ui, sans-serif',
      body: '"Inter", system-ui, sans-serif',
      numbers: '"JetBrains Mono", monospace',
    },
    decorations: {
      showGlow: true,
    },
  },
  minimal: {
    id: 'minimal',
    name: '极简黑白',
    description: '大道至简，数据为尊',
    background: {
      color: '#ffffff',
      texture: null,
    },
    cellColors: ['#f0f0f0', '#c0c0c0', '#808080', '#404040', '#0a0a0a'],
    textColor: '#0a0a0a',
    accentColor: '#0a0a0a',
    secondaryTextColor: '#666666',
    fontFamily: {
      title: '"Inter", system-ui, sans-serif',
      body: '"Inter", system-ui, sans-serif',
      numbers: '"JetBrains Mono", monospace',
    },
    decorations: {},
  },
};

export const EXPORT_CONFIGS: Record<'hd' | 'fullhd' | 'print', ExportConfig> = {
  hd: {
    width: 1200,
    cellSize: 14,
    cellGap: 3,
    padding: { top: 120, right: 80, bottom: 120, left: 80 },
    dpi: 72,
    label: '高清 (1200px)',
  },
  fullhd: {
    width: 1920,
    cellSize: 22,
    cellGap: 4,
    padding: { top: 160, right: 120, bottom: 160, left: 120 },
    dpi: 96,
    label: '全高清 (1920px)',
  },
  print: {
    width: 2400,
    cellSize: 28,
    cellGap: 6,
    padding: { top: 200, right: 150, bottom: 200, left: 150 },
    dpi: 300,
    label: '打印级 (2400px)',
  },
};

export const STYLE_ORDER: StyleId[] = ['scroll', 'tape', 'rainbow', 'minimal'];

export function getStyleConfig(styleId: StyleId): StyleConfig {
  return STYLES[styleId];
}

export function getExportConfig(resolution: 'hd' | 'fullhd' | 'print'): ExportConfig {
  return EXPORT_CONFIGS[resolution];
}
