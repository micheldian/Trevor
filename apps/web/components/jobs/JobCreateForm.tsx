'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, MapPin, Users, Calendar, Clock, Euro, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface JobCreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface JobFormData {
  title: string;
  jobType: string;
  description: string;
  culture: string;
  tags: string;
  dateType: string;
  specificDate?: string;
  timeSlot: string;
  nbPeople: number;
  address: string;
  city: string;
  postalCode: string;
  hourlyRate?: number;
  estimatedHours?: number;
  requiredSkills: string;
}

export default function JobCreateForm({ onSuccess, onCancel }: JobCreateFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    defaultValues: {
      jobType: 'seasonal',
      dateType: 'this_week',
      timeSlot: 'day',
      nbPeople: 1,
    },
  });

  const dateType = watch('dateType');

  const onSubmit = async (data: JobFormData) => {
    setLoading(true);
    setError('');

    try {
      // Parse tags and skills
      const tags = data.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const requiredSkills = data.requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Prepare job data
      const jobData = {
        title: data.title,
        jobType: data.jobType,
        description: data.description,
        culture: data.culture,
        tags,
        requiredSkills,
        dateType: data.dateType,
        specificDate: data.specificDate || undefined,
        timeSlot: data.timeSlot,
        nbPeople: Number(data.nbPeople),
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        latitude: 48.5734, // TODO: Géocodage
        longitude: 7.7521,
        hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
        estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : undefined,
      };

      await apiClient.createJob(jobData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la mission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Créer une mission</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de la mission *
            </label>
            <input
              {...register('title', { required: 'Le titre est requis' })}
              className="input-field"
              placeholder="Ex: Vendanges Riesling 2024"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de contrat *
            </label>
            <select {...register('jobType', { required: 'Le type de contrat est requis' })} className="input-field">
              <option value="seasonal">Saisonnier</option>
              <option value="temporary">Temporaire</option>
              <option value="part_time">Temps partiel</option>
              <option value="full_time">Temps plein</option>
            </select>
            {errors.jobType && (
              <p className="text-sm text-red-600 mt-1">{errors.jobType.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'La description est requise' })}
              rows={3}
              className="input-field"
              placeholder="Décrivez la mission en détail..."
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Culture & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Culture *
              </label>
              <input
                {...register('culture', { required: 'La culture est requise' })}
                className="input-field"
                placeholder="Ex: Riesling, Maïs, Tomates"
              />
              {errors.culture && (
                <p className="text-sm text-red-600 mt-1">{errors.culture.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (séparés par virgule)
              </label>
              <input
                {...register('tags')}
                className="input-field"
                placeholder="vendanges, urgent"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Période *
              </label>
              <select {...register('dateType')} className="input-field">
                <option value="this_week">Cette semaine</option>
                <option value="next_week">Semaine prochaine</option>
                <option value="this_month">Ce mois-ci</option>
                <option value="specific_date">Date spécifique</option>
              </select>
            </div>

            {dateType === 'specific_date' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date exacte *
                </label>
                <input
                  type="date"
                  {...register('specificDate')}
                  className="input-field"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Créneau *
              </label>
              <select {...register('timeSlot')} className="input-field">
                <option value="morning">Matin</option>
                <option value="afternoon">Après-midi</option>
                <option value="day">Journée</option>
                <option value="evening">Soir</option>
              </select>
            </div>
          </div>

          {/* Number of people */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Nombre de personnes *
            </label>
            <input
              type="number"
              {...register('nbPeople', { required: true, min: 1 })}
              className="input-field"
              min="1"
            />
          </div>

          {/* Location */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4 inline mr-1" />
              Localisation *
            </label>
            <input
              {...register('address', { required: 'L\'adresse est requise' })}
              className="input-field"
              placeholder="15 Route des Vins"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                {...register('city', { required: 'La ville est requise' })}
                className="input-field"
                placeholder="Ville"
              />
              <input
                {...register('postalCode', { required: 'Le code postal est requis' })}
                className="input-field"
                placeholder="Code postal"
              />
            </div>
          </div>

          {/* Compensation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Euro className="w-4 h-4 inline mr-1" />
                Taux horaire (€)
              </label>
              <input
                type="number"
                step="0.5"
                {...register('hourlyRate')}
                className="input-field"
                placeholder="12.50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heures estimées
              </label>
              <input
                type="number"
                {...register('estimatedHours')}
                className="input-field"
                placeholder="8"
              />
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compétences requises (séparées par virgule)
            </label>
            <input
              {...register('requiredSkills')}
              className="input-field"
              placeholder="viticulture, conduite tracteur"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 inline" />
                  Création...
                </>
              ) : (
                'Créer la mission'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
