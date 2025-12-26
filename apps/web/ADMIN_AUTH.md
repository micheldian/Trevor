# Admin Authentication System

Système d'authentification complet pour la console admin Trevor avec OTP/JWT.

## 🔐 Architecture

### Composants

1. **Auth Utilities** (`lib/auth.ts`)
   - Token storage (localStorage)
   - User storage
   - JWT decoding et validation
   - Token expiration check
   - Admin role verification

2. **Auth API** (`lib/auth-api.ts`)
   - Request OTP code
   - Verify OTP and login
   - Token refresh
   - Logout

3. **Auth Context** (`contexts/AdminAuthContext.tsx`)
   - React Context pour l'état d'authentification
   - Gestion des tokens
   - User state
   - Auth methods (requestOtp, verifyOtp, logout, refreshAuth)

4. **Auth Hooks** (`hooks/useRequireAuth.ts`)
   - Hook pour protéger les pages
   - Auto-redirect vers login si non authentifié

5. **Middleware** (`middleware.ts`)
   - Protection des routes /admin/*
   - Validation JWT côté serveur
   - Vérification rôle admin
   - Redirects automatiques

6. **Login Page** (`app/admin/login/page.tsx`)
   - Interface 2 étapes (phone/email → OTP)
   - Countdown timer
   - Resend OTP
   - Error handling

## 🚀 Flow d'Authentification

### 1. Login Process

```
User → Enter Phone/Email → Request OTP
  ↓
Backend sends OTP (SMS/Email)
  ↓
User enters OTP → Verify OTP
  ↓
Backend validates OTP → Returns JWT tokens
  ↓
Store tokens in localStorage → Redirect to /admin
```

### 2. Route Protection

```
User visits /admin/users
  ↓
Middleware checks JWT token
  ↓
Token valid & role=admin?
  ↓ Yes          ↓ No
Allow         Redirect to /admin/login
  ↓
AdminLayoutContent checks auth
  ↓
useRequireAuth hook validates
  ↓
Render protected content
```

## 📝 Utilisation

### Login Page

Accessible à `/admin/login`

**Étape 1 - Phone/Email:**
```
- Entre numéro de téléphone ou email
- Clique "Continue"
- OTP envoyé par SMS ou email
```

**Étape 2 - OTP:**
```
- Entre le code à 6 chiffres
- Countdown de 5 minutes
- Bouton "Resend" après 1 minute
- Bouton "Change number" pour retour
```

### Protected Pages

Toutes les pages `/admin/*` (sauf `/admin/login`) sont protégées automatiquement.

**Dans un composant page:**
```tsx
// Aucun code nécessaire! Protection automatique via:
// 1. Middleware (server-side)
// 2. AdminLayout + useRequireAuth (client-side)

export default function UsersPage() {
  // Le composant ne s'affiche que si authentifié
  return <div>Protected content</div>;
}
```

### Utiliser l'Auth Context

```tsx
'use client';

import { useAdminAuth } from '@/contexts/AdminAuthContext';

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAdminAuth();

  return (
    <div>
      <p>User: {user?.email || user?.phone}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### API Calls avec Auth

```tsx
import { adminApi } from '@/lib/admin-api';

// Les tokens sont ajoutés automatiquement
const response = await adminApi.getUsers();
```

## 🔧 Configuration

### Variables d'environnement

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Token Storage

Tokens stockés dans localStorage:
- `admin_token` - JWT access token
- `admin_refresh_token` - JWT refresh token
- `admin_user` - User info (JSON)

## 🛡️ Sécurité

### Protection Multi-Niveaux

1. **Server-Side (Middleware)**
   - Validation JWT avant rendu
   - Vérification expiration
   - Vérification rôle admin
   - Redirects automatiques

2. **Client-Side (React)**
   - Auth context validation
   - useRequireAuth hook
   - Protected layout
   - Auto-redirect si non authentifié

### Token Validation

```typescript
// Vérifie:
// 1. Token existe
// 2. Token non expiré
// 3. Role = admin
const validation = validateAdminAuth();

if (!validation.isValid) {
  // redirect to login
}
```

### Token Refresh

```typescript
// Rafraîchir le token expiré
const { refreshAuth } = useAdminAuth();
await refreshAuth();
```

## 📱 Middleware Details

**Fichier:** `middleware.ts`

**Protège:**
- Tous les chemins `/admin/*`
- Sauf `/admin/login`

**Vérifie:**
1. Token présent (cookie ou header)
2. Token non expiré
3. Role = admin

**Redirects:**
- No token → `/admin/login?returnUrl=/admin/...`
- Expired → `/admin/login?returnUrl=/admin/...&reason=expired`
- Not admin → `/admin/login?error=unauthorized`

## 🎯 Structure Fichiers

```
apps/web/
├── lib/
│   ├── auth.ts              # Token/user storage, validation
│   └── auth-api.ts          # API calls (OTP, verify, refresh)
├── contexts/
│   └── AdminAuthContext.tsx # Auth context provider
├── hooks/
│   └── useRequireAuth.ts    # Protection hook
├── components/admin/
│   ├── AdminLayoutContent.tsx  # Protected layout wrapper
│   └── AdminHeader.tsx         # Header avec user menu & logout
├── app/admin/
│   ├── layout.tsx           # Root layout avec AuthProvider
│   ├── login/
│   │   ├── layout.tsx       # Login layout (pas de sidebar)
│   │   └── page.tsx         # Login page (2-step OTP)
│   └── ...                  # Protected pages
└── middleware.ts            # Route protection
```

## 🔄 Flow Complet

### Première Visite

```
1. User → /admin
2. Middleware → No token → Redirect /admin/login?returnUrl=/admin
3. Login page → Request OTP
4. User enters OTP → Verify → Store tokens
5. Redirect to returnUrl (/admin)
6. Middleware → Valid token → Allow
7. AdminLayoutContent → useRequireAuth → Valid → Render
```

### Visite Suivante (Token Valid)

```
1. User → /admin/users
2. Middleware → Check token → Valid & admin → Allow
3. AdminLayoutContent → useRequireAuth → Valid → Render
```

### Token Expiré

```
1. User → /admin/jobs
2. Middleware → Check token → Expired → Redirect /admin/login
3. Login again
```

## 🧪 Testing

### Test Login Flow

```bash
# 1. Navigate to admin
http://localhost:3000/admin

# 2. Redirected to login
http://localhost:3000/admin/login?returnUrl=/admin

# 3. Enter admin phone/email
# 4. Enter OTP from backend logs
# 5. Redirected to /admin
```

### Test Logout

```tsx
// Dans AdminHeader, cliquer sur avatar → Sign Out
// Tokens cleared, redirected to /admin/login
```

### Test Token Expiration

```typescript
// Dans console browser:
localStorage.removeItem('admin_token');
// Refresh page → Redirected to login
```

## 📚 API Endpoints Utilisés

Backend endpoints (déjà implémentés):

```
POST /auth/request-otp
Body: { phone: "..." } ou { email: "..." }
Response: { message: "OTP sent", expiresIn: 300 }

POST /auth/verify-otp
Body: { phone: "...", otp: "123456" }
Response: {
  accessToken: "...",
  refreshToken: "...",
  user: { id, email, phone, role }
}

POST /auth/refresh
Body: { refreshToken: "..." }
Response: {
  accessToken: "...",
  refreshToken: "..."
}
```

## ⚠️ Important

1. **Admin Role Required**: Seuls les users avec `role: 'admin'` peuvent se connecter
2. **Token Expiration**: Tokens expirent (durée définie backend)
3. **Refresh Token**: Utilisez refreshAuth() pour renouveler
4. **Logout**: Toujours appeler logout() pour nettoyer les tokens
5. **HTTPS**: En production, utilisez HTTPS pour sécuriser les tokens

## 🚧 Améliorations Futures

- [ ] Remember me (token persistant)
- [ ] 2FA optionnel
- [ ] Session timeout warning
- [ ] Auto-refresh avant expiration
- [ ] Rate limiting côté client
- [ ] Biometric auth (mobile)
- [ ] Security logs (failed attempts)
- [ ] Token rotation
- [ ] Cookies httpOnly (plus sécurisé que localStorage)
