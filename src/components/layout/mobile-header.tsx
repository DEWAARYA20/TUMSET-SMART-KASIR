'use client';

import { Bell, Menu, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { mainNavItems, settingsNavItems } from '@/lib/navigation';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

export function MobileHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Get current page title
  const allItems = [...mainNavItems, ...settingsNavItems];
  const currentItem = allItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  );

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/80 pt-safe">
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="h-9 w-9 -ml-1">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="px-4 py-4 border-b">
              <SheetTitle className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Store className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">TUMSET</span>
                  <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                    Smart Kios
                  </span>
                </div>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground/70 hover:bg-accent'
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    {item.title}
                  </Link>
                );
              })}
              <Separator className="my-3" />
              {settingsNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground/70 hover:bg-accent'
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className="text-base font-semibold truncate">
          {currentItem?.title || 'TUMSET Smart Kios'}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
