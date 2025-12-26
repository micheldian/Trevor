# Trevor Web - Frontend Application

Next.js 14 frontend application for the Trevor agricultural worker-employer matching platform.

## 🏗️ Architecture

### Tech Stack

- **Next.js 14** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **Axios** for API calls
- **Lucide React** for icons

### Project Structure

```
apps/web/
├── app/                      # Next.js App Router pages
│   ├── dashboard/           # Employer dashboard
│   ├── login/               # OTP authentication
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home (redirect logic)
│   └── globals.css          # Global styles
├── components/
│   ├── dashboard/           # Dashboard components
│   │   └── DashboardLayout.tsx
│   ├── jobs/                # Job-related components
│   │   └── JobCreateForm.tsx
│   └── profiles/            # Profile components
│       └── ProfileCard.tsx
├── lib/
│   └── api-client.ts        # API client with auth
├── public/                  # Static assets
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Trevor API running on `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Development

```bash
# Run development server
npm run dev

# Open http://localhost:3001
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📱 Features

### 1. Authentication (OTP Login)

**File:** `app/login/page.tsx`

Two-step OTP authentication:
1. Enter phone number → receive SMS code
2. Enter 6-digit code → auto-login and redirect

**Features:**
- Phone number formatting (handles +33 and 06 formats)
- Loading states and error handling
- Auto-redirect based on profile type (employer/worker)
- Token storage in localStorage

**API Endpoints:**
- `POST /auth/send-otp` - Send OTP code
- `POST /auth/verify-otp` - Verify and login

### 2. Employer Dashboard

**File:** `app/dashboard/page.tsx`

Complete employer workflow:
- Create and manage missions
- Search available worker profiles
- Contact candidates via WhatsApp/Phone
- Track mission statuses

**Stats Cards:**
- Active missions count
- Draft missions count
- Available profiles count

**Mission Management:**
- List all missions with status badges
- Click to select mission and search profiles
- Publish draft missions
- View mission details

### 3. Job Creation Form

**File:** `components/jobs/JobCreateForm.tsx`

Modal form for creating missions with:

**Required Fields:**
- Title, description, culture
- Date type (this week, next week, specific date)
- Time slot (morning, afternoon, day, evening)
- Number of people needed
- Location (address, city, postal code)

**Optional Fields:**
- Tags (comma-separated)
- Hourly rate and estimated hours
- Required skills (comma-separated)

**Validation:**
- React Hook Form with Zod schema
- Real-time error display
- Loading states

**API:** `POST /jobs`

### 4. Profile Search & Listing

**Features:**
- Search by location radius (default 50km)
- Filter by skills
- Auto-filter by job availability requirements
- Real-time search with loading state

**Search Parameters:**
```typescript
{
  latitude: number,
  longitude: number,
  radius: number,        // in km
  skills?: string[],
  availability?: {
    dateType: string,
    timeSlot: string,
  }
}
```

**API:** `POST /search/profiles`

### 5. Profile Card Component

**File:** `components/profiles/ProfileCard.tsx`

Worker profile card with:

**Display:**
- Name, location, rating (stars)
- Experience years, completed missions, reliability score
- Skills badges (top 4 + count)
- Bio text (truncated)
- Availability indicator

**Actions:**
- **WhatsApp Button:** Creates match + opens WhatsApp with pre-filled message
- **Call Button:** Opens phone dialer
- Loading and contacted states

**WhatsApp Integration:**
```javascript
// Auto-creates match when clicked
const result = await apiClient.createMatch(jobId, profileId);
// Opens: https://wa.me/+33612345678?text=Bonjour...
window.open(result.whatsappLink, '_blank');
```

**API:** `POST /matches` - Creates match and returns WhatsApp link

## 🎨 Design System

### Colors

Primary green theme defined in `tailwind.config.ts`:
- `primary-50` to `primary-900` (green shades)

### Custom Components

Defined in `globals.css`:

**Buttons:**
```css
.btn-primary     /* Green filled button */
.btn-secondary   /* White outlined button */
```

**Inputs:**
```css
.input-field     /* Styled input with focus ring */
```

**Cards:**
```css
.card            /* White card with shadow */
```

### Usage Examples

```tsx
// Primary button
<button className="btn-primary">Click me</button>

