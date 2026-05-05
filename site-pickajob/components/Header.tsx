'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { PRIMARY_NAV, SITE } from '@/lib/site';

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="container-content flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-800">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">P</span>
          <span className="text-lg">{SITE.name}</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigation principale">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-brand-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a href={SITE.phoneHref} className="btn-ghost" aria-label="Appeler Pickajob">
            <Phone className="h-4 w-4" /> {SITE.phoneDisplay}
          </a>
          <Link href="/devis" className="btn-primary">Demander de la main-d’œuvre</Link>
        </div>

        <button
          type="button"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          className="rounded-md p-2 text-brand-800 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-brand-100 bg-white lg:hidden">
          <nav className="container-content flex flex-col gap-1 py-3" aria-label="Navigation mobile">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-brand-50"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <a href={SITE.phoneHref} className="btn-secondary"><Phone className="h-4 w-4" /> {SITE.phoneDisplay}</a>
              <Link href="/devis" className="btn-primary" onClick={() => setOpen(false)}>
                Demander de la main-d’œuvre
              </Link>
              <Link href="/candidats" className="btn-ghost" onClick={() => setOpen(false)}>
                Je cherche un travail agricole
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
