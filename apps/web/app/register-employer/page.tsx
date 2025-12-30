'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Save, Building2, MapPin, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface EmployerFormData {
  companyName: string;
  siret?: string;
  city: string;
  postalCode: string;
  address?: string;
  bio?: string;
}

export default function RegisterEmployerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployerFormData>();

  const onSubmit = async (data: EmployerFormData) => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const profileData = {
        type: 'employer',
        companyName: data.companyName,
        siret: data.siret,
        city: data.city,
        postalCode: data.postalCode,
        address: data.address,
        bio: data.bio,
      };

      await apiClient.createProfile(profileData);
      setSuccess(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/choose-role')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </button>

          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Inscription Employeur
              </h1>
              <p className="text-gray-600 mt-1">
                Créez votre profil pour publier vos missions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900">
                Profil créé avec succès !
              </h3>
              <p className="text-sm text-green-700">
                Redirection vers votre dashboard...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise / Exploitation *
              </label>
              <input
                {...register('companyName', { required: 'Le nom de l\'entreprise est requis' })}
                className="input-field"
                placeholder="Ex: Domaine Viticole Martin"
              />
              {errors.companyName && (
                <p className="text-sm text-red-600 mt-1">{errors.companyName.message}</p>
              )}
            </div>

            {/* SIRET */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro SIRET (optionnel)
              </label>
              <input
                {...register('siret')}
                className="input-field"
                placeholder="12345678901234"
                maxLength={14}
              />
              <p className="text-xs text-gray-500 mt-1">
                14 chiffres - Recommandé pour la confiance
              </p>
            </div>

            {/* City and Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Ville *
                </label>
                <input
                  {...register('city', { required: 'La ville est requise' })}
                  className="input-field"
                  placeholder="Ex: Strasbourg"
                />
                {errors.city && (
                  <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal *
                </label>
                <input
                  {...register('postalCode', { required: 'Le code postal est requis' })}
                  className="input-field"
                  placeholder="67000"
                  maxLength={5}
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-600 mt-1">{errors.postalCode.message}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse complète (optionnel)
              </label>
              <input
                {...register('address')}
                className="input-field"
                placeholder="15 Route des Vignes"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Présentation de votre exploitation
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className="input-field"
                placeholder="Décrivez votre exploitation, vos activités, vos valeurs..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Cette description sera visible par les travailleurs
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between rounded-b-lg">
            <button
              type="button"
              onClick={() => router.push('/choose-role')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Créer mon profil employeur</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
