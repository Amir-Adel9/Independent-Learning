import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
  isRedirect,
  Outlet,
} from '@tanstack/react-router';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';
import { AppLayout } from '@/shared/components/layouts/AppLayout';
import { AuthLayout } from '@/shared/components/layouts/AuthLayout';
import { DashboardPage } from '@/modules/dashboard/DashboardPage';
import { LoginPage } from '@/modules/auth/LoginPage';
import { RegisterPage } from '@/modules/auth/RegisterPage';
import { CategoriesPage } from '@/modules/categories/CategoriesPage';
import { CreateCategoryPage } from '@/modules/categories/CreateCategoryPage';
import { EditCategoryPage } from '@/modules/categories/EditCategoryPage';
import { AdminsPage } from '@/modules/admins/AdminsPage';
import { CreateAdminPage } from '@/modules/admins/CreateAdminPage';
import { EditAdminPage } from '@/modules/admins/EditAdminPage';

async function ensureUser() {
  const existing = useAuthStore.getState().user;
  if (existing) return existing;
  const { data } = await apiClient.GET('/api/auth/me');
  const user = data ?? null;
  useAuthStore.getState().setUser(user);
  return user;
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Pathless layout so we don't duplicate the root path (avoids duplicate __root__ id)
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_app',
  beforeLoad: async () => {
    try {
      await ensureUser();
    } catch {
      throw redirect({ to: '/login', replace: true });
    }
  },
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  component: DashboardPage,
});

const categoriesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'categories',
  component: CategoriesPage,
});
const categoriesCreateRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'categories/create',
  component: CreateCategoryPage,
});
const categoryEditRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'categories/$categoryId/edit',
  component: EditCategoryPage,
});

const adminsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'admins',
  component: AdminsPage,
});
const adminsCreateRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'admins/create',
  component: CreateAdminPage,
});
const adminEditRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'admins/$adminId/edit',
  component: EditAdminPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'login',
  beforeLoad: async () => {
    try {
      const user = await ensureUser();
      if (user) throw redirect({ to: '/', replace: true });
    } catch (e) {
      if (isRedirect(e)) throw e;
    }
  },
  component: function LoginRouteComponent() {
    return (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    );
  },
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'register',
  beforeLoad: async () => {
    try {
      const user = await ensureUser();
      if (user) throw redirect({ to: '/', replace: true });
    } catch (e) {
      if (isRedirect(e)) throw e;
    }
  },
  component: function RegisterRouteComponent() {
    return (
      <AuthLayout>
        <RegisterPage />
      </AuthLayout>
    );
  },
});

const appLayoutWithChildren = appLayoutRoute.addChildren([
  indexRoute,
  categoriesRoute,
  categoriesCreateRoute,
  categoryEditRoute,
  adminsRoute,
  adminsCreateRoute,
  adminEditRoute,
]);

const routeTree = rootRoute.addChildren([
  appLayoutWithChildren,
  loginRoute,
  registerRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
