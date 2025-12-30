'use client';

import { MapPin, Users, Calendar, Clock, Euro, Briefcase } from 'lucide-react';
import Link from 'next/link';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    jobType: string;
    description?: string;
    culture: string;
    city?: string;
    postalCode?: string;
    nbPeople: number;
    dateType: string;
    timeSlot: string;
    hourlyRate?: number;
    estimatedHours?: number;
    isUrgent: boolean;
    employer?: {
      companyName?: string;
      city: string;
    };
  };
}

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
  day: 'Journée',
};

export default function JobCard({ job }: JobCardProps) {
  const jobTypeLabel = JOB_TYPE_LABELS[job.jobType] || job.jobType;
  const dateLabel = DATE_TYPE_LABELS[job.dateType] || job.dateType;
  const timeLabel = TIME_SLOT_LABELS[job.timeSlot] || job.timeSlot;

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="card hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-primary-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
              {job.isUrgent && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300">
                  URGENT
                </span>
              )}
            </div>

            {job.employer?.companyName && (
              <p className="text-sm text-gray-600 mb-1">{job.employer.companyName}</p>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
              <span>{job.city || job.employer?.city || 'Non spécifié'}</span>
            </div>
          </div>

          {/* Job Type Badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 border border-primary-200">
            <Briefcase className="w-3 h-3 mr-1" />
            {jobTypeLabel}
          </span>
        </div>

        {/* Culture Tag */}
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-md border border-green-200">
            🌱 {job.culture}
          </span>
        </div>

        {/* Description */}
        {job.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>
        )}

        {/* Job Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-200">
          {/* Date */}
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
            <span className="text-gray-700">{dateLabel}</span>
          </div>

          {/* Time Slot */}
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
            <span className="text-gray-700">{timeLabel}</span>
          </div>

          {/* Number of People */}
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
            <span className="text-gray-700">
              {job.nbPeople} personne{job.nbPeople > 1 ? 's' : ''}
            </span>
          </div>

          {/* Hourly Rate */}
          {job.hourlyRate && (
            <div className="flex items-center text-sm">
              <Euro className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
              <span className="font-semibold text-gray-900">{job.hourlyRate}€/h</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {job.estimatedHours && (
            <span className="text-xs text-gray-500">
              Durée estimée: {job.estimatedHours}h
            </span>
          )}
          <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Voir détails →
          </button>
        </div>
      </div>
    </Link>
  );
}
