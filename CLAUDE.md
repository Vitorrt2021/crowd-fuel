# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a crowdfunding platform built with Vite, React, TypeScript, and Supabase. The application allows users to create and support crowdfunding campaigns ("apoios" in Portuguese).

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with CSS-in-JS support
- **Database/Backend**: Supabase (PostgreSQL)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation

## Essential Commands

```bash
# Install dependencies
npm install

# Run development server (port 8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Project Structure

The application follows a standard React SPA structure with the following key directories:

- `/src/pages/` - Route components for each page
  - `Index.tsx` - Entry point redirecting to Home
  - `Home.tsx` - Main landing page
  - `DetalhesApoio.tsx` - Campaign details page
  - `CriarApoio.tsx` - Create new campaign
  - `MeusApoios.tsx` - User's campaigns dashboard
  - `ApoioSucesso.tsx` - Success page after support
  - `NotFound.tsx` - 404 page

- `/src/components/` - Reusable React components
  - `/ui/` - shadcn/ui components library

- `/src/integrations/supabase/` - Supabase client and type definitions
  - `client.ts` - Supabase client configuration
  - `types.ts` - Auto-generated TypeScript types from database schema

- `/supabase/` - Supabase configuration and migrations
  - `/migrations/` - SQL migration files

## Database Schema

The application uses two main tables:

1. **apoios** - Crowdfunding campaigns
   - `id`: UUID primary key
   - `titulo`: Campaign title
   - `descricao`: Campaign description
   - `meta_valor`: Funding goal amount
   - `valor_atual`: Current raised amount
   - `imagem_url`: Campaign image URL
   - `handle_infinitepay`: Payment handler identifier
   - `status`: Campaign status
   - `user_id`: Creator's user ID

2. **apoiadores** - Campaign supporters
   - `id`: UUID primary key
   - `apoio_id`: Foreign key to apoios table
   - `nome`: Supporter's name
   - `email`: Supporter's email
   - `valor`: Support amount
   - `transaction_nsu`: Transaction identifier

## Routing Structure

Routes are defined in `src/App.tsx`:
- `/` - Home page
- `/apoio/:id` - Campaign details
- `/criar-apoio` - Create new campaign
- `/meus-apoios` - User's campaigns
- `/apoio-sucesso` - Support success page

## Development Workflow

1. The application uses path aliases configured in `vite.config.ts`:
   - `@/` maps to `./src/`

2. Environment variables are prefixed with `VITE_` and stored in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`

3. The project uses ESLint for code quality with TypeScript support. Note that `@typescript-eslint/no-unused-vars` is disabled in the configuration.

4. The application is configured to run on port 8080 in development mode with IPv6 support (host: "::").

## Important Patterns

- All pages are wrapped in QueryClientProvider for React Query support
- Toasts and notifications use both shadcn/ui toaster and sonner
- The application is built with internationalization in mind (Portuguese language)
- Payment integration uses InfinitePay handles stored in the database