# MRCET ExamPrep Hub

Production-ready exam preparation platform for students, faculty, and administrators.


## Overview

MRCET ExamPrep Hub is a full-stack web application that helps students prepare for exams using verified previous-year papers, analytics, and AI-assisted search. The platform includes strict role-based access for students, faculty, and admins, with secure authentication and moderated content workflows.

## Core Capabilities

- Student signup with email verification and auto-login on verification
- Student profile management (name, roll number, branch, year)
- Role-based dashboards for Student, Faculty, and Admin
- Faculty paper review and moderation pipeline
- Approved paper discovery, filtering, and downloads
- Bookmarking and user notifications
- AI search interface for question-paper exploration
- Responsive UI with reusable component system

## Tech Stack

- Frontend: React 18, TypeScript, Vite
- UI: Tailwind CSS, shadcn/ui, Radix UI, Framer Motion
- Routing: React Router v6
- State/Data: TanStack React Query
- Backend: Supabase (Auth, Postgres, Storage, RLS)
- Testing: Vitest + Testing Library
- Linting: ESLint

## Project Structure

```text
src/
  components/          Reusable UI and feature components
  context/             Auth context and session handling
  hooks/               Shared React hooks
  integrations/        Supabase client and generated types
  pages/               Route-level pages
supabase/
  migrations/          Database schema and updates
  functions/           Edge functions (admin/faculty automation)
```

## Roles and Access Model

- Student:
  - Sign up, verify email, access approved papers, bookmark, manage profile
- Faculty:
  - Sign in to faculty dashboard, review and manage paper submissions
- Admin:
  - Manage users, roles, faculty accounts, and platform operations

Authorization is enforced through Supabase RLS policies and role checks in app routes.

## Authentication and Verification Flow

1. Student completes signup form.
2. Verification email is sent.
3. Student clicks verification link.
4. User is auto-authenticated in the app.
5. Profile fields from signup metadata are available in profile/dashboard/navbar.

## Local Development

### 1. Prerequisites

- Node.js 18+
- npm 9+
- Supabase project (URL + anon publishable key)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create `.env` from `.env.example`:

```bash
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-publishable-key"
```

### 4. Apply database migrations

If you are using Supabase CLI:

```bash
supabase db push
```

### 5. Start development server

```bash
npm run dev
```

App default URL: `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint checks
- `npm run test` - Run unit tests once
- `npm run test:watch` - Run tests in watch mode

## Production Build and Deployment

### Build

```bash
npm run build
```

### Deploy

Deploy the `dist/` output to any static hosting provider (Vercel, Netlify, Cloudflare Pages, S3 + CDN, etc.).

### Required production configuration

- Configure all `VITE_SUPABASE_*` environment variables in hosting platform
- Set Supabase Auth redirect URLs to production domain
- Ensure DB migrations are applied before go-live
- Keep RLS enabled for protected tables
- Monitor edge functions and auth logs

## Database and Supabase Notes

- Schema and policies are versioned in `supabase/migrations/`
- Auth profile and role records are created via DB triggers
- Additional sync migration ensures signup metadata is persisted to `profiles`
- Storage bucket `papers` is used for paper assets

## Quality and Reliability

- Type-safe DB integration via generated Supabase types
- Route-level protection for authenticated/authorized views
- Query caching and retries via React Query
- Global error boundary and loading overlays for resilient UX

## Security Checklist

- Use HTTPS in production
- Never expose service role keys in frontend
- Restrict admin operations by role
- Review RLS policies before each release
- Rotate keys/secrets periodically

## Troubleshooting

- "Supabase is not configured" banner:
  - Check `.env` values and restart dev server
- Verification link not logging in:
  - Verify Supabase redirect URL configuration
- Missing profile fields after signup:
  - Confirm latest migrations are applied

## License

This project is proprietary unless you add an explicit open-source license.

## Author

Developed by **Harish Reddy Yarramada**.
