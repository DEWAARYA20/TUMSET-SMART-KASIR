'use client';

import { useEffect, useRef } from 'react';
import { sounds } from '@/lib/audio';

interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minChars?: number;
  maxIntervalMs?: number;
  enabled?: boolean;
}

/**
 * Hook to listen for USB/Bluetooth HID Barcode Scanners.
 * Hardware scanners output rapid keystrokes (< 50ms interval) terminated by an Enter key.
 */
export function useBarcodeScanner({
  onScan,
  minChars = 3,
  maxIntervalMs = 50,
  enabled = true,
}: UseBarcodeScannerOptions) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      // Don't intercept if user is typing inside an input/textarea unless it's an Enter key with buffered barcode
      const target = event.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      const currentTime = performance.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      if (event.key === 'Enter') {
        if (bufferRef.current.length >= minChars) {
          event.preventDefault();
          const scannedCode = bufferRef.current.trim();
          bufferRef.current = '';
          sounds.playBeep();
          onScan(scannedCode);
        } else {
          bufferRef.current = '';
        }
        return;
      }

      // Hardware scanners type each key with < 50ms interval.
      // If time interval is too large, reset buffer (user is typing manually).
      if (timeDiff > maxIntervalMs && bufferRef.current.length > 0) {
        bufferRef.current = '';
      }

      // Only capture printable ASCII characters
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // If user is focused on an input, only buffer if typing speed is superhuman (< maxIntervalMs)
        if (!isInput || timeDiff <= maxIntervalMs) {
          bufferRef.current += event.key;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onScan, minChars, maxIntervalMs, enabled]);
}
