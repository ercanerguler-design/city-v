# CityV - AI Crowd Analysis Platform

## Project Overview
CityV is a comprehensive crowd monitoring and urban analytics platform combining Next.js web application, ESP32-CAM IoT devices, and real-time data processing. The platform serves three user types: regular users (crowd reports, location tracking), businesses (campaign management, analytics), and admins (system management).

## Tech Stack & Architecture

### Frontend (Next.js 15 + React 19)
- **Framework**: Next.js 15 with App Router (`app/` directory), Turbopack enabled
- **State Management**: Zustand stores in `store/` (auth, filters, location) and `lib/stores/` (analytics, gamification, premium)
- **UI Components**: Located in `components/` organized by feature (Auth, Business, Map, ESP32, etc.)
- **Styling**: Tailwind CSS 4, Framer Motion for animations
- **Maps**: React Leaflet with dynamic imports (SSR disabled for map components)

### Backend & Database
- **Database**: Vercel Postgres (Neon) - schemas in `database/*.sql`
  - Main: `users`, `beta_applications`, `transport_*` tables
  - Business: `business_users`, `business_profiles`, `business_campaigns`, `push_notifications`
  - IoT: `iot_crowd_analysis`, `iot_devices`, `iot_vehicle_arrivals`
- **API Routes**: `app/api/` with route handlers (GET/POST patterns)
- **Database Access**: `lib/db.ts` provides connection pool wrapper
- **Cache**: Vercel KV for notifications and real-time data

### IoT Integration (ESP32-CAM)
- **Firmware**: `esp32-cam-cityv.ino` - Arduino C++ with WiFiManager
- **Features**: Human detection, crowd analysis, live streaming
- **Endpoints**: `/api/esp32/data`, `/api/iot/crowd-analysis`
- **Components**: `components/ESP32/`, `components/Camera/`

## Project Structure Patterns

### Component Organization
```
components/
  Feature/              # Feature-specific components (Business, Admin, etc.)
  ui/                   # Reusable UI components (LocationCard, FilterPanel)
  Layout/               # Headers, navigation
```

### Store Pattern (Zustand)
All stores use `create()` from zustand with optional persistence:
```typescript
import { create } from 'zustand';
export const useMyStore = create<MyState>()((set, get) => ({
  // state and actions
}));
```
Access in components: `const { data, action } = useMyStore();`

### API Route Pattern
```typescript
import { NextRequest } from 'next/server';
export async function GET(request: NextRequest) {
  // Query database via lib/db.ts
  // Return NextResponse.json()
}
```

### Dynamic Imports for Client Components
Map and heavy components use dynamic imports to avoid SSR:
```typescript
const MapView = dynamic(() => import('@/components/Map/MapViewEnhanced'), {
  ssr: false,
  loading: () => <LoadingComponent />
});
```

## Critical Workflows

### Development
```powershell
npm install --legacy-peer-deps  # Required for dependency resolution
npm run dev                      # Starts dev server with Turbopack
```

### Database Setup
Run setup scripts in order:
1. `database/setup.sql` - Core tables
2. `database/createBusinessTables.sql` - Business features
3. `database/setupBusinessDatabase.js` - Demo data

### Building
- **Build**: `npm run build` (uses Turbopack, ignores TS/ESLint errors - see `next.config.ts`)
- **Deployment**: Vercel (see `vercel.json` for custom build commands)

## Authentication & User System

### Google OAuth Flow
1. Frontend: `components/Auth/AuthModal.tsx` renders Google Sign-In button
2. Backend: `/api/auth/google/route.ts` validates JWT and creates/updates user in Postgres
3. Store: `store/authStore.ts` manages auth state with membership tiers (free, premium, business, enterprise)
4. Env vars: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `POSTGRES_URL`

### Membership System
- Tiers: free, premium, business, enterprise
- Features tracked in `authStore.ts` membershipBenefits
- Premium features: AI chat limits, advanced analytics, IoT monitoring

## Key Feature Areas

### Business Dashboard (`app/business/page.tsx`)
- Campaign creation: `components/Business/CreateCampaignModal.tsx`
- Push notifications: Stored in Vercel KV, displayed via `components/Notifications/CampaignNotifications.tsx`
- ESP32 camera integration: `components/Camera/ESP32CameraStream.tsx`
- Authentication: JWT in localStorage (`business_token`)

### Map & Location System
- Main view: `app/page-professional.tsx` → `components/Map/MapViewEnhanced.tsx`
- Location data: `lib/ankaraData.ts` (static), `lib/googlePlacesAPI.ts` (dynamic)
- Crowd levels: `types/index.ts` defines `CrowdLevel` type
- Filters: `store/filterStore.ts` manages categories, crowd levels, search

### Real-time Features
- Live crowd: `components/RealTime/LiveCrowdSidebar.tsx`
- Socket.io: `store/socketStore.ts` (mock implementation)
- Transport: `/api/transport/*` routes for public transit data

### Gamification & Analytics
- Points/badges: `lib/stores/gamificationStore.ts`
- User analytics: `lib/stores/analyticsStore.ts`
- Recommendations: `lib/stores/recommendationStore.ts`

## Environment Variables
Required in `.env.local` or Vercel:
- `DATABASE_URL` - Postgres connection string
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `RESEND_API_KEY` - Email service (optional for beta invites)

## Important Conventions

### Imports
- Use `@/` path alias (configured in `tsconfig.json`)
- Example: `import { Location } from '@/types';`

### Type Safety
- TypeScript strict mode enabled
- Build ignores errors (fix post-deployment)
- Core types in `types/index.ts`

### Database Queries
Always use parameterized queries via `lib/db.ts`:
```typescript
import { query } from '@/lib/db';
const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
```

### Client Components
Mark with `'use client';` when using hooks, browser APIs, or event handlers

### Error Handling
- Use `try/catch` in API routes
- Return appropriate HTTP status codes
- Console log errors with emoji prefixes (📋 query, ❌ error)

## Testing
- Jest configured (`jest.config.ts`, `jest.setup.ts`)
- Tests in `__tests__/` directory
- Run: Terminal shows Jest watcher available

## ESP32 Integration Notes
- WiFiManager for easy setup (AP_SSID: "CityV-AI-Camera")
- Posts crowd analysis to `/api/iot/crowd-analysis`
- Real-time display in `components/ESP32/RealTimeAnalytics.tsx`
- Docs: `ESP32-*.md` files contain setup guides

## Common Pitfalls
1. **Map components**: Always use dynamic import with `ssr: false`
2. **Dependencies**: Use `--legacy-peer-deps` for npm install
3. **Stores**: Import from correct location (`store/` vs `lib/stores/`)
4. **Database**: Ensure connection pool is properly released
5. **Google Auth**: Verify authorized origins match deployment URL

## Documentation Files
- `BUSINESS_FEATURES_SUMMARY.md` - Complete business feature guide
- `DEPLOYMENT_READY.md` - Production deployment checklist
- `ESP32-*.md` - IoT device setup and troubleshooting
- `*_TEST.md` - Feature testing guides
