'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react';

export function ServiceWorkerRegister() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // 1. Service Worker: Only in production; unregister in development to avoid stale caching
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[TUMSET PWA] Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[TUMSET PWA] Service Worker registration failed:', err);
          });
      } else {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
        if ('caches' in window) {
          caches.keys().then((names) => {
            for (const name of names) {
              caches.delete(name);
            }
          });
        }
      }
    }

    // 2. Network connectivity listeners
    function handleOnline() {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }

    function handleOffline() {
      setIsOffline(true);
      setShowReconnected(false);
    }

    // Initial check
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="fixed bottom-16 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 z-50 max-w-md bg-amber-500 text-black px-4 py-2.5 rounded-xl shadow-lg border border-amber-600 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="h-7 w-7 rounded-lg bg-black/10 flex items-center justify-center shrink-0">
            <WifiOff className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold">Mode Offline Aktif</p>
            <p className="text-[11px] opacity-90 leading-tight">
              Koneksi internet terputus. Kasir POS & inventaris tetap dapat digunakan normal di perangkat ini.
            </p>
          </div>
        </div>
      )}

      {/* Reconnected Toast */}
      {showReconnected && (
        <div className="fixed bottom-16 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 z-50 max-w-md bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg border border-emerald-700 flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Kembali Online</p>
            <p className="text-[11px] opacity-90">
              Koneksi internet Anda telah tersambung kembali.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
