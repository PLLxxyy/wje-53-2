import type { ProcessedData, StyleConfig, ExportConfig } from '../types';
import { renderToCanvas } from './canvasRenderer';

export async function generateHighResImage(
  data: ProcessedData,
  style: StyleConfig,
  exportConfig: ExportConfig
): Promise<string> {
  const canvas = document.createElement('canvas');

  await renderToCanvas(canvas, data, style, exportConfig);

  return canvas.toDataURL('image/png', 1.0);
}

export async function downloadImage(
  data: ProcessedData,
  style: StyleConfig,
  exportConfig: ExportConfig
): Promise<void> {
  const dataUrl = await generateHighResImage(data, style, exportConfig);

  const link = document.createElement('a');
  const filename = `${data.username}-contribution-${style.id}-${Date.now()}.png`;

  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function generateBlob(
  data: ProcessedData,
  style: StyleConfig,
  exportConfig: ExportConfig
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  await renderToCanvas(canvas, data, style, exportConfig);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

export function estimateFileSize(
  exportConfig: ExportConfig,
  data: ProcessedData
): string {
  const layoutWeeks = Math.ceil(data.days.length / 7);
  const gridWidth = layoutWeeks * (exportConfig.cellSize + exportConfig.cellGap);
  const gridHeight = 7 * (exportConfig.cellSize + exportConfig.cellGap);
  const totalHeight =
    exportConfig.padding.top + 180 + gridHeight + 280 + exportConfig.padding.bottom;

  const pixels = exportConfig.width * totalHeight;
  const bytesPerPixel = 4;
  const estimatedBytes = pixels * bytesPerPixel * 0.3;

  if (estimatedBytes < 1024 * 1024) {
    return `${(estimatedBytes / 1024).toFixed(0)} KB`;
  }
  return `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function copyImageToClipboard(
  data: ProcessedData,
  style: StyleConfig,
  exportConfig: ExportConfig
): Promise<boolean> {
  try {
    const blob = await generateBlob(data, style, exportConfig);

    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
