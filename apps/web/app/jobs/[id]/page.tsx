'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin,
  Users,
  Calendar,
  Clock,
  Euro,
  Briefcase,
  ArrowLeft,
  Building2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const JOB_TYPE_LABELS: Record<string, string> = {
  seasonal: 'Saisonnier',
  temporary: 'Temporaire',
  part_time: 'Temps partiel',
  full_time: 'Temps plein',
};

const DATE_TYPE_LABELS: Record<string, string> = {
  today: "Aujourd'hui",
  tomorrow: 'Demain',
  this_week: 'Cette semaine',
  next_week: 'Semaine prochaine',
  specific_date: 'Date spécifique',
};

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: 'Matin',
  afternoon: 'Après-midi',
  day: 'Journée complète',
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      loadJob();
    }
  }, [params.id]);

  const loadJob = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getJob(params.id as string);
      setJob(data);
    } catch (err: any) {
      console.error('Error loading job:', err);
      setError('Mission non trouvée');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    setError('');

    try {
      // TODO: Implement application logic
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setApplied(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la candidature');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Mission introuvable
          </h2>
          <button
            onClick={() => router.push('/jobs')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Retour aux missions
          </button>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const jobTypeLabel = JOB_TYPE_LABELS[job.jobType] || job.jobType;
  const dateLabel = DATE_TYPE_LABELS[job.dateType] || job.dateType;
  const timeLabel = TIME_SLOT_LABELS[job.timeSlot] || job.timeSlot;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/jobs')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux missions
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                {job.isUrgent && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700 border border-red-300">
                    URGENT
                  </span>
                )}
              </div>

              {job.employer?.companyName && (
                <div className="flex items-center text-gray-600 mb-2">
                  <Building2 className="w-4 h-4 mr-2" />
                  <span className="font-medium">{job.employer.companyName}</span>
                </div>
              )}

              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>
                  {job.address || job.city || job.employer?.city || 'Non spécifié'}
                  {job.postalCode && ` (${job.postalCode})`}
                </span>
              </div>
            </div>

            <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-primary-100 text-primary-700 border border-primary-200">
              <Briefcase className="w-4 h-4 mr-2" />
              {jobTypeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {job.description || 'Aucune description disponible'}
              </p>
            </div>

            {/* Required Skills */}
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Compétences requises
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-md border border-primary-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Job Details Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Détails de la mission
                </h3>

                <div className="space-y-4">
                  {/* Culture */}
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Culture</div>
                    <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-md border border-green-200">
                      🌱 {job.culture}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-start">
                    <Calendar className="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-600">Période</div>
                      <div className="font-medium text-gray-900">{dateLabel}</div>
                      {job.specificDate && (
                        <div className="text-sm text-gray-600 mt-1">
                          {new Date(job.specificDate).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Time Slot */}
                  <div className="flex items-start">
                    <Clock className="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-600">Horaire</div>
                      <div className="font-medium text-gray-900">{timeLabel}</div>
                    </div>
                  </div>

                  {/* Number of People */}
                  <div className="flex items-start">
                    <Users className="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-600">Personnes recherchées</div>
                      <div className="font-medium text-gray-900">
                        {job.nbPeople} personne{job.nbPeople > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Hourly Rate */}
                  {job.hourlyRate && (
                    <div className="flex items-start">
                      <Euro className="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-600">Taux horaire</div>
                        <div className="font-semibold text-lg text-primary-600">
                          {job.hourlyRate}€/h
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Estimated Hours */}
                  {job.estimatedHours && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">Durée estimée</div>
                      <div className="font-medium text-gray-900">
                        {job.estimatedHours} heure{job.estimatedHours > 1 ? 's' : ''}
                      </div>
                      {job.hourlyRate && (
                        <div className="text-sm text-gray-600 mt-1">
                          ≈ {(job.hourlyRate * job.estimatedHours).toFixed(2)}€ total
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Apply Button */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {applied ? (
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Candidature envoyée !
                    </h4>
                    <p className="text-sm text-gray-600">
                      L'employeur vous contactera bientôt
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {applying ? 'Envoi en cours...' : 'Postuler à cette mission'}
                    </button>
                    {error && (
                      <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
                    )}
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Votre profil sera envoyé à l'employeur
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
