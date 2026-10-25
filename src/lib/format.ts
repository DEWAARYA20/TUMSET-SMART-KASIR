// Utility functions for the app

/**
 * Format number to Indonesian Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const formatCurrency = formatRupiah;

/**
 * Format number with Indonesian locale
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Format date to Indonesian locale with Asia/Makassar timezone
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Makassar',
    ...options,
  });
}

/**
 * Format datetime to Indonesian locale with Asia/Makassar timezone
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format time to Indonesian locale with Asia/Makassar timezone
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Makassar',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generate a unique transaction number
 * Format: TRX-YYYYMMDD-XXXX
 */
export function generateTransactionNumber(prefix: string = 'TRX'): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${date}-${random}`;
}

/**
 * Parse Rupiah input string to number
 */
export function parseRupiah(value: string): number {
  return parseInt(value.replace(/[^0-9-]/g, ''), 10) || 0;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
}

/**
 * Truncate text
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Get greeting based on current time in Asia/Makassar
 */
export function getGreeting(): string {
  const now = new Date();
  const hour = parseInt(
    now.toLocaleString('id-ID', { timeZone: 'Asia/Makassar', hour: '2-digit', hour12: false }),
    10
  );
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}
