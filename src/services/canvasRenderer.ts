import type {
  ProcessedData,
  StyleConfig,
  ExportConfig,
  DayData,
} from '../types';
import { formatDateDisplay, formatMonthDisplay } from './dataProcessor';

interface LayoutInfo {
  weeks: DayData[][];
  gridWidth: number;
  gridHeight: number;
  statsAreaHeight: number;
  headerHeight: number;
  totalHeight: number;
  cellSize: number;
  cellGap: number;
}

function generatePaperTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): CanvasPattern | null {
  const offscreen = document.createElement('canvas');
  offscreen.width = 200;
  offscreen.height = 200;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return null;

  const imageData = offCtx.createImageData(200, 200);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 20;
    data[i] = 245 + noise * 0.1;
    data[i + 1] = 230 + noise * 0.08;
    data[i + 2] = 200 + noise * 0.12;
    data[i + 3] = 255;
  }

  offCtx.putImageData(imageData, 0, 0);

  offCtx.globalAlpha = 0.03;
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 200;
    const y = Math.random() * 200;
    const size = Math.random() * 2 + 1;
    offCtx.fillStyle = '#8b7355';
    offCtx.beginPath();
    offCtx.arc(x, y, size, 0, Math.PI * 2);
    offCtx.fill();
  }

  return ctx.createPattern(offscreen, 'repeat');
}

function generateNoiseTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): CanvasPattern | null {
  const offscreen = document.createElement('canvas');
  offscreen.width = 100;
  offscreen.height = 100;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return null;

  const imageData = offCtx.createImageData(100, 100);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const value = Math.random() * 30;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 60;
  }

  offCtx.putImageData(imageData, 0, 0);
  return ctx.createPattern(offscreen, 'repeat');
}

function generateScanlineTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): CanvasPattern | null {
  const offscreen = document.createElement('canvas');
  offscreen.width = 1;
  offscreen.height = 4;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return null;

  offCtx.fillStyle = 'rgba(0, 255, 100, 0.03)';
  offCtx.fillRect(0, 0, 1, 1);
  offCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  offCtx.fillRect(0, 2, 1, 1);

  return ctx.createPattern(offscreen, 'repeat');
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  style: StyleConfig,
  width: number,
  height: number
): void {
  ctx.fillStyle = style.background.color;
  ctx.fillRect(0, 0, width, height);

  if (style.background.texture === 'paper') {
    const pattern = generatePaperTexture(ctx, width, height);
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (style.background.texture === 'noise') {
    const pattern = generateNoiseTexture(ctx, width, height);
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (style.background.texture === 'scanline') {
    const pattern = generateScanlineTexture(ctx, width, height);
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
  }
}

function calculateLayout(
  data: ProcessedData,
  exportConfig: ExportConfig
): LayoutInfo {
  const days = data.days;
  const weeks: DayData[][] = [];

  for (let i = 0; i < days.length; i += 7) {
    const week = days.slice(i, i + 7);
    weeks.push(week);
  }

  const { cellSize, cellGap, padding } = exportConfig;
  const gridWidth = weeks.length * (cellSize + cellGap) - cellGap;
  const gridHeight = 7 * (cellSize + cellGap) - cellGap;

  const statsAreaHeight = 200;
  const headerHeight = 180;

  const totalHeight =
    padding.top +
    headerHeight +
    gridHeight +
    statsAreaHeight +
    80 +
    padding.bottom;

  return {
    weeks,
    gridWidth,
    gridHeight,
    statsAreaHeight,
    headerHeight,
    totalHeight,
    cellSize,
    cellGap,
  };
}

function getCellColor(style: StyleConfig, day: DayData): string {
  if (day.count === 0) {
    return style.cellColors[0];
  }

  const level = Math.min(day.level, style.cellColors.length - 1);
  return style.cellColors[Math.max(1, level)];
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  day: DayData,
  style: StyleConfig,
  layout: LayoutInfo
): void {
  const { cellSize } = layout;
  const color = getCellColor(style, day);

  if (style.decorations.showGlow && day.count > 0) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
  }

  if (style.id === 'scroll') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, cellSize, cellSize, 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (day.count > 0) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.roundRect(x, y, cellSize, cellSize, 2);
      ctx.stroke();
    }
  } else if (style.id === 'tape') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, cellSize, cellSize);
    ctx.shadowBlur = 0;

    if (day.count > 0) {
      ctx.strokeStyle = 'rgba(0, 255, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
    }
  } else if (style.id === 'rainbow') {
    const gradient = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustColorBrightness(color, 20));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, cellSize, cellSize, 3);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, cellSize, cellSize, 1);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  if (day.isMaxContribution) {
    ctx.strokeStyle = style.accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - 2, y - 2, cellSize + 4, cellSize + 4, 3);
    ctx.stroke();

    const starX = x + cellSize;
    const starY = y;
    drawStar(ctx, starX, starY, cellSize * 0.4, style.accentColor);
  }
}

function adjustColorBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
): void {
  const spikes = 5;
  const outerRadius = size;
  const innerRadius = size * 0.5;

  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  layout: LayoutInfo,
  style: StyleConfig,
  padding: { top: number; right: number; bottom: number; left: number }
): void {
  const { weeks, cellSize, cellGap, headerHeight } = layout;
  const startX = padding.left;
  const startY = padding.top + headerHeight;

  weeks.forEach((week, weekIndex) => {
    week.forEach((day, dayIndex) => {
      const x = startX + weekIndex * (cellSize + cellGap);
      const y = startY + dayIndex * (cellSize + cellGap);
      drawCell(ctx, x, y, day, style, layout);
    });
  });

  const longestStreakRange = findLongestStreakRange(layout.weeks);
  if (longestStreakRange) {
    const { startWeek, startDay, endWeek, endDay } = longestStreakRange;
    const x1 = startX + startWeek * (cellSize + cellGap) - 4;
    const y1 = startY + startDay * (cellSize + cellGap) - 4;
    const x2 =
      startX + endWeek * (cellSize + cellGap) + cellSize + 4;
    const y2 = startY + endDay * (cellSize + cellGap) + cellSize + 4;

    ctx.strokeStyle = style.accentColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.roundRect(x1, y1, x2 - x1, y2 - y1, 6);
    ctx.stroke();
    ctx.setLineDash([]);

    const labelX = x1;
    const labelY = y1 - 12;
    ctx.fillStyle = style.accentColor;
    ctx.font = `bold ${cellSize * 0.8}px ${style.fontFamily.body}`;
    ctx.fillText('🔥 最长连续', labelX, labelY);
  }
}

function findLongestStreakRange(weeks: DayData[][]): {
  startWeek: number;
  startDay: number;
  endWeek: number;
  endDay: number;
} | null {
  let startWeek = -1;
  let startDay = -1;
  let endWeek = -1;
  let endDay = -1;
  let foundStart = false;

  for (let w = 0; w < weeks.length; w++) {
    for (let d = 0; d < weeks[w].length; d++) {
      if (weeks[w][d].inLongestStreak) {
        if (!foundStart) {
          startWeek = w;
          startDay = d;
          foundStart = true;
        }
        endWeek = w;
        endDay = d;
      }
    }
  }

  if (startWeek === -1) return null;
  return { startWeek, startDay, endWeek, endDay };
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  data: ProcessedData,
  style: StyleConfig,
  exportConfig: ExportConfig
): void {
  const { padding, width } = exportConfig;
  const centerX = width / 2;

  ctx.fillStyle = style.textColor;
  ctx.font = `bold ${exportConfig.cellSize * 2.5}px ${style.fontFamily.title}`;
  ctx.textAlign = 'center';
  const titleSuffix = data.isRecentYear ? '最近一年' : `${data.year} 年`;
  ctx.fillText(
    `${data.displayName} 的代码贡献纪年 · ${titleSuffix}`,
    centerX,
    padding.top + exportConfig.cellSize * 2
  );

  ctx.fillStyle = style.secondaryTextColor;
  ctx.font = `${exportConfig.cellSize * 1.2}px ${style.fontFamily.body}`;
  const dateRangeText = `${data.dateRange.start} ~ ${data.dateRange.end}`;
  ctx.fillText(`@${data.username} · ${dateRangeText}`, centerX, padding.top + exportConfig.cellSize * 4);
}

