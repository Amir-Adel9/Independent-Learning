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
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/categories', label: 'Categories', icon: FolderTree },
  { to: '/admins', label: 'Admins', icon: Users },
] as const;

function isActivePath(pathname: string, to: string) {
  if (to === '/') return pathname === '/';
  const isParentOfAnotherRoute = navItems.some(
    (item) => item.to !== to && item.to.startsWith(to + '/'),
  );
  if (pathname === to) return true;
  if (isParentOfAnotherRoute) return pathname === to;
  return pathname.startsWith(to + '/');
}

export function AppSidebar() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
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
      .map((part: string) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('') ??
    email?.[0]?.toUpperCase() ??
    '?';

  function handleNavigate(to: string) {
    navigate({ to });
    if (isMobile) setOpenMobile(false);
  }

  function handleLogout() {
    if (isMobile) setOpenMobile(false);
    logout.mutate();
  }

  return (
    <Sidebar variant='floating' side='left'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              className='hover:bg-sidebar-accent/60 cursor-default'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary-foreground/15 text-sidebar-foreground font-bold text-sm'>
                I
              </div>
              <div className='flex flex-col gap-0.5 leading-none'>
                <span className='font-semibold text-sidebar-foreground'>
                  Independent Learning
                </span>
                <span className='text-sidebar-foreground/60 text-xs'>
                  Admin
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className='text-sidebar-foreground/50 uppercase tracking-wider text-[0.65rem] font-semibold'>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='gap-1'>
              {navItems.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    size='default'
                    className='cursor-pointer h-10'
                    isActive={isActivePath(pathname, to)}
                    onClick={() => handleNavigate(to)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigate(to);
                      }
                    }}
                  >
                    <Icon className='size-4 shrink-0' aria-hidden />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className='rounded-xl bg-sidebar-primary-foreground/10 p-3'>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-full bg-sidebar-primary-foreground/20 text-sidebar-foreground text-xs font-semibold'>
              {initials}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium text-sidebar-foreground'>
                {displayName}
              </p>
              {email && (
                <p
                  className='truncate text-xs text-sidebar-foreground/60'
                  title={email}
                >
                  {email}
                </p>
              )}
            </div>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className='cursor-pointer h-10'
              onClick={() => handleLogout()}
              disabled={logout.isPending}
              aria-label='Log out'
            >
              <LogOut className='size-4 shrink-0' aria-hidden />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
