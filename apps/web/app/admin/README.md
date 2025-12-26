# Trevor Admin Console

Console d'administration complète pour la plateforme Trevor V1.

## 📋 Structure

```
apps/web/app/admin/
├── layout.tsx              # Layout principal avec sidebar
├── page.tsx                # Dashboard
├── users/page.tsx          # Gestion utilisateurs
├── teams/page.tsx          # Gestion équipes
├── jobs/page.tsx           # Gestion jobs
├── matches/page.tsx        # Gestion matches
├── reviews/page.tsx        # Gestion reviews
├── audit/page.tsx          # Audit logs
├── security/page.tsx       # Sécurité et IPs
└── settings/page.tsx       # Paramètres
```

## 🎨 Composants Réutilisables

Tous les composants sont dans `/components/admin/`:

### Layout Components
- **AdminSidebar** - Navigation latérale responsive avec menu mobile
- **AdminHeader** - En-tête avec recherche et notifications

### UI Components
- **PageHeader** - En-tête de page avec titre, description et actions
- **StatsCard** - Carte de statistique avec icône et tendance
- **TableCard** - Wrapper pour tableaux avec en-tête
- **Badge** - Badge coloré pour statuts (success, warning, error, info, neutral)
- **Button** - Bouton avec variantes (primary, secondary, danger, ghost)

### Utilisation

```tsx
import { PageHeader } from '@/components/admin/PageHeader';
import { StatsCard } from '@/components/admin/StatsCard';
import { TableCard } from '@/components/admin/TableCard';
import { Badge } from '@/components/admin/Badge';
import { Button } from '@/components/admin/Button';
import { Users } from 'lucide-react';

// Page header avec actions
<PageHeader
  title="Users"
  description="Manage all platform users"
  actions={
    <Button variant="primary" icon={Users}>
      Add User
    </Button>
  }
/>

// Stats card
<StatsCard
  title="Total Users"
  value="2,847"
  change={{ value: '+12.5%', trend: 'up' }}
  icon={Users}
/>

// Table card
<TableCard title="User List">
  <table>...</table>
</TableCard>

// Badge
<Badge variant="success">Active</Badge>
<Badge variant="error">Suspended</Badge>
```

## 🔐 Authentification

L'API client utilise un token JWT stocké dans localStorage:

```typescript
// lib/admin-api.ts
const token = localStorage.getItem('admin_token');
```

Pour utiliser l'API dans vos composants:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin-api';

export default function MyPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const response = await adminApi.getUsers();
      if (!response.error) {
        setData(response.data);
      }
    }
    fetchData();
  }, []);

  return <div>{/* Render data */}</div>;
}
```

## 📱 Responsive Design

Toutes les pages sont responsive:

- **Mobile (< 1024px)**: Sidebar en overlay avec menu hamburger
- **Desktop (≥ 1024px)**: Sidebar fixe à gauche

Breakpoints Tailwind:
- `md:` - 768px
- `lg:` - 1024px

## 🎯 Pages

### Dashboard (`/admin`)
- Statistiques globales (users, jobs, matches, ratings)
- Activité récente
- Santé de la plateforme

### Users (`/admin/users`)
- Liste tous les utilisateurs
- Filtres par rôle, statut, vérification
- Actions: voir, suspendre, changer rôle
- Badge de vérification

### Teams (`/admin/teams`)
- Vue grille + tableau
- Stats par équipe (membres, missions, rating)
- Spécialités

### Jobs (`/admin/jobs`)
- Liste tous les jobs
- Filtres par statut, culture, date
- Badges de statut (published, in_progress, completed, cancelled)

### Matches (`/admin/matches`)
- Liste tous les matches
- Score de matching
- Filtres par statut

### Reviews (`/admin/reviews`)
- Liste toutes les reviews
- Notation avec étoiles
- Modération (flagged)
- Statistiques (moyenne, flagged)

### Audit Logs (`/admin/audit`)
- Historique complet des actions admin
- Filtres par action, acteur
- Tracking IP et timestamp
- Badges par type d'action

### Security (`/admin/security`)
- IPs bloquées
- Tentatives échouées
- Statistiques de sécurité
- Actions: débloquer IP

### Settings (`/admin/settings`)
- Paramètres généraux
- Configuration sécurité
- Notifications email
- Configuration API

## 🎨 Design System

### Couleurs

- **Primary (Green)**: `green-600`, `green-700`, `green-50`
- **Success**: `green-100/700`
- **Warning**: `yellow-100/700`
- **Error**: `red-100/700`
- **Info**: `blue-100/700`
- **Neutral**: `gray-100/700`

### Typographie

- **Titles**: `text-3xl font-bold`
- **Subtitles**: `text-lg font-semibold`
- **Body**: `text-sm`
- **Small**: `text-xs`

### Espacement

- **Pages**: `p-4 lg:p-8`
- **Cards**: `p-6`
- **Grid gaps**: `gap-6`

## 🔌 API Integration

Fichier: `/lib/admin-api.ts`

### Endpoints disponibles

```typescript
// Dashboard
adminApi.getStats()
adminApi.getMetrics()

// Users
adminApi.getUsers()
adminApi.getUserById(id)
adminApi.updateUserRole(id, role)
adminApi.deactivateUser(id)

// Jobs
adminApi.getJobs()
adminApi.getJobById(id)

// Matches
adminApi.getMatches()
adminApi.getMatchById(id)

// Reviews
adminApi.getReviews()
adminApi.deleteReview(id, reason)

// Audit Logs
adminApi.getAuditLogs({ limit: 50, action: 'user.verified' })
adminApi.getAuditLogsByEntity('user', userId)

// Security
adminApi.getLockedIps()
adminApi.getIpStats(ip)
adminApi.unlockIp(ip)
```

## 🚀 Développement

### Démarrer le serveur de développement

```bash
cd apps/web
npm run dev
```

Accès: http://localhost:3000/admin

### Variables d'environnement

Créer `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📝 TODO

- [ ] Implémenter authentification complète
- [ ] Ajouter pagination aux tableaux
- [ ] Ajouter recherche/filtres avancés
- [ ] Implémenter export CSV
- [ ] Ajouter graphiques (recharts ou chart.js)
- [ ] Implémenter notifications temps réel
- [ ] Ajouter tests (Jest + React Testing Library)
- [ ] Optimiser performance (React.memo, useMemo)
- [ ] Ajouter dark mode
- [ ] Implémenter permissions granulaires

## 🎯 Prochaines Étapes

1. **Authentification**: Implémenter login admin avec JWT
2. **API réelle**: Remplacer les données mock par de vrais appels API
3. **Pagination**: Ajouter pagination côté serveur
4. **Graphiques**: Ajouter visualisations (recharts)
5. **WebSockets**: Notifications en temps réel
6. **Export**: CSV/PDF export pour tableaux
7. **Permissions**: Rôles admin (super_admin, moderator, etc.)
