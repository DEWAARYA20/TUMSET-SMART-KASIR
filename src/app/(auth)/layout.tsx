import { Store, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Top Bar - Di Kiri Ujung */}
      <header className="px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between w-full border-b border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <Store className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-xl text-foreground">TUMSET</span>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-primary text-primary-foreground flex items-center gap-1 shadow-sm">
                <Sparkles className="h-3 w-3" /> AI
              </span>
            </div>
            <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
              SMART CASHIER POS
            </span>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {/* Main Form Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-xs text-muted-foreground">
        <p>© 2026 TUMSET Smart Kios — POS & Business Intelligence. Timezone Asia/Makassar (WITA).</p>
      </footer>
    </div>
  );
}
