type Step = { title: string; description: string };

export function Steps({ title, intro, steps }: { title: string; intro?: string; steps: Step[] }) {
  return (
    <section className="bg-brand-50/50 py-14">
      <div className="container-content">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">{title}</h2>
          {intro && <p className="mt-3 text-lg text-gray-700">{intro}</p>}
        </div>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-xl border border-brand-100 bg-white p-6 shadow-soft">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                {i + 1}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-brand-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{s.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
