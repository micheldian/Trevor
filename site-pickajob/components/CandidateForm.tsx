'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2 } from 'lucide-react';

const schema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  prenom: z.string().min(2, 'Prénom requis'),
  telephone: z.string().min(8, 'Téléphone invalide'),
  email: z.string().email('Email invalide'),
  pays: z.string().min(2, 'Pays d’origine'),
  langues: z.string().min(2, 'Indiquez au moins une langue'),
  experience: z.string().min(2, 'Décrivez votre expérience'),
  disponibilite: z.string().min(2, 'Indiquez vos disponibilités'),
  mobilite: z.string().min(2, 'Mobilité (régions, France entière, etc.)'),
  logement: z.enum(['oui', 'non']),
  hp: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CandidateForm() {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { logement: 'non' },
  });

  const onSubmit = async (data: FormValues) => {
    if (data.hp) return;
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'candidate', payload: data }),
    });
    if (res.ok) setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-6">
        <div className="flex items-center gap-3 text-brand-800">
          <CheckCircle2 className="h-6 w-6" />
          <h3 className="text-lg font-bold">Inscription enregistrée</h3>
        </div>
        <p className="mt-2 text-sm text-brand-900/80">
          Merci, votre profil a bien été reçu. Pickajob vous recontactera dès qu’une mission correspond à
          votre disponibilité et votre mobilité.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field label="Nom" error={errors.nom?.message}>
        <input className="input" {...register('nom')} autoComplete="family-name" />
      </Field>
      <Field label="Prénom" error={errors.prenom?.message}>
        <input className="input" {...register('prenom')} autoComplete="given-name" />
      </Field>
      <Field label="Téléphone" error={errors.telephone?.message}>
        <input className="input" type="tel" {...register('telephone')} autoComplete="tel" />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <input className="input" type="email" {...register('email')} autoComplete="email" />
      </Field>
      <Field label="Pays d’origine" error={errors.pays?.message}>
        <input className="input" {...register('pays')} />
      </Field>
      <Field label="Langues parlées" error={errors.langues?.message}>
        <input className="input" placeholder="Français, espagnol, anglais…" {...register('langues')} />
      </Field>
      <Field label="Expérience agricole" error={errors.experience?.message} className="sm:col-span-2">
        <textarea
          className="input min-h-[100px]"
          rows={3}
          placeholder="Vendanges, taille, cueillette, conditionnement, serre…"
          {...register('experience')}
        />
      </Field>
      <Field label="Disponibilité" error={errors.disponibilite?.message}>
        <input className="input" placeholder="Ex : septembre-octobre 2026" {...register('disponibilite')} />
      </Field>
      <Field label="Mobilité" error={errors.mobilite?.message}>
        <input className="input" placeholder="Ex : France entière, Sud-Ouest…" {...register('mobilite')} />
      </Field>
      <Field label="Besoin de logement" error={errors.logement?.message}>
        <select className="input" {...register('logement')}>
          <option value="non">Non</option>
          <option value="oui">Oui</option>
        </select>
      </Field>

      <input type="text" {...register('hp')} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

      <div className="sm:col-span-2">
        <button disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Envoyer ma candidature
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
