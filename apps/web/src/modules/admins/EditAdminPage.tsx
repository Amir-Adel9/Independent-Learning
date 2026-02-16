import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@/lib/zod-resolver';
import { useAdminById, useUpdateAdmin } from '@/api/hooks/use-admins';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { extractErrorMessage } from '@/api/client';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().optional(),
  password: z.string().optional(),
  role: z.enum(['super_admin', 'admin', 'editor']),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function EditAdminPage() {
  const { adminId } = useParams({ from: '/_app/admins/$adminId/edit' });
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: admin, isLoading, isError } = useAdminById(adminId);
  const updateAdmin = useUpdateAdmin(adminId ?? '');
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      role: 'editor',
      isActive: true,
    },
  });

  useEffect(() => {
    if (admin) {
      form.reset({
        email: admin.email,
        name: admin.name ?? '',
        password: '',
        role: admin.role,
        isActive: admin.isActive,
      });
    }
  }, [admin, form]);

  async function onSubmit(values: FormValues) {
    if (!adminId) return;
    const body: { email?: string; name?: string; password?: string; role?: FormValues['role']; isActive?: boolean } = {
      email: values.email,
      name: values.name,
      role: values.role,
      isActive: values.isActive,
    };
    if (values.password) body.password = values.password;
    setSubmitError(null);
    try {
      await updateAdmin.mutateAsync(body);
      toast.success('Admin updated');
      navigate({ to: '/admins' });
    } catch (err) {
      const msg = await extractErrorMessage(err, 'Failed to update admin');
      setSubmitError(msg);
      toast.error(msg);
    }
  }

  if (isLoading || (!admin && !isError)) {
    return (
      <div className="space-y-6">
        <Card className="max-w-md">
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              {isLoading ? 'Loading...' : 'Admin not found.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !admin) {
    return (
      <div className="space-y-6">
        <Card className="max-w-md">
          <CardContent className="py-8">
            <p className="text-center text-destructive">Failed to load admin.</p>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={() => navigate({ to: '/admins' })}>
                Back to admins
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
          <CardTitle>Edit admin</CardTitle>
          <CardDescription>Update admin details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="admin@example.com"
                aria-invalid={!!form.formState.errors.email}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input id="name" {...form.register('name')} placeholder="Display name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New password (leave blank to keep)</Label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
                placeholder="Min 6 characters"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.watch('role')}
                onValueChange={(v) =>
                  form.setValue('role', v as 'super_admin' | 'admin' | 'editor')
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.watch('isActive')}
                onChange={(e) => form.setValue('isActive', e.target.checked)}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={updateAdmin.isPending}>
                {updateAdmin.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/admins' })}
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
