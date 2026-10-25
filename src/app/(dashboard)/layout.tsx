import { AppSidebar } from '@/components/layout/app-sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { MobileHeader } from '@/components/layout/mobile-header';
import { SubscriptionGuard } from '@/components/subscription/subscription-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin pb-20 lg:pb-0">
          <SubscriptionGuard>
            {children}
          </SubscriptionGuard>
        </main>

        {/* Mobile Bottom Nav */}
        <BottomNav />
      </div>
    </div>
  );
}
