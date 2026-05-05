import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export type Crumb = { name: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d’Ariane" className="container-content pt-4">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-gray-500 sm:text-sm">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
            {c.href ? (
              <Link href={c.href} className="hover:text-brand-700">{c.name}</Link>
            ) : (
              <span className="font-medium text-gray-700">{c.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
