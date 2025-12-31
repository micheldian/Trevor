'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Save, User, MapPin, Award, Car, Loader2, CheckCircle, ArrowLeft, X, Plus } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface WorkerFormData {
  type: 'worker' | 'team_lead';
  city: string;
  postalCode: string;
  bio?: string;
  experienceYears?: number;
  hasVehicle?: boolean;
  whatsappNumber?: string;
}

// European country codes with flags
const COUNTRY_CODES = [
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+32', country: 'Belgique', flag: '🇧🇪' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
  { code: '+41', country: 'Suisse', flag: '🇨🇭' },
  { code: '+49', country: 'Allemagne', flag: '🇩🇪' },
  { code: '+39', country: 'Italie', flag: '🇮🇹' },
  { code: '+34', country: 'Espagne', flag: '🇪🇸' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+31', country: 'Pays-Bas', flag: '🇳🇱' },
  { code: '+44', country: 'Royaume-Uni', flag: '🇬🇧' },
  { code: '+48', country: 'Pologne', flag: '🇵🇱' },
  { code: '+40', country: 'Roumanie', flag: '🇷🇴' },
];

export default function RegisterWorkerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [countryCode, setCountryCode] = useState('+33'); // Default to France
  const [phoneNumber, setPhoneNumber] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkerFormData>({
    defaultValues: {
      type: 'worker',
      hasVehicle: false,
      experienceYears: 0,
    },
  });

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSkillInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const onSubmit = async (data: WorkerFormData) => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      // Concatenate country code + phone number if phone number is provided
      const whatsappNumber = phoneNumber.trim() ? `${countryCode}${phoneNumber.trim()}` : undefined;

      const profileData = {
        type: data.type,
        city: data.city,
        postalCode: data.postalCode,
        bio: data.bio,
        skills,
        experienceYears: Number(data.experienceYears) || 0,
        hasVehicle: data.hasVehicle,
        whatsappNumber,
      };

      await apiClient.createProfile(profileData);
      setSuccess(true);

      setTimeout(() => {
        router.push('/jobs');
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
            <User className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Inscription Travailleur
              </h1>
              <p className="text-gray-600 mt-1">
                Créez votre profil pour trouver des missions
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

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Présentation
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className="input-field"
                placeholder="Présentez-vous brièvement et décrivez votre expérience en agriculture..."
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

              {/* Skills Tags Display */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full border border-green-300"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:text-green-900 focus:outline-none"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillInputKeyDown}
                  className="input-field flex-1"
                  placeholder="Ex: Vendanges, Taille, Conduite tracteur..."
                />
                <button
                  type="button"
                  onClick={addSkill}
                  disabled={!skillInput.trim()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ajoutez vos compétences une par une ou appuyez sur Entrée
              </p>
            </div>

            {/* Experience Years */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Années d'expérience en agriculture
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
                Numéro WhatsApp (recommandé)
              </label>
              <div className="flex gap-2">
                {/* Country Code Dropdown */}
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  style={{ minWidth: '140px' }}
                >
                  {COUNTRY_CODES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>

                {/* Phone Number Input */}
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="612345678"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Les employeurs pourront vous contacter rapidement via WhatsApp
              </p>
            </div>

            {/* Has Vehicle */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  {...register('hasVehicle')}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
              </div>
              <div className="ml-3">
                <label className="font-medium text-gray-700 flex items-center">
                  <Car className="w-4 h-4 mr-2" />
                  Je possède un véhicule
                </label>
                <p className="text-sm text-gray-500">
                  Cela peut augmenter vos chances d'être sélectionné pour certaines missions
                </p>
              </div>
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
              className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-6 py-2.5 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Créer mon profil travailleur</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
