'use client';

import { useState } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Star,
  Award,
  Calendar,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface ProfileCardProps {
  profile: {
    id: string;
    firstName?: string;
    lastName?: string;
    city: string;
    postalCode: string;
    experienceYears: number;
    skills?: string[];
    whatsappNumber?: string;
    phoneNumber?: string;
    ratingAvg?: number;
    ratingCount?: number;
    reliabilityScore?: number;
    completedMissionsCount?: number;
    bio?: string;
    availability?: any[];
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
    ? `${profile.firstName} ${profile.lastName || ''}`
    : 'Profil anonyme';

  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-primary-700">
              {profile.firstName?.[0] || 'U'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{displayName}</h3>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-3 h-3 mr-1" />
              {profile.city}, {profile.postalCode}
            </div>
          </div>
        </div>

        {/* Rating */}
        {profile.ratingAvg && profile.ratingAvg > 0 && (
          <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-gray-900">
              {profile.ratingAvg.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({profile.ratingCount})
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-gray-900">
            {profile.experienceYears}
          </div>
          <div className="text-xs text-gray-600">ans d'exp.</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-gray-900">
            {profile.completedMissionsCount || 0}
          </div>
          <div className="text-xs text-gray-600">missions</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-primary-600">
            {profile.reliabilityScore || 100}%
          </div>
          <div className="text-xs text-gray-600">fiabilité</div>
        </div>
      </div>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
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
                +{profile.skills.length - 4} autres
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {profile.bio}
        </p>
      )}

      {/* Availability indicator */}
      {profile.availability && profile.availability.length > 0 && (
        <div className="flex items-center space-x-2 mb-4 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span>Disponible prochainement</span>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleWhatsAppContact}
          disabled={loading || !profile.whatsappNumber}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        <button
          onClick={handlePhoneCall}
          disabled={!profile.whatsappNumber && !profile.phoneNumber}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Phone className="w-4 h-4" />
          <span className="text-sm">Appeler</span>
        </button>
      </div>

      {/* Contact info not available warning */}
      {!profile.whatsappNumber && !profile.phoneNumber && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Informations de contact non disponibles
        </p>
      )}
    </div>
  );
}
