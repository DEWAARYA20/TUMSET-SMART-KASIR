import { Store, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Top Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-lg">TUMSET</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> AI
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium -mt-0.5">Smart Cashier POS</p>
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
