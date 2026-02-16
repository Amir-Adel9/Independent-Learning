'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}

const SIDEBAR_COOKIE_NAME = 'sidebar:state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function getSidebarState(): boolean {
  if (typeof document === 'undefined') return true;
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`));
  return cookie ? cookie.split('=')[1] === 'true' : true;
}

function setSidebarState(open: boolean) {
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [breakpoint]);
  return isMobile;
}

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [open, setOpenState] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);

  React.useEffect(() => {
    setOpenState(getSidebarState());
  }, []);

  const setOpen = React.useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setOpenState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      if (typeof document !== 'undefined') setSidebarState(next);
      return next;
    });
  }, []);

  const value: SidebarContextValue = {
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

function Sidebar({
  className,
  side = 'left',
  variant = 'sidebar',
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating';
}) {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <>
        <div
          data-state={openMobile ? 'open' : 'closed'}
          className={cn(
            'fixed inset-0 z-50 bg-black/50 transition-opacity md:hidden',
            !openMobile && 'pointer-events-none opacity-0',
          )}
          aria-hidden
          onClick={() => setOpenMobile(false)}
        />
        <div
          data-side={side}
          data-variant={variant}
          data-state={openMobile ? 'open' : 'closed'}
          className={cn(
            'fixed inset-y-0 z-50 flex h-full w-[--sidebar-width] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-in-out md:relative md:translate-x-0',
            side === 'left' ? 'left-0' : 'right-0',
            isMobile && (openMobile ? 'translate-x-0' : (side === 'left' ? '-translate-x-full' : 'translate-x-full')),
            'md:data-[state=collapsed]:w-16',
            className,
          )}
          style={{ '--sidebar-width': '16rem' } as React.CSSProperties}
          {...props}
        />
      </>
    );
  }

  return (
    <div
      data-side={side}
      data-variant={variant}
      className={cn(
        'relative hidden h-full w-[--sidebar-width] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex',
        'md:data-[state=collapsed]:w-16',
        className,
      )}
      style={{ '--sidebar-width': '16rem' } as React.CSSProperties}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="content"
      className={cn('flex flex-1 flex-col gap-2 overflow-auto p-2', className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="footer"
      className={cn('mt-auto flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="group"
      className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="group-label"
      className={cn(
        'px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70',
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-sidebar="group-content"
      className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-sidebar="menu"
      className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  );
}

function SidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<'li'>) {
  return (
    <li
      data-sidebar="menu-item"
      className={cn('group relative', className)}
      {...props}
    />
  );
}

function SidebarMenuButton({
  className,
  isActive,
  ...props
}: React.ComponentProps<'button'> & {
  isActive?: boolean;
}) {
  return (
    <button
      type="button"
      data-sidebar="menu-button"
      data-active={isActive}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      data-sidebar="inset"
      className={cn(
        'relative flex min-h-screen min-w-0 flex-1 flex-col',
        className,
      )}
      {...props}
    />
  );
}

function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <button
      data-sidebar="trigger"
      aria-label="Toggle sidebar"
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-md border border-sidebar-border bg-sidebar hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        className,
      )}
      onClick={() => (isMobile ? setOpenMobile((p: boolean) => !p) : undefined)}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
