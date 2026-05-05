export type FaqItem = { q: string; a: string };

export function Faq({ items, title = 'Questions fréquentes' }: { items: FaqItem[]; title?: string }) {
  return (
    <section className="bg-white py-14">
      <div className="container-content max-w-3xl">
        <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">{title}</h2>
        <div className="mt-8 divide-y divide-brand-100 rounded-xl border border-brand-100 bg-white">
          {items.map((it, i) => (
            <details key={i} className="group p-5 open:bg-brand-50/40">
              <summary className="cursor-pointer list-none text-base font-semibold text-brand-900">
                <span className="flex items-center justify-between gap-3">
                  {it.q}
                  <span className="text-brand-600 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
