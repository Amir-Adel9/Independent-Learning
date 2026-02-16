import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@/lib/zod-resolver';
import { useCreateAdmin } from '@/api/hooks/use-admins';
import { canCreateAdmin } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { extractErrorMessage } from '@/api/client';
import { toast } from 'sonner';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().optional(),
  password: z.string().min(6, 'At least 6 characters'),
  role: z.enum(['admin', 'editor']),
});

type FormValues = z.infer<typeof schema>;

export function CreateAdminPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createAdmin = useCreateAdmin();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', name: '', password: '', role: 'editor' },
  });

  useEffect(() => {
    if (user && !canCreateAdmin(user)) {
      navigate({ to: '/admins', replace: true });
    }
  }, [user, navigate]);

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      await createAdmin.mutateAsync(values);
      toast.success('Admin created');
      navigate({ to: '/admins' });
    } catch (err) {
      const msg = await extractErrorMessage(err, 'Failed to create admin');
      setSubmitError(msg);
      toast.error(msg.includes('super_admin') ? 'Only super_admin can create admins' : msg);
    }
  }

  if (user && !canCreateAdmin(user)) return null;

  return (
    <div className="space-y-6">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Create admin</CardTitle>
          <CardDescription>Requires super_admin role.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} placeholder="admin@example.com" aria-invalid={!!form.formState.errors.email} />
              {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input id="name" {...form.register('name')} placeholder="Display name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register('password')} placeholder="Min 6 characters" aria-invalid={!!form.formState.errors.password} />
              {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.watch('role')} onValueChange={(v) => form.setValue('role', v as 'admin' | 'editor')}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {submitError && <p className="text-sm text-destructive">{submitError}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={createAdmin.isPending}>{createAdmin.isPending ? 'Creating...' : 'Create'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/admins' })}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
