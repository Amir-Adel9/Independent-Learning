export interface BreadcrumbSegment {
  label: string;
  path: string;
}

const ROUTE_LABELS: Record<string, string> = {
  '': 'Dashboard',
  categories: 'Categories',
  create: 'Create',
  admins: 'Admins',
  edit: 'Edit',
};

function isUuid(segment: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    segment,
  );
}

/**
 * Derive breadcrumb segments from pathname for app layout.
 * e.g. / -> [Dashboard], /categories -> [Dashboard, Categories], /categories/create -> [Dashboard, Categories, Create]
 */
export function getBreadcrumbsFromPath(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split('/').filter(Boolean);
  const result: BreadcrumbSegment[] = [
    { label: ROUTE_LABELS[''] ?? 'Dashboard', path: '/' },
  ];
  let acc = '';
  for (const seg of segments) {
    acc += `/${seg}`;
    const label = isUuid(seg)
      ? 'Edit'
      : ROUTE_LABELS[seg] ??
        seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
    result.push({ label, path: acc });
  }
  return result;
}
