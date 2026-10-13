This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication & State Architecture

The frontend connects to the FastAPI backend using **Zustand** stores and a centralized **Axios** client configured with HTTP-only cookie support (`withCredentials: true`).

- **Axios client** (`lib/api/client.ts`): Base URL routing through `/api/v1` (with same-origin Next.js rewrites to the FastAPI backend) or direct `NEXT_PUBLIC_API_URL`, equipped with standardized error parsing for FastAPI validation messages.
- **Auth Store** (`lib/stores/auth-store.ts`): Zustand store managing user authentication state (`user`, `isAuthenticated`, `isLoading`, `error`). Supports `signIn`, `signUp`, `checkAuth`, `signOut`, and `setUser`.
- **Onboarding Store** (`lib/stores/onboarding-store.ts`): Zustand store synchronizing multi-step onboarding progress with the backend API.

### Authentication Endpoints
- `/sign-in`: Authenticates email and password via `POST /api/v1/auth/signin/`.
- `/sign-up`: Creates account via `POST /api/v1/auth/signup/` (username 3–18 characters, password min 8 characters).
- Session verification: `GET /api/v1/auth/me/` checks active session and whether the user is onboarded.
- Sign out: `POST /api/v1/auth/logout/` (with `GET` fallback).

Checks: `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.

## Onboarding Integration

The onboarding flow (`/onboarding`) connects directly to backend endpoints:
1. **Status Hydration** (`GET /api/v1/onboarding/`): Loads previously saved profile details, goals, preferences, and current onboarding step when authenticated.
2. **Profile Step** (`PATCH /api/v1/onboarding/profile/`): Saves date of birth, height (cm), and gender.
3. **Goal Step** (`PATCH /api/v1/onboarding/goals/`): Saves primary wellness and shopping goal (`balance`, `energy`, `weight`).
4. **Preferences Step** (`PATCH /api/v1/onboarding/preferences/`): Saves dietary preferences (with custom input) and allergen selections.
5. **Completion** (`POST /api/v1/onboarding/complete/`): Finalizes onboarding, flags `is_onboarded: true` on the account, and transitions smoothly to the dashboard.
keyboard focus, and inline validation are supported.

## Shopping workspace preview

- `/dashboard`: personal overview, current shopping goal, recent sample products,
  current basket total, and camera entry point.
- `/profile`: editable demo name, email, shopping goal, and dietary preference, plus a sample Free plan. Save and cancel controls support validation and browser-session persistence.
- `/chat`: contextual demo conversation with suggested prompts and sample replies.
- `/cart`: quantity controls, product removal, calculated totals, an empty state,
  and a copyable shopping list.

These pages share in-memory mock data through a route-group layout. Navigation
between them retains the cart. Refreshing resets the cart; saved profile details and
preferences persist in sessionStorage for the current browser tab. Storage failures
keep edits available and show an error. Account updates and live billing are not connected.
The demo profile is independent of onboarding and authenticated account data.
Successful authentication and the onboarding summary link to the dashboard.

The scanner requests camera access only after clicking **Open camera**, releases
the stream when closed, and handles unavailable cameras and denied permissions.
Camera access requires localhost or HTTPS. **Try a sample scan** previews product
results and adding to cart; actual barcode/image recognition is not connected.
Chat uses local, deterministic sample replies, not a live AI service. Product
illustrations, nutrition, prices (USD), and activity are illustrative.

The workspace reuses Figtree and the existing pastel palette, with Phosphor icons,
responsive desktop/sidebar and mobile/bottom navigation, native modal focus
management, and the global reduced-motion rules.
