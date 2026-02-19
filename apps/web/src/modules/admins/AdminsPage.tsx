import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAdmins } from '@/hooks/use-admins';
import { canCreateAdmin } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { extractErrorMessage } from '@/api/client';
import { toast } from 'sonner';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
};

export function AdminsPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: admins, isLoading, isError, error, delete: deleteAdmin } =
    useAdmins();

  const filtered =
    admins?.filter(
      (a) =>
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        (a.name ?? '').toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  async function handleDeleteConfirm() {
    if (deleteId == null) return;
    try {
      await deleteAdmin.mutateAsync(deleteId);
      toast.success('Admin removed');
      setDeleteId(null);
    } catch (err) {
      const msg = await extractErrorMessage(err, 'Failed to remove admin');
      toast.error(msg);
    }
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-4'>
          <div className='space-y-1'>
            <CardTitle>Admins</CardTitle>
            <CardDescription>Manage admin users</CardDescription>
          </div>
          {canCreateAdmin(user) && (
            <Button asChild>
              <Link to='/admins/create'>
                <PlusCircle className='size-4' />
                Create admin
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className='space-y-4'>
          <input
            type='search'
            placeholder='Search by email or name...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          />
          {isLoading && (
            <div className='space-y-2'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='h-12 animate-pulse rounded-md bg-muted'
                />
              ))}
            </div>
          )}
          {isError && (
            <div className='rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive'>
              {error instanceof Error ? error.message : 'Failed to load admins'}
            </div>
          )}
          {!isLoading && !isError && filtered.length === 0 && (
            <p className='py-6 text-center text-sm text-muted-foreground'>
              {search ? 'No admins match your search.' : 'No admins yet.'}
            </p>
          )}
          {!isLoading && !isError && filtered.length > 0 && (
            <>
              <div className='hidden overflow-x-auto rounded-lg border border-border md:block'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-border bg-muted/50'>
                      <th className='px-4 py-2.5 text-left font-medium text-muted-foreground'>
                        Email
                      </th>
                      <th className='px-4 py-2.5 text-left font-medium text-muted-foreground'>
                        Name
                      </th>
                      <th className='px-4 py-2.5 text-left font-medium text-muted-foreground'>
                        Role
                      </th>
                      <th className='px-4 py-2.5 text-left font-medium text-muted-foreground'>
                        Status
                      </th>
                      <th className='px-4 py-2.5 text-right font-medium text-muted-foreground'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr
                        key={a.id}
                        className='border-b border-border last:border-0 hover:bg-muted/40'
                      >
                        <td className='px-4 py-3 font-medium'>{a.email}</td>
                        <td className='px-4 py-3 text-muted-foreground'>
                          {a.name ?? '—'}
                        </td>
                        <td className='px-4 py-3'>
                          <Badge variant='secondary'>
                            {roleLabels[a.role] ?? a.role}
                          </Badge>
                        </td>
                        <td className='px-4 py-3'>
                          {a.isActive ? (
                            <span className='text-muted-foreground'>
                              Active
                            </span>
                          ) : (
                            <span className='text-destructive'>Inactive</span>
                          )}
                        </td>
                        <td className='px-4 py-3 text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='icon-sm'
                              onClick={() =>
                                navigate({
                                  to: '/admins/$adminId/edit',
                                  params: { adminId: a.id },
                                })
                              }
                              aria-label='Edit'
                            >
                              <Pencil className='size-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon-sm'
                              onClick={() => setDeleteId(a.id)}
                              aria-label='Delete'
                            >
                              <Trash2 className='size-4 text-destructive' />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className='space-y-2 md:hidden'>
                {filtered.map((a) => (
                  <div
                    key={a.id}
                    className='flex items-center justify-between rounded-lg border border-border p-3'
                  >
                    <div>
                      <p className='font-medium'>{a.email}</p>
                      <p className='text-xs text-muted-foreground'>
                        {a.name ?? '—'} · {roleLabels[a.role] ?? a.role}
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='ghost'
                        size='icon-sm'
                        onClick={() =>
                          navigate({
                            to: '/admins/$adminId/edit',
                            params: { adminId: a.id },
                          })
                        }
                        aria-label='Edit'
                      >
                        <Pencil className='size-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon-sm'
                        onClick={() => setDeleteId(a.id)}
                        aria-label='Delete'
                      >
                        <Trash2 className='size-4 text-destructive' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove admin?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteConfirm();
              }}
              disabled={deleteAdmin.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteAdmin.isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
