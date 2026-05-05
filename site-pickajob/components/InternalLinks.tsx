import Link from 'next/link';

export type LinkItem = { href: string; label: string; description?: string };

export function InternalLinks({
  title,
  intro,
  items,
}: {
  title: string;
  intro?: string;
  items: LinkItem[];
}) {
  return (
    <section className="bg-brand-50/60 py-14">
      <div className="container-content">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">{title}</h2>
          {intro && <p className="mt-3 text-lg text-gray-700">{intro}</p>}
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                className="block h-full rounded-xl border border-brand-100 bg-white p-5 shadow-soft transition hover:border-brand-300 hover:shadow-card"
              >
                <span className="text-base font-semibold text-brand-800">{it.label} →</span>
                {it.description && <span className="mt-1 block text-sm text-gray-700">{it.description}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
