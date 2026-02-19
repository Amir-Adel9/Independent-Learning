import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useCategories } from '@/hooks/use-categories';
import { useAdmins } from '@/hooks/use-admins';
import {
  Users,
  FolderTree,
  Shield,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  ListTodo,
} from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
};

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();
  const {
    data: admins,
    isLoading: adminsLoading,
    isError: adminsError,
  } = useAdmins();

  const statsLoading = categoriesLoading || adminsLoading;
  const statsError = categoriesError && adminsError;

  const totalCategories = categories?.length ?? 0;
  const totalAdmins = admins?.length ?? 0;
  const activeAdmins = admins?.filter((a) => a.isActive).length ?? 0;
  const activeRate =
    totalAdmins > 0 ? Math.round((activeAdmins / totalAdmins) * 100) : 0;

  const firstName =
    user?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';

  const recentUsers = admins?.slice(0, 7) ?? [];

  return (
    <div className='flex w-full min-w-0 flex-1 flex-col gap-5 overflow-x-hidden'>
      {/* Top bar: greeting + actions */}
      <div className='flex min-w-0 items-center justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <h1 className='text-lg font-semibold tracking-tight truncate'>
            {getGreeting()}, {firstName}
          </h1>
          <p className='text-xs text-muted-foreground truncate'>
            Here&apos;s what&apos;s happening with your dashboard today.
          </p>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            asChild
            className='cursor-pointer hidden sm:inline-flex'
          >
            <Link to='/admins'>
              <Users className='mr-1.5 size-3.5' aria-hidden />
              All Users
            </Link>
          </Button>
          <Button size='sm' asChild className='cursor-pointer'>
            <Link to='/categories/create'>
              <PlusCircle className='mr-1.5 size-3.5' aria-hidden />
              New Category
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      {statsLoading ? (
        <div className='grid min-w-0 grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4'>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className='flex min-w-0 items-center gap-2 rounded-xl border bg-card px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3'
            >
              <Skeleton className='size-9 shrink-0 rounded-lg' />
              <div className='min-w-0 space-y-1.5'>
                <Skeleton className='h-3 w-14' />
                <Skeleton className='h-5 w-8' />
              </div>
            </div>
          ))}
        </div>
      ) : statsError ? (
        <div className='rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3'>
          <p className='text-sm text-destructive'>Failed to load statistics.</p>
        </div>
      ) : (
        <div className='grid min-w-0 grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4'>
          <div className='flex min-w-0 items-center gap-2 rounded-xl border bg-card px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3'>
            <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
              <Users className='size-4 text-primary' aria-hidden />
            </div>
            <div className='min-w-0'>
              <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate'>
                Total Users
              </p>
              <p className='text-xl font-bold tabular-nums leading-tight truncate'>
                {totalAdmins}
              </p>
            </div>
          </div>

          <div className='flex min-w-0 items-center gap-2 rounded-xl border bg-card px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3'>
            <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10'>
              <FolderTree
                className='size-4 text-emerald-600 dark:text-emerald-400'
                aria-hidden
              />
            </div>
            <div className='min-w-0'>
              <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate'>
                Categories
              </p>
              <p className='text-xl font-bold tabular-nums leading-tight truncate'>
                {totalCategories}
              </p>
            </div>
          </div>

          <div className='flex min-w-0 items-center gap-2 rounded-xl border bg-card px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3'>
            <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10'>
              <Shield
                className='size-4 text-amber-600 dark:text-amber-400'
                aria-hidden
              />
            </div>
            <div className='min-w-0'>
              <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate'>
                Admins
              </p>
              <p className='text-xl font-bold tabular-nums leading-tight truncate'>
                {totalAdmins}
              </p>
            </div>
          </div>

          <div className='flex min-w-0 items-center gap-2 rounded-xl border bg-card px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3'>
            <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10'>
              <TrendingUp
                className='size-4 text-violet-600 dark:text-violet-400'
                aria-hidden
              />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate'>
                Active
              </p>
              <div className='flex min-w-0 items-center gap-1.5 sm:gap-2'>
                <p className='text-xl font-bold tabular-nums leading-tight shrink-0'>
                  {activeRate}%
                </p>
                <div className='hidden h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted sm:block'>
                  <div
                    className='h-full rounded-full bg-violet-500 transition-all duration-500'
                    style={{ width: `${activeRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content: Recent Users + Sidebar */}
      <div className='grid min-w-0 gap-4 lg:grid-cols-3'>
        <div className='min-w-0 rounded-xl border bg-card lg:col-span-2'>
          <div className='flex min-w-0 items-center justify-between gap-2 border-b px-3 py-2 sm:px-4'>
            <h2 className='text-sm font-semibold truncate'>Recent Users</h2>
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='h-6 shrink-0 cursor-pointer px-2 text-xs'
            >
              <Link to='/admins'>
                View all <ArrowRight className='ml-1 size-3' aria-hidden />
              </Link>
            </Button>
          </div>

          <div>
            {adminsLoading ? (
              <div className='divide-y'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className='flex items-center gap-2.5 px-3 py-2'>
                    <Skeleton className='size-1.5 rounded-full' />
                    <Skeleton className='h-3.5 flex-1 max-w-48' />
                    <Skeleton className='h-4 w-14 rounded-full' />
                  </div>
                ))}
              </div>
            ) : adminsError ? (
              <div className='flex flex-col items-center justify-center py-8 px-4'>
                <p className='text-sm text-destructive'>Unable to load users</p>
                <Button
                  asChild
                  size='sm'
                  variant='outline'
                  className='mt-2 h-7 cursor-pointer text-xs'
                >
                  <Link to='/admins'>View admins instead</Link>
                </Button>
              </div>
            ) : !recentUsers.length ? (
              <div className='flex flex-col items-center justify-center py-8 px-4'>
                <Users
                  className='size-6 text-muted-foreground/40'
                  aria-hidden
                />
                <p className='mt-2 text-xs text-muted-foreground'>
                  No users yet
                </p>
                <Button
                  asChild
                  size='sm'
                  variant='outline'
                  className='mt-2 h-7 cursor-pointer text-xs'
                >
                  <Link to='/admins'>View admins</Link>
                </Button>
              </div>
            ) : (
              <div className='divide-y'>
                {recentUsers.map((u) => (
                  <div
                    key={u.id ?? u.email}
                    className='flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-muted/40'
                  >
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium leading-tight'>
                        {u.name ?? u.email}
                      </p>
                      {u.email && (
                        <p className='truncate text-xs text-muted-foreground'>
                          {u.email}
                        </p>
                      )}
                    </div>
                    {u.role && (
                      <Badge
                        variant='outline'
                        className='shrink-0 text-[10px] font-medium'
                      >
                        {roleLabels[u.role] ?? u.role}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='flex flex-col gap-4'>
          {admins && admins.length > 0 && (
            <div className='rounded-xl border bg-card p-4'>
              <p className='mb-3 text-sm font-semibold'>Admin Breakdown</p>
              <div className='space-y-2.5'>
                {[
                  {
                    label: 'Active',
                    count: activeAdmins,
                    pct: activeRate,
                    color: 'bg-emerald-500',
                    track: 'bg-emerald-500/15',
                  },
                  {
                    label: 'Inactive',
                    count: totalAdmins - activeAdmins,
                    pct: totalAdmins > 0 ? 100 - activeRate : 0,
                    color: 'bg-amber-500',
                    track: 'bg-amber-500/15',
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className='mb-1 flex items-center justify-between text-xs'>
                      <span className='text-muted-foreground'>
                        {item.label}
                      </span>
                      <span className='font-medium tabular-nums'>
                        {item.count}{' '}
                        <span className='text-muted-foreground'>
                          ({item.pct}%)
                        </span>
                      </span>
                    </div>
                    <div
                      className={cn(
                        'h-1.5 w-full overflow-hidden rounded-full',
                        item.track,
                      )}
                    >
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          item.color,
                        )}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='rounded-xl border bg-card p-4'>
            <p className='mb-3 text-sm font-semibold'>Quick Links</p>
            <nav className='space-y-1'>
              {[
                {
                  to: '/categories/create',
                  label: 'Create Category',
                  sub: 'Add new category',
                  icon: PlusCircle,
                  iconColor: 'text-primary',
                },
                {
                  to: '/categories',
                  label: 'Categories',
                  sub: 'Browse & manage',
                  icon: FolderTree,
                  iconColor: 'text-blue-600 dark:text-blue-400',
                },
                {
                  to: '/admins',
                  label: 'Admins',
                  sub: 'Users & roles',
                  icon: ListTodo,
                  iconColor: 'text-violet-600 dark:text-violet-400',
                },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className='flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/60'
                >
                  <item.icon
                    className={cn('size-4 shrink-0', item.iconColor)}
                    aria-hidden
                  />
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium leading-tight'>
                      {item.label}
                    </p>
                    <p className='text-[11px] text-muted-foreground'>
                      {item.sub}
                    </p>
                  </div>
                  <ArrowRight
                    className='size-3 text-muted-foreground/50'
                    aria-hidden
                  />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
