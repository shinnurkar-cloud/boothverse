"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/app-provider';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Vote, Shield, Users, Building, LayoutDashboard, UserCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: string[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Super-Admin', 'Admin', 'Sub Admin', 'User'] },
  { href: '/dashboard/admins', label: 'Admins', icon: Shield, roles: ['Super-Admin'] },
  { href: '/dashboard/sub-admins', label: 'Sub Admins', icon: UserCheck, roles: ['Admin'] },
  { href: '/dashboard/users', label: 'Users', icon: Users, roles: ['Sub Admin'] },
  { href: '/dashboard/booths', label: 'Booths', icon: Building, roles: ['Sub Admin'] },
];

export function SidebarNav() {
  const { currentUser } = useApp();
  const pathname = usePathname();

  if (!currentUser) return null;

  const accessibleNavItems = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
          <Vote className="h-8 w-8 text-primary" />
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-lg font-semibold">BoothVerse</h2>
            <p className="text-sm text-muted-foreground">{currentUser.role}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {accessibleNavItems.map(item => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
