import { useNavigate, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, FolderTree, Users, LogOut } from 'lucide-react';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/api/hooks/use-logout';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/categories', label: 'Categories', icon: FolderTree },
  { to: '/admins', label: 'Admins', icon: Users },
] as const;

function isActivePath(pathname: string, to: string) {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(to + '/');
}

export function AppSidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = routerState.location.pathname;

  const displayName = user?.name ?? user?.email ?? 'Guest';
  const email = user?.email ?? '';
  const initials =
    user?.name
      ?.split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('') ??
    email?.[0]?.toUpperCase() ??
    '?';

  function handleNavigate(to: string) {
    navigate({ to });
    if (isMobile) setOpenMobile(false);
  }

  function handleLogout() {
    logout.mutate();
    if (isMobile) setOpenMobile(false);
  }

  return (
    <Sidebar side='left' className='border-r border-sidebar-border'>
      <SidebarHeader className='border-b border-sidebar-border'>
        <div className='flex items-center gap-2 px-2 py-2'>
          <img
            src='/favicon.png'
            alt=''
            className='size-8 shrink-0 rounded-lg object-contain'
          />
          <div className='flex min-w-0 flex-1 flex-col'>
            <span className='truncate font-semibold text-sidebar-foreground'>
              Independent Learning
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    isActive={isActivePath(pathname, to)}
                    onClick={() => handleNavigate(to)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigate(to);
                      }
                    }}
                    className='cursor-pointer'
                  >
                    <Icon className='size-4' />
                    {label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className='border-t border-sidebar-border'>
        <div className='flex flex-col gap-2 p-2'>
          <div className='flex items-center gap-2 rounded-md px-2 py-2'>
            <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-medium'>
              {initials}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium text-sidebar-foreground'>
                {displayName}
              </p>
              {email && (
                <p className='truncate text-xs text-sidebar-foreground/80'>
                  {email}
                </p>
              )}
            </div>
          </div>
          <SidebarMenuButton
            onClick={() => handleLogout()}
            disabled={logout.isPending}
            className='cursor-pointer text-sidebar-foreground'
            aria-label='Log out'
          >
            <LogOut className='size-4' />
            Logout
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
