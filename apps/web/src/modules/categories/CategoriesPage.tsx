import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useCategories } from '@/hooks/use-categories';
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
import { extractErrorMessage } from '@/api/client';
import { toast } from 'sonner';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

export function CategoriesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: categories, isLoading, isError, error, delete: deleteCategory } =
    useCategories();

  const filtered =
    categories?.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  async function handleDeleteConfirm() {
    if (deleteId == null) return;
    try {
      await deleteCategory.mutateAsync(deleteId);
      toast.success('Category deleted');
      setDeleteId(null);
    } catch (err) {
      const msg = await extractErrorMessage(err, 'Failed to delete category');
      toast.error(msg);
    }
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-4'>
          <div className='space-y-1'>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Manage categories</CardDescription>
          </div>
          <Button asChild>
            <Link to='/categories/create'>
              <PlusCircle className='size-4' />
              Create category
            </Link>
          </Button>
        </CardHeader>
        <CardContent className='space-y-4'>
          <input
            type='search'
            placeholder='Search by name...'
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
              {error instanceof Error
                ? error.message
                : 'Failed to load categories'}
            </div>
          )}
          {!isLoading && !isError && filtered.length === 0 && (
            <p className='py-6 text-center text-sm text-muted-foreground'>
              {search
                ? 'No categories match your search.'
                : 'No categories yet.'}
            </p>
          )}
          {!isLoading && !isError && filtered.length > 0 && (
            <>
              <div className='hidden overflow-x-auto rounded-lg border border-border md:block'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-border bg-muted/50'>
                      <th className='px-4 py-2.5 text-left font-medium text-muted-foreground'>
                        Name
                      </th>
                      <th className='px-4 py-2.5 text-left font-medium text-muted-foreground'>
                        Description
                      </th>
                      <th className='px-4 py-2.5 text-right font-medium text-muted-foreground'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr
                        key={c.id}
                        className='border-b border-border last:border-0 hover:bg-muted/40'
                      >
                        <td className='px-4 py-3 font-medium'>{c.name}</td>
                        <td className='px-4 py-3 text-muted-foreground'>
                          {c.description ?? '—'}
                        </td>
                        <td className='px-4 py-3 text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='icon-sm'
                              onClick={() =>
                                navigate({
                                  to: '/categories/$categoryId/edit',
                                  params: { categoryId: c.id },
                                })
                              }
                              aria-label='Edit'
                            >
                              <Pencil className='size-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon-sm'
                              onClick={() => setDeleteId(c.id)}
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
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    className='flex items-center justify-between rounded-lg border border-border p-3'
                  >
                    <div>
                      <p className='font-medium'>{c.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {c.description ?? '—'}
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='ghost'
                        size='icon-sm'
                        onClick={() =>
                          navigate({
                            to: '/categories/$categoryId/edit',
                            params: { categoryId: c.id },
                          })
                        }
                        aria-label='Edit'
                      >
                        <Pencil className='size-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon-sm'
                        onClick={() => setDeleteId(c.id)}
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
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
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
              disabled={deleteCategory.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteCategory.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
