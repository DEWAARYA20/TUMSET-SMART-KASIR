/**
 * TUMSET SMART KIOS - Internal Barcode Generator
 * Generates Code 128 barcode SVG for retail products without factory barcodes
 */

// Code 128 subset B character patterns
const CODE128_B: Record<string, string> = {
  ' ': '212222', '!': '222122', '"': '222221', '#': '121223', '$': '121322',
  '%': '131222', '&': '122213', '\'': '122312', '(': '132212', ')': '221213',
  '*': '221312', '+': '231212', ',': '112232', '-': '122132', '.': '122231',
  '/': '113222', '0': '123122', '1': '123221', '2': '223211', '3': '221132',
  '4': '221231', '5': '213212', '6': '223112', '7': '312131', '8': '311222',
  '9': '321122', ':': '321221', ';': '312212', '<': '322112', '=': '322211',
  '>': '212123', '?': '212321', '@': '232121', 'A': '111323', 'B': '131123',
  'C': '131321', 'D': '112313', 'E': '132113', 'F': '132311', 'G': '211313',
  'H': '231113', 'I': '231311', 'J': '112133', 'K': '112331', 'L': '132131',
  'M': '113123', 'N': '113321', 'O': '133121', 'P': '313121', 'Q': '211331',
  'R': '231131', 'S': '213113', 'T': '213311', 'U': '213131', 'V': '311123',
  'W': '311321', 'X': '331121', 'Y': '312113', 'Z': '312311',
  'a': '112214', 'b': '112412', 'c': '122114', 'd': '122411', 'e': '142112',
  'f': '142211', 'g': '241211', 'h': '221114', 'i': '413111', 'j': '241112',
  'k': '134111', 'l': '111242', 'm': '121142', 'n': '121241', 'o': '114212',
  'p': '124112', 'q': '124211', 'r': '411212', 's': '421112', 't': '421211',
  'u': '212141', 'v': '214121', 'w': '412121', 'x': '111143', 'y': '111341',
  'z': '131141', '{': '114113', '|': '114311', '}': '411113', '~': '411311',
};

const START_B = '211214';
const STOP = '2331112';

/**
 * Generate an SVG string representation of a Code 128 barcode
 */
export function generateBarcodeSvg(
  text: string,
  options?: { width?: number; height?: number; showText?: boolean }
): string {
  const width = options?.width || 240;
  const height = options?.height || 80;
  const showText = options?.showText ?? true;

  const sanitized = text.toUpperCase().replace(/[^0-9A-Z -_.]/g, '');
  if (!sanitized) return '';

  // Encode string into pattern of bar widths
  let pattern = START_B;
  for (const char of sanitized) {
    pattern += CODE128_B[char] || CODE128_B[' '];
  }
  pattern += STOP;

  // Render SVG bars
  let totalUnits = 0;
  for (let i = 0; i < pattern.length; i++) {
    totalUnits += parseInt(pattern[i], 10);
  }

  const unitWidth = width / (totalUnits + 10);
  let currentX = 5 * unitWidth;
  const barHeight = showText ? height - 22 : height;
  let rects = '';

  for (let i = 0; i < pattern.length; i++) {
    const barUnits = parseInt(pattern[i], 10);
    const barWidth = barUnits * unitWidth;
    const isBar = i % 2 === 0;

    if (isBar) {
      rects += `<rect x="${currentX.toFixed(2)}" y="5" width="${barWidth.toFixed(2)}" height="${barHeight}" fill="currentColor" />`;
    }
    currentX += barWidth;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="select-none">
      ${rects}
      ${
        showText
          ? `<text x="${width / 2}" y="${height - 4}" text-anchor="middle" font-family="monospace" font-size="12" font-weight="600" fill="currentColor">${sanitized}</text>`
          : ''
      }
    </svg>
  `.trim();
}

/**
 * Generate a unique internal SKU / barcode for kiosk repacked items
 */
export function generateInternalBarcode(prefix = 'KIOS'): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${timestamp}${random}`;
}
