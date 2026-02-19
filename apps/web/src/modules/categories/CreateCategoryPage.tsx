import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@/lib/zod-resolver';
import { useCategories } from '@/hooks/use-categories';
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
import { useState } from 'react';

const schema = z.object({
  name: z
    .string()
    .min(3, 'At least 3 characters')
    .max(20, 'At most 20 characters'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CreateCategoryPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { create: createCategory } = useCategories();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      await createCategory.mutateAsync(values);
      toast.success('Category created');
      navigate({ to: '/categories' });
    } catch (err) {
      const msg = await extractErrorMessage(err, 'Failed to create category');
      setSubmitError(msg);
      toast.error(msg);
    }
  }

  return (
    <div className='space-y-6'>
      <Card className='max-w-md'>
        <CardHeader>
          <CardTitle>Create category</CardTitle>
          <CardDescription>Add a new category</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                {...form.register('name')}
                placeholder='Category name'
                aria-invalid={!!form.formState.errors.name}
              />
              {form.formState.errors.name && (
                <p className='text-sm text-destructive'>
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='description'>Description (optional)</Label>
              <Input
                id='description'
                {...form.register('description')}
                placeholder='Description'
              />
            </div>
            {submitError && (
              <p className='text-sm text-destructive'>{submitError}</p>
            )}
            <div className='flex gap-2'>
              <Button type='submit' disabled={createCategory.isPending}>
                {createCategory.isPending ? 'Creating...' : 'Create'}
              </Button>
              <Button
                type='button'
                variant='outline'
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
