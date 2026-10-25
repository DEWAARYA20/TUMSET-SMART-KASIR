'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { bottomNavItems } from '@/lib/navigation';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/80 pb-safe">
      <div className="flex items-center justify-around h-16 px-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-lg transition-colors duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-foreground'
              )}
            >
              <div className={cn(
                'flex items-center justify-center rounded-full transition-all duration-300',
                isActive ? 'bg-primary/10 w-12 h-7' : 'w-7 h-7'
              )}>
                <item.icon className={cn(
                  'transition-all duration-200',
                  isActive ? 'h-[18px] w-[18px]' : 'h-5 w-5'
                )} />
              </div>
              <span className={cn(
                'text-[10px] font-medium transition-all duration-200',
                isActive && 'font-semibold'
              )}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
