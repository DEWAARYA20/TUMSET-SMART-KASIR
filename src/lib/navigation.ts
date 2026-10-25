import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ScanBarcode,
  Receipt,
  TrendingDown,
  BarChart3,
  Truck,
  Bot,
  Bell,
  Users,
  Settings,
  RotateCcw,
  BookOpen,
  Crown,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavItem[];
}

export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Kasir',
    href: '/pos',
    icon: ShoppingCart,
  },
  {
    title: 'Scan Barcode',
    href: '/scan',
    icon: ScanBarcode,
  },
  {
    title: 'Produk',
    href: '/products',
    icon: Package,
  },
  {
    title: 'Transaksi',
    href: '/transactions',
    icon: Receipt,
  },
  {
    title: 'Kas Bon',
    href: '/debts',
    icon: BookOpen,
  },
  {
    title: 'Retur',
    href: '/returns',
    icon: RotateCcw,
  },
  {
    title: 'Pengeluaran',
    href: '/expenses',
    icon: TrendingDown,
  },
  {
    title: 'Pemasok',
    href: '/suppliers',
    icon: Truck,
  },
  {
    title: 'Laporan',
    href: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Kios AI',
    href: '/ai',
    icon: Bot,
  },
];

export const bottomNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Kasir',
    href: '/pos',
    icon: ShoppingCart,
  },
  {
    title: 'Scan',
    href: '/scan',
    icon: ScanBarcode,
  },
  {
    title: 'Produk',
    href: '/products',
    icon: Package,
  },
  {
    title: 'Lainnya',
    href: '/more',
    icon: Settings,
  },
];

export const settingsNavItems: NavItem[] = [
  {
    title: 'Langganan',
    href: '/billing/subscription',
    icon: Crown,
  },
  {
    title: 'Verifikasi Bayar',
    href: '/billing/admin',
    icon: ShieldCheck,
  },
  {
    title: 'Notifikasi',
    href: '/notifications',
    icon: Bell,
  },
  {
    title: 'Pengguna',
    href: '/users',
    icon: Users,
  },
  {
    title: 'Pengaturan',
    href: '/settings',
    icon: Settings,
  },
];