// Input field
<input className="input-field" placeholder="Enter text" />

// Card container
<div className="card">Content here</div>
```

## 🔌 API Client

**File:** `lib/api-client.ts`

Centralized API client with:

### Features

1. **Auto Token Management**
   - Adds `Authorization: Bearer <token>` to all requests
   - Stores token in localStorage
   - Auto-redirects to login on 401

2. **User Profile Storage**
   - Stores profile after login
   - Retrieves profile for routing logic

3. **Error Handling**
   - Intercepts 401 errors
   - Auto-clears tokens on logout
   - Returns error responses

### Available Methods

**Auth:**
```typescript
apiClient.sendOTP(phone: string)
apiClient.verifyOTP(phone: string, code: string)
apiClient.logout()
```

**Jobs:**
```typescript
apiClient.createJob(jobData)
apiClient.getMyJobs()
apiClient.getJob(id)
apiClient.publishJob(id)
```

**Profiles:**
```typescript
apiClient.searchProfiles(params)
apiClient.getProfile(id)
```

**Matches:**
```typescript
apiClient.createMatch(jobId, candidateId)
apiClient.getJobMatches(jobId)
apiClient.confirmMatch(matchId, availabilityId)
```

**Reviews:**
```typescript
apiClient.createReview(reviewData)
apiClient.getProfileReviews(profileId)
```

### Usage Example

```typescript
'use client';

import { apiClient } from '@/lib/api-client';

export default function MyComponent() {
  const handleSearch = async () => {
    try {
      const profiles = await apiClient.searchProfiles({
        latitude: 48.5734,
        longitude: 7.7521,
        radius: 50,
      });
      console.log(profiles);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return <button onClick={handleSearch}>Search</button>;
}
```

## 🔒 Authentication Flow

```
1. User enters phone → POST /auth/send-otp
2. User enters code → POST /auth/verify-otp
3. API returns { access_token, user, profile }
4. Client stores token + profile in localStorage
5. All subsequent requests include token
6. On 401 error → clear storage + redirect to /login
```

## 📋 Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home - Auto redirect | No |
| `/login` | OTP authentication | No |
| `/dashboard` | Employer dashboard | Yes (employer) |
| `/profile` | Worker profile (future) | Yes (worker) |

## 🎯 Key User Flows

### Employer: Post Job & Find Workers

```
1. Login with OTP
2. Dashboard → Click "Nouvelle mission"
3. Fill job form → Submit (creates draft)
4. Click "Publier" to publish job
5. Select job from list
6. Search profiles (auto-filters by job criteria)
7. Click "WhatsApp" on profile card
8. Match created + WhatsApp opens
9. Chat directly with candidate
```

### Profile Card Interaction

```
1. Employer sees profile card with stats
2. Clicks "WhatsApp" button
3. API creates Match record
4. Returns WhatsApp link: wa.me/+33...?text=...
5. Opens in new tab/WhatsApp app
6. Button shows "Contacté" state
```

## 🚧 Future Enhancements

- [ ] Worker profile page (`/profile`)
- [ ] Worker availability management
- [ ] Match history and status tracking
- [ ] Review system UI
- [ ] Real-time notifications
- [ ] Image upload for profiles
- [ ] Advanced filtering (multiple jobs, date ranges)
- [ ] Map view for profile search
- [ ] Mobile app (React Native)

## 🐛 Known Issues

- Geocoding not implemented (uses hardcoded coordinates)
- No image upload functionality yet
- Profile search requires job selection
- No pagination for large result sets

## 📞 Support

For issues or questions, contact the Trevor development team.
