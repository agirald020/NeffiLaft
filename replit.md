# NEFFI Laft Management System

## Overview
NEFFI Laft es una aplicación para el manejo de validaciones de Terceros y gestión de contrapartes para validación en listas restrictivas. Parte del ecosistema NeffiTrust.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Architecture Overview
The system uses a clean two-tier architecture:
- **Frontend**: React (Vite) served via a thin Express proxy on port 5000
- **Backend**: Spring Boot REST API on port 8080

All `/api/*` requests from the frontend are transparently proxied from port 5000 to Spring Boot on port 8080. No business logic exists in the Express layer.

### Workflows
- **"Spring Boot Backend"**: Starts the Spring Boot API server on port 8080 (`cd backend && mvn spring-boot:run -Dspring-boot.run.jvmArguments='-DAUTH_BYPASS=true'`)
- **"Start application"**: Starts the thin Express proxy + Vite frontend dev server on port 5000

### Frontend Architecture (`client/`)
React + TypeScript with modern patterns:
- **Component Library**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with glass morphism, gradients, and advanced animations
- **State Management**: React Query (@tanstack/react-query)
- **Authentication**: Custom auth context + hooks (`client/src/hooks/use-auth.ts`)
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite
- **Layout**: Header + collapsible left sidebar + main content area (`client/src/components/layout.tsx`)

### Key Frontend Components
- `client/src/components/header.tsx`: Top bar with module selector dropdown (Neffi Trust / Neffi Laft), notifications, user menu
- `client/src/components/sidebar.tsx`: Collapsible left sidebar with navigation (Inicio, Validar en Listas)
- `client/src/components/layout.tsx`: Wraps header + sidebar + main content
- `client/src/pages/home.tsx`: Home page with trust search and listing
- `client/src/pages/validate-clients.tsx`: Validate clients against restrictive lists by document type/number
- `client/src/pages/trust-details.tsx`: Trust detail view with tabs

### Express Proxy Layer (`server/`)
Minimal Node.js/Express server — NOT a full backend. Only two responsibilities:
1. Proxy all `/api/*` requests to Spring Boot (`http://localhost:8080`)
2. Serve the Vite dev server (development) or static build (production)

Key files:
- `server/index.ts`: Entry point — proxy setup + Vite integration
- `server/vite.ts`: Vite dev server integration (DO NOT MODIFY)

### Spring Boot Backend (`backend/`)
Full REST API in Java with multi-layer architecture:
- **Controller Layer** (`controller/`): REST controllers — Trust, Event, Contract, Auth, RestrictiveList
- **Service Layer** (`service/`): Business logic
- **Repository Layer** (`repository/`): In-memory data stores (InMemoryTrustRepository, InMemoryRestrictiveListRepository, etc.)
- **Model Layer** (`model/`): Domain entities (Trust, Event, Contract, RestrictiveListEntry)
- **DTO Layer** (`dto/`): Request/response data transfer objects with validation
- **Config Layer** (`config/`): SecurityConfig (Keycloak OAuth2 + AUTH_BYPASS), CorsConfig
- **Security**: Spring Security + OAuth2 Resource Server for Keycloak JWT validation
- **AUTH_BYPASS mode**: Set via `-DAUTH_BYPASS=true` JVM arg; returns dev user without Keycloak

#### Spring Boot Endpoints
- `GET /api/auth/user` — current user info
- `GET/POST /api/laft` — Trust management
- `GET/POST /api/laft/{id}/events` — event management
- `GET/POST /api/laft/{trustId}/contract` — contract management
- `POST /api/laft/validate` — validate clients against restrictive lists (accepts documentType, documentNumber)

### Shared Types (`shared/`)
- `shared/schema.ts`: TypeScript types used by both frontend and (previously) backend. Frontend imports types like `Trust`, `Event`, `Contract`, `EventWithUser` from here.

### Authentication
- **Development**: AUTH_BYPASS=true → Spring Boot returns a dev user without Keycloak
- **Production**: Keycloak OAuth2 JWT validation via Spring Security
- Environment variables needed for production:
  - `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`

### Modern Design System
- **Visual Language**: Glass morphism effects, gradient backgrounds
- **Color Palette**: Red (#dc2626) as primary, gray as secondary, black for backgrounds
- **Key CSS Classes**:
  - `.glass-card`: Glass morphism for dialogs
  - `.btn-gradient-primary/.btn-gradient-secondary`: Gradient buttons
  - `.input-modern`: Form input styling
  - `.shadow-modern/.shadow-modern-xl`: Shadow effects
  - `.bg-gradient-primary/.bg-gradient-secondary`: Background gradients

### UI Libraries
- Radix UI, Lucide React, Tailwind CSS, Uppy (file uploads)

### Development Tools
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Static type checking across the entire codebase

### Security Features
- **SSO Authentication**: Enterprise-grade authentication through Keycloak
- **Session Security**: HTTP-only cookies with secure session management
- **Route Protection**: Comprehensive protection for both API and frontend routes
- **Role-Based Access**: Support for user roles and permissions through Keycloak
- **CSRF Protection**: Built-in protection against cross-site request forgery

### Entorno de Desarrollo
- **Correr desde vs code en Windows**: npx cross-env NODE_ENV=development tsx server/index.ts
- **Local Development (Windows)** - Run each in a separate terminal:
  1. `cd backend && mvn spring-boot:run -Dspring-boot.run.jvmArguments='-DAUTH_BYPASS=true'`
  2. `npx cross-env NODE_ENV=development AUTH_BYPASS=false tsx server/index.ts`
