'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Save, User, MapPin, Award, Car, Loader2, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface ProfileFormData {
  type: 'worker' | 'team_lead';
  city: string;
  postalCode?: string;
  bio?: string;
  skills?: string;
  experienceYears?: number;
  hasVehicle?: boolean;
  whatsappNumber?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      type: 'worker',
      hasVehicle: false,
      experienceYears: 0,
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profiles = await apiClient.getMyProfiles();
      const workerProfile = profiles.find(
        (p: any) => p.type === 'worker' || p.type === 'team_lead'
      );

      if (workerProfile) {
        setProfile(workerProfile);
        // Populate form with existing data
        Object.keys(workerProfile).forEach((key) => {
          if (key === 'skills' && Array.isArray(workerProfile[key])) {
            setValue('skills' as any, workerProfile[key].join(', '));
          } else {
            setValue(key as any, workerProfile[key]);
          }
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format WhatsApp number to international format
  const formatWhatsAppNumber = (phone: string): string => {
    if (!phone) return '';

    // Remove all spaces, dots, and dashes
    let cleaned = phone.replace(/[\s.-]/g, '');

    // If starts with 06 or 07, convert to +336 or +337
    if (/^0[67]\d{8}$/.test(cleaned)) {
      return '+33' + cleaned.substring(1);
    }

    // If starts with 336 or 337, add +
    if (/^33[67]\d{8}$/.test(cleaned)) {
      return '+' + cleaned;
    }

    // If already starts with +33, return as is
    if (/^\+33[67]\d{8}$/.test(cleaned)) {
      return cleaned;
    }

    // Return as is (will fail validation if invalid)
    return cleaned;
  };

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      // Parse skills from comma-separated string
      const skills = data.skills
        ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const profileData = {
        ...data,
        skills,
        experienceYears: Number(data.experienceYears) || 0,
        whatsappNumber: data.whatsappNumber ? formatWhatsAppNumber(data.whatsappNumber) : undefined,
      };

      if (profile) {
        // Update existing profile
        await apiClient.updateProfile(profile.id, profileData);
      } else {
        // Create new profile
        await apiClient.createProfile(profileData);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/jobs');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile ? 'Mon profil' : 'Créer mon profil'}
              </h1>
              <p className="text-gray-600 mt-1">
                {profile
                  ? 'Modifiez vos informations professionnelles'
                  : 'Complétez votre profil pour postuler aux missions'}
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
                Profil enregistré avec succès !
              </h3>
              <p className="text-sm text-green-700">
                Redirection vers les missions disponibles...
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
            {/* Profile Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de profil *
              </label>
              <select
                {...register('type', { required: 'Le type de profil est requis' })}
                className="input-field"
                disabled={!!profile}
              >
                <option value="worker">Travailleur individuel</option>
                <option value="team_lead">Chef d'équipe</option>
              </select>
              {errors.type && (
                <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
              )}
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
                  Code postal
                </label>
                <input
                  {...register('postalCode')}
                  className="input-field"
                  placeholder="Ex: 67000"
                  maxLength={5}
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Présentation
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className="input-field"
                placeholder="Présentez-vous brièvement et décrivez votre expérience..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Cette description sera visible par les employeurs
              </p>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Award className="w-3 h-3 inline mr-1" />
                Compétences
              </label>
              <input
                {...register('skills')}
                className="input-field"
                placeholder="Ex: Vendanges, Taille, Conduite tracteur (séparées par des virgules)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Séparez vos compétences par des virgules
              </p>
            </div>

            {/* Experience Years */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Années d'expérience
              </label>
              <input
                type="number"
                {...register('experienceYears')}
                className="input-field"
                min={0}
                max={50}
                placeholder="0"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro WhatsApp
              </label>
              <input
                {...register('whatsappNumber', {
                  validate: (value) => {
                    if (!value) return true; // Optional field
                    const formatted = formatWhatsAppNumber(value);
                    if (!/^\+33[67]\d{8}$/.test(formatted)) {
                      return 'Format invalide. Utilisez un numéro français: 06XXXXXXXX ou +33XXXXXXXXX';
                    }
                    return true;
                  }
                })}
                className="input-field"
                placeholder="06XXXXXXXX ou +33XXXXXXXXX"
              />
              {errors.whatsappNumber && (
                <p className="text-sm text-red-600 mt-1">{errors.whatsappNumber.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Les employeurs pourront vous contacter via WhatsApp
              </p>
            </div>

            {/* Has Vehicle */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  {...register('hasVehicle')}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>
              <div className="ml-3">
                <label className="font-medium text-gray-700 flex items-center">
                  <Car className="w-4 h-4 mr-2" />
                  Je possède un véhicule
                </label>
                <p className="text-sm text-gray-500">
                  Cela peut augmenter vos chances d'être sélectionné
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between rounded-b-lg">
            <button
              type="button"
              onClick={() => router.push('/jobs')}
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
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{profile ? 'Mettre à jour' : 'Créer mon profil'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
