'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  type LucideIcon,
  LayoutDashboard,
  Package,
  PackageCheck,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  LogOut,
  Megaphone,
  ChevronRight,
  ChevronDown,
  Tags,
  Boxes,
  FileText,
  Image,
  Store,
  Languages,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Bảng điều khiển', href: '/admin' },
  { icon: Users, label: 'Tài khoản User', href: '/admin/customers' },
  { icon: Store, label: 'Quản lý Seller', href: '/admin/sellers' },
  { icon: FileText, label: 'Hồ sơ KYB', href: '/admin/kyb' },
  { 
    icon: Package, 
    label: 'Cấu hình chung', 
    children: [
      { label: 'Danh mục', href: '/admin/categories' },
      { label: 'Thương hiệu', href: '/admin/brands' },
      { label: 'Bộ sưu tập', href: '/admin/collections' },
    ]
  },
  { icon: FileText, label: 'Bài viết', href: '/admin/posts' },
  { icon: Megaphone, label: 'Chiến dịch', href: '/admin/campaigns' },
];

const settingsItems: MenuItem[] = [
  { icon: Settings, label: 'Cài đặt', href: '/admin/settings' },
  { icon: Languages, label: 'Tiếng Việt', href: '#' },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Sản phẩm']);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.href) {
      return pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
    }
    if (item.children) {
      return item.children.some(child => pathname === child.href || pathname.startsWith(child.href));
    }
    return false;
  };

  return (
    <Sidebar collapsible="icon" className="m-4 border border-sidebar-border bg-sidebar sticky top-4 h-[calc(100vh-1.0rem)] rounded-[0.5rem] overflow-hidden shadow-md" {...props}>
      {/* Header */}
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border group-data-[collapsible=icon]:px-2">
        <Link href="/admin" className="flex items-center justify-center">
          <span className="text-xl font-bold text-foreground group-data-[collapsible=icon]:hidden">
            Admin Portal
          </span>
        </Link>
      </SidebarHeader>

      {/* Main Menu */}
      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-1">
            General
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = isItemActive(item);
                const isExpanded = expandedItems.includes(item.label);
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <SidebarMenuItem key={item.label}>
                    {hasChildren ? (
                      <>
                        <SidebarMenuButton
                          onClick={() => toggleExpand(item.label)}
                          isActive={isActive}
                          className="justify-between group-data-[collapsible=icon]:!justify-center group"
                          tooltip={item.label}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5" aria-hidden="true" />
                            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                          </div>
                          <ChevronRight 
                            className="h-4 w-4 text-muted-foreground transition-transform group-data-[collapsible=icon]:hidden" 
                            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                          />
                        </SidebarMenuButton>
                        {isExpanded && (
                          <div className="ml-8 mt-1 space-y-1 group-data-[collapsible=icon]:hidden">
                             {item.children?.map((child) => (
                               <Link
                                 key={child.href}
                                 href={child.href}
                                 className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                   pathname === child.href || pathname.startsWith(child.href)
                                     ? 'bg-secondary text-secondary-foreground font-medium'
                                     : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                                 }`}
                               >
                                 {child.label}
                               </Link>
                             ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                        <Link href={item.href!}>
                          <item.icon className="h-5 w-5" aria-hidden="true" />
                          <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Group */}
        <SidebarGroup className="mt-4">
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <Link href={item.href!}>
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Info */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 px-1 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white dark:bg-white dark:text-black">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="font-medium text-foreground truncate text-sm">
              {user?.name || 'Admin User'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {user?.email || 'admin@example.com'}
            </div>
          </div>
          <button 
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground group-data-[collapsible=icon]:hidden"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
