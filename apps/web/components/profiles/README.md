# ProfileCard Component

Composant React pour afficher les profils de travailleurs/équipes avec toutes les informations pertinentes et les actions de contact.

## ✨ Fonctionnalités

- **Affichage complet** : Nom, rôle, localisation, distance
- **Badges de rôle** : Distinction visuelle Worker (violet) / Équipe (bleu)
- **Stats détaillées** : Note moyenne, nombre de missions, fiabilité
- **Tags visuels** : Cultures (vert) et compétences (primary)
- **Indicateurs** : Véhicule, disponibilité, expérience
- **Barre de fiabilité** : Affichage visuel avec code couleur
- **Actions** : Boutons WhatsApp et Appel
- **États** : Loading, contacté, désactivé
- **Responsive** : Adapté mobile et desktop

## 📋 Interface

```typescript
interface ProfileCardProps {
  profile: {
    id: string;
    firstName?: string;
    lastName?: string;
    type: 'worker' | 'team';              // Rôle
    city: string;
    postalCode: string;
    experienceYears?: number;
    skills?: string[];                     // Compétences
    cultures?: string[];                   // Cultures maîtrisées
    whatsappNumber?: string;
    phoneNumber?: string;
    ratingAvg?: number;                    // Note moyenne (0-5)
    ratingCount?: number;                  // Nombre d'avis
    reliabilityScore?: number;             // Score 0-100
    completedMissionsCount?: number;
    missionsCount?: number;
    bio?: string;
    hasVehicle?: boolean;                  // Badge véhicule
    availability?: any[];                  // Disponibilités
    distance?: number;                     // Distance en km
  };
  jobId?: string;                          // Pour créer un match
  onContactSuccess?: (whatsappLink: string) => void;
}
```

## 🎨 Structure Visuelle

```
┌─────────────────────────────────────┐
│ Nom + Badge Rôle          [Worker] │
│ Ville • Distance (8.5 km)          │
├─────────────────────────────────────┤
│ ⭐ 4.8 (23)  ✓ 23 missions  🚗 Véhi│
├─────────────────────────────────────┤
│ [Riesling] [Pinot Noir] [+2]       │ ← Cultures (vert)
│ [🏅 Viticulture] [🏅 Tracteur] [+2]│ ← Compétences (primary)
│ 📅 5 ans d'expérience              │
│ Bio: Viticulteur passionné...      │
│ ✓ Disponible prochainement         │
│                                     │
│ Fiabilité           95%            │
│ [████████████████░░]               │ ← Barre verte/jaune/rouge
├─────────────────────────────────────┤
│ [💬 WhatsApp]  [📞 Appeler]        │
└─────────────────────────────────────┘
```

## 🚀 Utilisation

### Basique

```tsx
import ProfileCard from '@/components/profiles/ProfileCard';

export default function MyPage() {
  const profile = {
    id: 'worker-1',
    firstName: 'Jean',
    lastName: 'Martin',
    type: 'worker',
    city: 'Colmar',
    postalCode: '68000',
    whatsappNumber: '+33612345678',
    ratingAvg: 4.8,
    ratingCount: 23,
    completedMissionsCount: 23,
    skills: ['Viticulture', 'Tracteur'],
    cultures: ['Riesling', 'Gewurztraminer'],
    hasVehicle: true,
    distance: 8.5,
  };

  return <ProfileCard profile={profile} />;
}
```

### Avec création de match

```tsx
import ProfileCard from '@/components/profiles/ProfileCard';

export default function Dashboard() {
  const handleContact = (whatsappLink: string) => {
    console.log('Match créé, lien WhatsApp:', whatsappLink);
    // Track analytics, update UI, etc.
  };

  return (
    <ProfileCard
      profile={profile}
      jobId="job-123"              // Si fourni, crée un Match
      onContactSuccess={handleContact}
    />
  );
}
```

### Grille responsive

```tsx
import ProfileCard from '@/components/profiles/ProfileCard';

export default function ProfileList({ profiles }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          jobId={selectedJobId}
        />
      ))}
    </div>
  );
}
```

## 📊 Éléments Affichés

### Header
- **Nom complet** : `firstName + lastName` ou "Profil"
- **Badge de rôle** :
  - `Worker` (violet) avec icône User
  - `Équipe` (bleu) avec icône Users
- **Localisation** : Ville + distance formatée

### Stats Row
- **Note** : ⭐ X.X (count) ou "Nouveau" si 0
- **Missions** : Nombre de missions complétées
- **Véhicule** : Badge 🚗 si `hasVehicle: true`

### Tags
- **Cultures** : Fond vert, bordure verte (max 3 + compteur)
- **Compétences** : Fond primary avec icône Award (max 4 + compteur)