function drawStats(
  ctx: CanvasRenderingContext2D,
  data: ProcessedData,
  style: StyleConfig,
  layout: LayoutInfo,
  exportConfig: ExportConfig
): void {
  const { padding, width } = exportConfig;
  const { gridHeight, headerHeight } = layout;
  const startY = padding.top + headerHeight + gridHeight + 40;
  const cardWidth = (width - padding.left - padding.right - 40) / 3;
  const cardHeight = 160;

  const stats = [
    {
      label: '总提交数',
      value: data.stats.totalContributions.toLocaleString(),
      unit: '次',
      icon: '📊',
    },
    {
      label: '最长连续',
      value: data.stats.longestStreak.toString(),
      unit: '天',
      icon: '🔥',
    },
    {
      label: '最活跃月份',
      value: formatMonthDisplay(data.stats.mostActiveMonth),
      unit: `${data.stats.mostActiveMonthCount} 次`,
      icon: '📅',
    },
  ];

  stats.forEach((stat, index) => {
    const x = padding.left + index * (cardWidth + 20);
    const y = startY;

    if (style.id === 'scroll') {
      ctx.fillStyle = 'rgba(139, 115, 85, 0.1)';
      ctx.beginPath();
      ctx.roundRect(x, y, cardWidth, cardHeight, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(139, 115, 85, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (style.id === 'tape') {
      ctx.fillStyle = 'rgba(0, 255, 100, 0.05)';
      ctx.fillRect(x, y, cardWidth, cardHeight);
      ctx.strokeStyle = 'rgba(0, 255, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cardWidth, cardHeight);
    } else if (style.id === 'rainbow') {
      const gradient = ctx.createLinearGradient(x, y, x + cardWidth, y + cardHeight);
      gradient.addColorStop(0, 'rgba(157, 78, 221, 0.1)');
      gradient.addColorStop(0.5, 'rgba(255, 107, 107, 0.1)');
      gradient.addColorStop(1, 'rgba(77, 171, 247, 0.1)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, cardWidth, cardHeight, 12);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.beginPath();
      ctx.roundRect(x, y, cardWidth, cardHeight, 8);
      ctx.fill();
    }

    ctx.fillStyle = style.textColor;
    ctx.font = `${exportConfig.cellSize * 1.5}px ${style.fontFamily.numbers}`;
    ctx.textAlign = 'center';
    ctx.fillText(stat.icon, x + cardWidth / 2, y + 35);

    ctx.font = `bold ${exportConfig.cellSize * 2}px ${style.fontFamily.numbers}`;
    ctx.fillText(stat.value, x + cardWidth / 2, y + 75);

    ctx.fillStyle = style.secondaryTextColor;
    ctx.font = `${exportConfig.cellSize * 0.9}px ${style.fontFamily.body}`;
    ctx.fillText(stat.unit, x + cardWidth / 2, y + 100);

    ctx.font = `${exportConfig.cellSize * 0.8}px ${style.fontFamily.body}`;
    ctx.fillText(stat.label, x + cardWidth / 2, y + 130);
  });

  const maxContribY = startY + cardHeight + 40;
  ctx.fillStyle = style.accentColor;
  ctx.font = `bold ${exportConfig.cellSize * 1.1}px ${style.fontFamily.body}`;
  ctx.textAlign = 'left';
  ctx.fillText(
    `⭐ 最高产日：${formatDateDisplay(data.stats.maxContributionsDate)} · ${data.stats.maxContributions} 次提交`,
    padding.left,
    maxContribY
  );
}

function drawDecorations(
  ctx: CanvasRenderingContext2D,
  style: StyleConfig,
  layout: LayoutInfo,
  exportConfig: ExportConfig
): void {
  const { width, padding } = exportConfig;
  const { totalHeight } = layout;

  if (style.decorations.showScrollRod) {
    const rodRadius = 20;
    const rodY1 = padding.top / 2;
    const rodY2 = totalHeight - padding.bottom / 2;

    const gradient1 = ctx.createLinearGradient(0, rodY1 - rodRadius, 0, rodY1 + rodRadius);
    gradient1.addColorStop(0, '#8b6914');
    gradient1.addColorStop(0.5, '#d4a017');
    gradient1.addColorStop(1, '#8b6914');

    ctx.fillStyle = gradient1;
    ctx.beginPath();
    ctx.roundRect(padding.left - 30, rodY1 - rodRadius, width - padding.left - padding.right + 60, rodRadius * 2, rodRadius);
    ctx.fill();

    const gradient2 = ctx.createLinearGradient(0, rodY2 - rodRadius, 0, rodY2 + rodRadius);
    gradient2.addColorStop(0, '#8b6914');
    gradient2.addColorStop(0.5, '#d4a017');
    gradient2.addColorStop(1, '#8b6914');

    ctx.fillStyle = gradient2;
    ctx.beginPath();
    ctx.roundRect(padding.left - 30, rodY2 - rodRadius, width - padding.left - padding.right + 60, rodRadius * 2, rodRadius);
    ctx.fill();
  }

  if (style.decorations.showBinaryBorder) {
    ctx.fillStyle = style.textColor;
    ctx.font = `${exportConfig.cellSize * 0.6}px ${style.fontFamily.numbers}`;
    ctx.textAlign = 'left';

    const binaryChars = '01';
    let binaryText = '';
    for (let i = 0; i < 80; i++) {
      binaryText += binaryChars[Math.floor(Math.random() * 2)];
      if (i % 8 === 7) binaryText += ' ';
    }

    ctx.globalAlpha = 0.3;
    ctx.fillText(binaryText, padding.left, padding.top + layout.headerHeight - 20);
    ctx.fillText(binaryText, padding.left, totalHeight - padding.bottom + 20);
    ctx.globalAlpha = 1;
  }

  if (style.decorations.showSeal) {
    const sealX = width - padding.right - 60;
    const sealY = totalHeight - padding.bottom - 80;
    const sealSize = 80;

    ctx.save();
    ctx.rotate(-Math.PI / 12);

    ctx.fillStyle = style.accentColor;
    ctx.beginPath();
    ctx.roundRect(sealX, sealY, sealSize, sealSize, 4);
    ctx.fill();

    ctx.fillStyle = '#f5e6c8';
    ctx.font = `bold ${exportConfig.cellSize * 1.2}px ${style.fontFamily.title}`;
    ctx.textAlign = 'center';
    ctx.fillText('代码', sealX + sealSize / 2, sealY + sealSize / 2 - 8);
    ctx.fillText('纪年', sealX + sealSize / 2, sealY + sealSize / 2 + 20);

    ctx.restore();
  }
}

export async function renderToCanvas(
  canvas: HTMLCanvasElement,
  data: ProcessedData,
  style: StyleConfig,
  exportConfig: ExportConfig
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法获取 Canvas 上下文');

  const layout = calculateLayout(data, exportConfig);

  canvas.width = exportConfig.width;
  canvas.height = layout.totalHeight;

  drawBackground(ctx, style, exportConfig.width, layout.totalHeight);
  drawDecorations(ctx, style, layout, exportConfig);
  drawHeader(ctx, data, style, exportConfig);
  drawGrid(ctx, layout, style, exportConfig.padding);
  drawStats(ctx, data, style, layout, exportConfig);

  ctx.fillStyle = style.secondaryTextColor;
  ctx.font = `${exportConfig.cellSize * 0.7}px ${style.fontFamily.body}`;
  ctx.textAlign = 'center';
  ctx.globalAlpha = 0.6;
  ctx.fillText(
    `Generated by GitHub Contribution Art · ${new Date().toLocaleDateString()}`,
    exportConfig.width / 2,
    layout.totalHeight - exportConfig.padding.bottom / 2
  );
  ctx.globalAlpha = 1;
}

export function createPreviewCanvas(
  container: HTMLElement,
  data: ProcessedData,
  style: StyleConfig,
  exportConfig: ExportConfig
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, (container.clientWidth - 40) / exportConfig.width);

  const scaledConfig = {
    ...exportConfig,
    width: Math.floor(exportConfig.width * scale),
    cellSize: Math.floor(exportConfig.cellSize * scale),
    cellGap: Math.floor(exportConfig.cellGap * scale),
    padding: {
      top: Math.floor(exportConfig.padding.top * scale),
      right: Math.floor(exportConfig.padding.right * scale),
      bottom: Math.floor(exportConfig.padding.bottom * scale),
      left: Math.floor(exportConfig.padding.left * scale),
    },
  };

  renderToCanvas(canvas, data, style, scaledConfig).catch(console.error);
  return canvas;
}
