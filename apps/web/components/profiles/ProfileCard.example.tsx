/**
 * Exemples d'utilisation du composant ProfileCard
 */

import ProfileCard from './ProfileCard';

// Exemple 1: Travailleur expérimenté avec toutes les infos
export function Example1() {
  const workerProfile = {
    id: 'worker-1',
    firstName: 'Jean',
    lastName: 'Martin',
    type: 'worker' as const,
    city: 'Colmar',
    postalCode: '68000',
    experienceYears: 5,
    skills: ['Viticulture', 'Tracteur', 'Taille', 'Vendanges'],
    cultures: ['Riesling', 'Gewurztraminer', 'Pinot Noir'],
    whatsappNumber: '+33612345678',
    phoneNumber: '+33612345678',
    ratingAvg: 4.8,
    ratingCount: 23,
    reliabilityScore: 95,
    completedMissionsCount: 23,
    missionsCount: 25,
    bio: 'Viticulteur passionné avec 5 ans d\'expérience dans les vignobles alsaciens. Spécialisé en vendanges et taille.',
    hasVehicle: true,
    availability: [
      { dateType: 'this_week', timeSlot: 'morning' },
      { dateType: 'next_week', timeSlot: 'day' },
    ],
    distance: 8.5,
  };

  return (
    <div className="max-w-sm">
      <ProfileCard
        profile={workerProfile}
        jobId="job-123"
        onContactSuccess={(link) => console.log('WhatsApp link:', link)}
      />
    </div>
  );
}

// Exemple 2: Équipe sans véhicule
export function Example2() {
  const teamProfile = {
    id: 'team-1',
    firstName: 'Équipe Agricole',
    lastName: 'Est',
    type: 'team' as const,
    city: 'Strasbourg',
    postalCode: '67000',
    experienceYears: 3,
    skills: ['Récolte', 'Maraîchage', 'Arboriculture'],
    cultures: ['Maïs', 'Tomates', 'Pommes'],
    whatsappNumber: '+33687654321',
    ratingAvg: 4.2,
    ratingCount: 15,
    reliabilityScore: 88,
    completedMissionsCount: 15,
    missionsCount: 17,
    hasVehicle: false,
    availability: [],
    distance: 15,
  };

  return (
    <div className="max-w-sm">
      <ProfileCard profile={teamProfile} jobId="job-456" />
    </div>
  );
}

// Exemple 3: Nouveau travailleur sans historique
export function Example3() {
  const newWorkerProfile = {
    id: 'worker-2',
    firstName: 'Marie',
    lastName: 'Dupont',
    type: 'worker' as const,
    city: 'Barr',
    postalCode: '67140',
    experienceYears: 1,
    skills: ['Vendanges'],
    cultures: ['Riesling'],
    whatsappNumber: '+33699887766',
    ratingAvg: 0,
    ratingCount: 0,
    reliabilityScore: 100,
    completedMissionsCount: 0,
    missionsCount: 0,
    bio: 'Nouvelle dans le domaine viticole, motivée et sérieuse.',
    hasVehicle: false,
    availability: [{ dateType: 'this_week', timeSlot: 'day' }],
    distance: 2.3,
  };

  return (
    <div className="max-w-sm">
      <ProfileCard profile={newWorkerProfile} jobId="job-789" />
    </div>
  );
}

// Exemple 4: Profil à proximité avec faible fiabilité
export function Example4() {
  const unreliableProfile = {
    id: 'worker-3',
    firstName: 'Pierre',
    lastName: 'Leroy',
    type: 'worker' as const,
    city: 'Obernai',
    postalCode: '67210',
    experienceYears: 2,
    skills: ['Viticulture', 'Vendanges'],
    cultures: ['Riesling', 'Pinot Gris'],
    whatsappNumber: '+33655443322',
    ratingAvg: 3.5,
    ratingCount: 8,
    reliabilityScore: 60,
    completedMissionsCount: 6,
    missionsCount: 10,
    hasVehicle: true,
    availability: [],
    distance: 0.8, // À proximité
  };

  return (
    <div className="max-w-sm">
      <ProfileCard profile={unreliableProfile} jobId="job-101" />
    </div>
  );
}

// Exemple 5: Grille de profils (usage typique dans le dashboard)
export function ProfileGrid() {
  const profiles = [
    {
      id: 'worker-1',
      firstName: 'Jean',
      lastName: 'M.',
      type: 'worker' as const,
      city: 'Colmar',
      postalCode: '68000',
      skills: ['Viticulture', 'Tracteur'],
      cultures: ['Riesling'],
      whatsappNumber: '+33612345678',
      ratingAvg: 4.8,
      ratingCount: 23,
      completedMissionsCount: 23,
      hasVehicle: true,
      distance: 8.5,
    },
    {
      id: 'team-1',
      firstName: 'Équipe Est',
      type: 'team' as const,
      city: 'Strasbourg',
      postalCode: '67000',
      skills: ['Récolte', 'Maraîchage'],
      cultures: ['Maïs', 'Tomates'],
      whatsappNumber: '+33687654321',
      ratingAvg: 4.2,
      ratingCount: 15,
      completedMissionsCount: 15,
      hasVehicle: false,
      distance: 15,
    },
    {
      id: 'worker-2',
      firstName: 'Marie',
      lastName: 'D.',
      type: 'worker' as const,
      city: 'Barr',
      postalCode: '67140',
      skills: ['Vendanges'],
      cultures: ['Riesling'],
      whatsappNumber: '+33699887766',
      ratingAvg: 0,
      completedMissionsCount: 0,
      hasVehicle: false,
      distance: 2.3,
      availability: [{ dateType: 'this_week', timeSlot: 'day' }],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          jobId="job-123"
          onContactSuccess={(link) => console.log('Contact:', profile.id)}
        />
      ))}
    </div>
  );
}