### Informations
- **Expérience** : "X ans d'expérience" avec icône Calendar
- **Bio** : Texte tronqué sur 2 lignes (line-clamp-2)
- **Disponibilité** : Badge vert si `availability.length > 0`

### Fiabilité (optionnel)
Affichée uniquement si `reliabilityScore < 100` :
- Barre de progression avec code couleur :
  - 🟢 Vert : ≥ 80%
  - 🟡 Jaune : 60-79%
  - 🔴 Rouge : < 60%

### Actions
- **WhatsApp** (bouton vert) :
  - États : Normal → Loading → Contacté
  - Désactivé si pas de `whatsappNumber`
  - Si `jobId` fourni : crée Match via API
  - Sinon : ouvre WhatsApp directement

- **Appeler** (bouton blanc bordé) :
  - Ouvre `tel:` avec le numéro
  - Désactivé si pas de numéro

## 🎯 Distance Formatting

La fonction `formatDistance()` affiche :
- **< 1 km** : "À proximité"
- **1-9.9 km** : "À X.X km" (1 décimale)
- **≥ 10 km** : "À XX km" (arrondi)

```typescript
formatDistance(0.5)  // "À proximité"
formatDistance(2.3)  // "À 2.3 km"
formatDistance(15.7) // "À 16 km"
```

## 🔗 Intégration WhatsApp

### Avec jobId (création de Match)

```typescript
// 1. Click sur bouton WhatsApp
// 2. API call
const result = await apiClient.createMatch(jobId, candidateId);
// result = {
//   match: {...},
//   whatsappLink: "https://wa.me/+33612345678?text=...",
//   isNewMatch: true
// }

// 3. Ouvre WhatsApp
window.open(result.whatsappLink, '_blank');

// 4. Callback
onContactSuccess(result.whatsappLink);

// 5. UI update
setContacted(true); // Bouton devient "Contacté"
```

### Sans jobId (WhatsApp direct)

```typescript
// Génère le lien manuellement
const link = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
window.open(link, '_blank');
```

## 🎨 Styling

### Classes Tailwind utilisées

```css
/* Card container */
.card hover:shadow-md transition-shadow

/* Badges de rôle */
bg-blue-100 text-blue-700      /* Équipe */
bg-purple-100 text-purple-700  /* Worker */

/* Tags cultures */
bg-green-50 text-green-700 border-green-200

/* Tags compétences */
bg-primary-50 text-primary-700

/* Badge véhicule */
bg-gray-100 text-gray-700

/* Disponibilité */
bg-green-50 text-green-700 border-green-200

/* Boutons */
bg-green-600 text-white hover:bg-green-700    /* WhatsApp */
bg-white border-gray-300 hover:bg-gray-50     /* Appeler */
```

### Responsive

- **Mobile** : 1 colonne, pleine largeur
- **Tablet (md)** : 2 colonnes
- **Desktop (lg)** : 3 colonnes

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

## 🧪 Exemples Complets

Voir `ProfileCard.example.tsx` pour :
- Travailleur expérimenté avec toutes les infos
- Équipe sans véhicule
- Nouveau travailleur sans historique
- Profil à proximité avec faible fiabilité
- Grille de profils (usage dashboard)

## ⚠️ Notes Importantes

1. **Sécurité** :
   - Les numéros de téléphone sont nettoyés avant génération du lien WhatsApp
   - Les messages sont URL-encodés

2. **Fallback** :
   - Si création de Match échoue, WhatsApp direct est utilisé
   - Si pas de numéro, boutons désactivés avec message

3. **Performance** :
   - Les tags sont limités (3 cultures, 4 compétences)
   - Line-clamp sur la bio pour éviter les cartes trop grandes

4. **Accessibilité** :
   - Boutons avec états disabled
   - Loading spinner avec animation
   - Messages d'erreur clairs

## 🔄 États du Composant

```
Bouton WhatsApp:
┌─────────┐
│ Normal  │ → Click → ┌─────────┐ → Success → ┌──────────┐
└─────────┘           │ Loading │              │ Contacté │
                      └─────────┘              └──────────┘
                           ↓ Error
                      ┌─────────┐
                      │ Normal  │ (fallback WhatsApp direct)
                      └─────────┘
```

## 📱 Comportement Mobile

Sur mobile :
- WhatsApp ouvre l'app WhatsApp native
- Tel ouvre le dialer natif
- Card s'adapte à la largeur de l'écran
- Tags wrappent correctement

## 🚀 Performance

Optimisations :
- Pas de re-render inutile (React.memo possible)
- Lazy loading des icônes Lucide
- Transitions CSS légères
- Pas d'images lourdes (avatars avec initiales)
