import type { LucideIcon } from 'lucide-react';

type Item = { title: string; description: string; icon?: LucideIcon };

export function FeatureGrid({
  title,
  intro,
  items,
  columns = 3,
}: {
  title: string;
  intro?: string;
  items: Item[];
  columns?: 2 | 3 | 4;
}) {
  const cols =
    columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
  return (
    <section className="bg-white py-14">
      <div className="container-content">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">{title}</h2>
          {intro && <p className="mt-3 text-lg text-gray-700">{intro}</p>}
        </div>
        <div className={`mt-8 grid gap-5 ${cols}`}>
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div
                key={it.title}
                className="rounded-xl border border-brand-100 bg-white p-6 shadow-soft transition hover:shadow-card"
              >
                {Icon && (
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-brand-900">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">{it.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
