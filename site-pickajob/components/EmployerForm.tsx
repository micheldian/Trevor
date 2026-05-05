'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2 } from 'lucide-react';

const schema = z.object({
  nom: z.string().min(2, 'Votre nom est requis'),
  entreprise: z.string().min(2, 'Nom de l’exploitation requis'),
  telephone: z.string().min(8, 'Téléphone invalide'),
  email: z.string().email('Email invalide'),
  localisation: z.string().min(2, 'Ville ou département'),
  culture: z.string().min(2, 'Type de culture / activité'),
  nombre: z.coerce.number().int().min(1, 'Indiquez au moins 1 personne'),
  dates: z.string().min(2, 'Période ou dates indicatives'),
  logement: z.enum(['oui', 'non']),
  message: z.string().optional(),
  hp: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function EmployerForm({ defaultCulture = '' }: { defaultCulture?: string }) {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { logement: 'non', culture: defaultCulture },
  });

  const onSubmit = async (data: FormValues) => {
    if (data.hp) return; // honeypot
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'employer', payload: data }),
    });
    if (res.ok) setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-6">
        <div className="flex items-center gap-3 text-brand-800">
          <CheckCircle2 className="h-6 w-6" />
          <h3 className="text-lg font-bold">Demande envoyée</h3>
        </div>
        <p className="mt-2 text-sm text-brand-900/80">
          Merci, nous revenons vers vous très rapidement par téléphone ou email pour qualifier votre besoin
          en main-d’œuvre agricole.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field label="Votre nom" error={errors.nom?.message}>
        <input className="input" {...register('nom')} autoComplete="name" />
      </Field>
      <Field label="Exploitation / entreprise" error={errors.entreprise?.message}>
        <input className="input" {...register('entreprise')} autoComplete="organization" />
      </Field>
      <Field label="Téléphone" error={errors.telephone?.message}>
        <input className="input" type="tel" {...register('telephone')} autoComplete="tel" />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <input className="input" type="email" {...register('email')} autoComplete="email" />
      </Field>
      <Field label="Localisation (ville, département)" error={errors.localisation?.message}>
        <input className="input" {...register('localisation')} />
      </Field>
      <Field label="Type de culture / activité" error={errors.culture?.message}>
        <input className="input" placeholder="Ex : vigne, pommes, fraises, serre…" {...register('culture')} />
      </Field>
      <Field label="Nombre de personnes recherchées" error={errors.nombre?.message}>
        <input className="input" type="number" min={1} {...register('nombre')} />
      </Field>
      <Field label="Dates de mission" error={errors.dates?.message}>
        <input className="input" placeholder="Ex : du 10 au 25 septembre 2026" {...register('dates')} />
      </Field>
      <Field label="Possibilité de logement" error={errors.logement?.message}>
        <select className="input" {...register('logement')}>
          <option value="non">Non</option>
          <option value="oui">Oui</option>
        </select>
      </Field>
      <Field label="Message complémentaire" error={errors.message?.message} className="sm:col-span-2">
        <textarea className="input min-h-[120px]" rows={4} {...register('message')} />
      </Field>

      <input type="text" {...register('hp')} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

      <div className="sm:col-span-2">
        <button disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Envoyer ma demande
        </button>
        <p className="mt-3 text-xs text-gray-500">
          En envoyant ce formulaire, vous acceptez d’être recontacté(e) par Pickajob.
        </p>
      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #c7e8cd;
          background: #ffffff;
          padding: 0.625rem 0.75rem;
          font-size: 0.95rem;
          color: #1f2937;
          outline: none;
        }
        .input:focus { border-color: #3f9c55; box-shadow: 0 0 0 3px rgba(63,156,85,0.15); }
      `}</style>
    </form>
  );
}

function Field({
  label,
  error,
  className = '',
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-medium text-gray-800">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
