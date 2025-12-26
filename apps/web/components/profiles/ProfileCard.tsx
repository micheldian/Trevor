'use client';

import { useState } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Star,
  Award,
  CheckCircle,
  Loader2,
  Car,
  Users,
  User,
  Calendar,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface ProfileCardProps {
  profile: {
    id: string;
    firstName?: string;
    lastName?: string;
    type: 'worker' | 'team';
    city: string;
    postalCode: string;
    experienceYears?: number;
    skills?: string[];
    cultures?: string[];
    whatsappNumber?: string;
    phoneNumber?: string;
    ratingAvg?: number;
    ratingCount?: number;
    reliabilityScore?: number;
    completedMissionsCount?: number;
    missionsCount?: number;
    bio?: string;
    hasVehicle?: boolean;
    availability?: any[];
    distance?: number; // Distance en km
  };
  jobId?: string;
  onContactSuccess?: (whatsappLink: string) => void;
}

export default function ProfileCard({ profile, jobId, onContactSuccess }: ProfileCardProps) {
  const [loading, setLoading] = useState(false);
  const [contacted, setContacted] = useState(false);

  const handleWhatsAppContact = async () => {
    if (!jobId) {
      // Direct WhatsApp without creating match
      const whatsappLink = generateWhatsAppLink();
      window.open(whatsappLink, '_blank');
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient.createMatch(jobId, profile.id);
      const whatsappLink = result.whatsappLink;

      setContacted(true);
      if (onContactSuccess) {
        onContactSuccess(whatsappLink);
      }

      // Open WhatsApp
      window.open(whatsappLink, '_blank');
    } catch (err) {
      console.error('Error creating match:', err);
      // Fallback to direct WhatsApp
      const whatsappLink = generateWhatsAppLink();
      window.open(whatsappLink, '_blank');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneCall = () => {
    const phoneNumber = profile.whatsappNumber || profile.phoneNumber;
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const generateWhatsAppLink = () => {
    const phone = profile.whatsappNumber?.replace(/[\s\-\(\)]/g, '') || '';
    const message = encodeURIComponent(
      `Bonjour ${profile.firstName}, je vous contacte via Trevor concernant une opportunité agricole.`
    );
    return `https://wa.me/${phone}?text=${message}`;
  };

  const displayName = profile.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : 'Profil';

  const roleLabel = profile.type === 'team' ? 'Équipe' : 'Travailleur';
  const roleIcon = profile.type === 'team' ? Users : User;
  const RoleIcon = roleIcon;

  // Format distance
  const formatDistance = (distanceKm?: number) => {
    if (!distanceKm) return null;
    if (distanceKm < 1) return 'À proximité';
    if (distanceKm < 10) return `À ${distanceKm.toFixed(1)} km`;
    return `À ${Math.round(distanceKm)} km`;
  };

  // Check if available soon
  const isAvailable = profile.availability && profile.availability.length > 0;

  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Header with Name and Role Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-lg">{displayName}</h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                profile.type === 'team'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              <RoleIcon className="w-3 h-3 mr-1" />
              {roleLabel}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span>{profile.city}</span>
            {profile.distance && (
              <>
                <span className="mx-1.5">•</span>
                <span className="font-medium text-primary-600">
                  {formatDistance(profile.distance)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rating and Stats Row */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          {/* Rating */}
          {profile.ratingAvg !== undefined && profile.ratingAvg > 0 ? (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-900">
                {profile.ratingAvg.toFixed(1)}
              </span>
              {profile.ratingCount !== undefined && profile.ratingCount > 0 && (
                <span className="text-xs text-gray-500">({profile.ratingCount})</span>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-gray-400">
              <Star className="w-4 h-4" />
              <span className="text-sm">Nouveau</span>
            </div>
          )}

          {/* Missions Count */}
          <div className="flex items-center space-x-1 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-medium text-gray-900">
              {profile.completedMissionsCount || 0}
            </span>
            <span className="text-gray-600">missions</span>
          </div>
        </div>

        {/* Vehicle Badge */}
        {profile.hasVehicle && (
          <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-md">
            <Car className="w-4 h-4 text-gray-700" />
            <span className="text-xs font-medium text-gray-700">Véhicule</span>
          </div>
        )}
      </div>

      {/* Cultures Tags */}
      {profile.cultures && profile.cultures.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {profile.cultures.slice(0, 3).map((culture, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-200"
              >
                {culture}
              </span>
            ))}
            {profile.cultures.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                +{profile.cultures.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Skills Tags */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-md"
              >
                <Award className="w-3 h-3 mr-1" />
                {skill}
              </span>
            ))}
            {profile.skills.length > 4 && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                +{profile.skills.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {profile.experienceYears !== undefined && profile.experienceYears > 0 && (
        <div className="mb-3">
          <div className="inline-flex items-center space-x-1 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              <span className="font-semibold text-gray-900">
                {profile.experienceYears}
              </span>{' '}
              {profile.experienceYears > 1 ? 'ans' : 'an'} d'expérience
            </span>
          </div>
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{profile.bio}</p>
      )}

      {/* Availability Indicator */}
      {isAvailable && (
        <div className="flex items-center space-x-2 mb-4 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">Disponible prochainement</span>
        </div>
      )}

      {/* Reliability Score (if available) */}
      {profile.reliabilityScore !== undefined && profile.reliabilityScore < 100 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Fiabilité</span>
            <span className="font-semibold text-gray-900">
              {profile.reliabilityScore}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
                profile.reliabilityScore >= 80
                  ? 'bg-green-500'
                  : profile.reliabilityScore >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${profile.reliabilityScore}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsAppContact}
          disabled={loading || !profile.whatsappNumber}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Contact...</span>
            </>
          ) : contacted ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Contacté</span>
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">WhatsApp</span>
            </>
          )}
        </button>

        {/* Phone Call Button */}
        <button
          onClick={handlePhoneCall}
          disabled={!profile.whatsappNumber && !profile.phoneNumber}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Phone className="w-4 h-4" />
          <span className="text-sm">Appeler</span>
        </button>
      </div>

      {/* Contact info warning */}
      {!profile.whatsappNumber && !profile.phoneNumber && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Informations de contact non disponibles
        </p>
      )}
    </div>
  );
}
