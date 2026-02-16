import { Link, useRouterState } from '@tanstack/react-router';

const SEGMENT_LABELS: Record<string, string> = {
  categories: 'Categories',
  create: 'Create',
  admins: 'Admins',
  edit: 'Edit',
};

function segmentLabel(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment;
}

function isUuid(segment: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
}

export function AppBreadcrumbs() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  if (pathname === '/') {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Dashboard</span>
      </nav>
    );
  }

  const segments = pathname.split('/').filter(Boolean);
  let href = '';
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      <Link
        to="/"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Dashboard
      </Link>
      {segments.map((segment, i) => {
        href += (href ? '/' : '') + segment;
        const label = isUuid(segment) ? 'Edit' : segmentLabel(decodeURIComponent(segment));
        const isLast = i === segments.length - 1;
        return (
          <span key={href} className="flex items-center gap-2">
            <span className="text-muted-foreground">/</span>
            {isLast ? (
              <span className="capitalize text-foreground">{label}</span>
            ) : (
              <Link
                to={href}
                className="capitalize text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
