import { useNavigate, useParams } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@/lib/zod-resolver';
import { useCategory, useUpdateCategory } from '@/api/hooks/use-categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { extractErrorMessage } from '@/api/client';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

const schema = z.object({
  name: z.string().min(3, 'At least 3 characters').max(20, 'At most 20 characters'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function EditCategoryPage() {
  const { categoryId } = useParams({ from: '/_app/categories/$categoryId/edit' });
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: category, isLoading, isError } = useCategory(categoryId);
  const updateCategory = useUpdateCategory(categoryId ?? '');
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (category) {
      form.reset({ name: category.name, description: category.description ?? '' });
    }
  }, [category, form]);

  async function onSubmit(values: FormValues) {
    if (!categoryId) return;
    setSubmitError(null);
    try {
      await updateCategory.mutateAsync(values);
      toast.success('Category updated');
      navigate({ to: '/categories' });
    } catch (err) {
      const msg = await extractErrorMessage(err, 'Failed to update category');
      setSubmitError(msg);
      toast.error(msg);
    }
  }

  if (isLoading || !category) {
    return (
      <div className="space-y-6">
        <Card className="max-w-md">
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              {isLoading ? 'Loading...' : 'Category not found.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Card className="max-w-md">
          <CardContent className="py-8">
            <p className="text-center text-destructive">Failed to load category.</p>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={() => navigate({ to: '/categories' })}>
                Back to categories
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Edit category</CardTitle>
          <CardDescription>Update category details</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Category name"
                aria-invalid={!!form.formState.errors.name}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                {...form.register('description')}
                placeholder="Description"
              />
            </div>
            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={updateCategory.isPending}>
                {updateCategory.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/categories' })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
