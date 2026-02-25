# NEFFI Laft Management System

## Overview
NEFFI Laft es una aplicación para el manejo de validaciones de Terceros y gestión de contrpartes para validacion en listas restrictivas

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Architecture Overview
The system uses a clean two-tier architecture:
- **Frontend**: React (Vite) served via a thin Express proxy on port 5010
- **Backend**: Spring Boot REST API on port 8091

All `/api/*` requests from the frontend are transparently proxied from port 5010 to Spring Boot on port 8091. No business logic exists in the Express layer.

### Workflows
- **"Spring Boot Backend"**: Starts the Spring Boot API server on port 8091 (`cd backend && mvn spring-boot:run -Dspring-boot.run.jvmArguments='-DAUTH_BYPASS=true'`)
- **"Start application"**: Starts the thin Express proxy + Vite frontend dev server on port 5010

### Frontend Architecture (`client/`)
React + TypeScript with modern patterns:
- **Component Library**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with glass morphism, gradients, and advanced animations
- **State Management**: React Query (@tanstack/react-query)
- **Authentication**: Custom auth context + hooks (`client/src/hooks/use-auth.ts`)
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite

### Express Proxy Layer (`server/`)
Minimal Node.js/Express server — NOT a full backend. Only two responsibilities:
1. Proxy all `/api/*` requests to Spring Boot (`http://localhost:8091`)
2. Serve the Vite dev server (development) or static build (production)

Key files:
- `server/index.ts`: Entry point — proxy setup + Vite integration
- `server/vite.ts`: Vite dev server integration (DO NOT MODIFY)

### Spring Boot Backend (`backend/`)
Full REST API in Java with multi-layer architecture:
- **Controller Layer** (`controller/`): REST controllers — Trust, Event, Contract, Auth
- **Service Layer** (`service/`): Business logic
- **Repository Layer** (`repository/`): In-memory data stores
- **Model Layer** (`model/`): Domain entities (Trust, Event, Contract)
- **DTO Layer** (`dto/`): Request/response data transfer objects with validation
- **Config Layer** (`config/`): SecurityConfig (Keycloak OAuth2 + AUTH_BYPASS), CorsConfig
- **Security**: Spring Security + OAuth2 Resource Server for Keycloak JWT validation
- **AUTH_BYPASS mode**: Set via `-DAUTH_BYPASS=true` JVM arg; returns dev user without Keycloak

#### Spring Boot Endpoints
- `GET /api/auth/user` — current user info
- `GET/POST /api/laft` — Gestion de validaciones en listas
- `GET/POST /api/laft/{id}/events` — event management

### Shared Types (`shared/`)
- `shared/schema.ts`: TypeScript types used by both frontend and (previously) backend. Frontend imports types like `Trust`, `Event`, `Contract`, `EventWithUser` from here.

### Authentication
- **Development**: AUTH_BYPASS=true → Spring Boot returns a dev user without Keycloak
- **Production**: Keycloak OAuth2 JWT validation via Spring Security
- Environment variables needed for production:
  - `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`

### Modern Design System
Implemented in September 2025:
- **Visual Language**: Glass morphism effects, gradient backgrounds
- **Color Palette**: Blue/purple theme with CSS custom properties
- **Key CSS Classes**:
  - `.glass-card`: Glass morphism for dialogs
  - `.btn-gradient-primary/.btn-gradient-secondary`: Gradient buttons
  - `.input-modern`: Form input styling
  - `.shadow-modern/.shadow-modern-xl`: Shadow effects
  - `.bg-gradient-primary/.bg-gradient-secondary`: Background gradients

### UI Libraries
- Radix UI, Lucide React, Tailwind CSS, Uppy (file uploads)

#### Key Design Classes:
- `.glass-card`: Glass morphism effects for dialogs and prominent cards
- `.btn-gradient-primary/.btn-gradient-secondary`: Modern gradient buttons with hover animations
- `.input-modern`: Consistent styling for all form inputs with advanced focus states
- `.shadow-modern/.shadow-modern-xl`: Contemporary shadow effects
- `.bg-gradient-primary/.bg-gradient-secondary`: Background gradients for cards and surfaces

### UI/UX Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Lucide React**: Modern icon library
- **Tailwind CSS**: Utility-first CSS framework with custom design system extensions
- **Uppy**: Modular file uploader with dashboard interface

### Development Tools
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Static type checking across the entire codebase
- **Replit Integration**: Development environment optimizations and error handling

### Security Features
- **SSO Authentication**: Enterprise-grade authentication through Keycloak
- **Session Security**: HTTP-only cookies with secure session management
- **Route Protection**: Comprehensive protection for both API and frontend routes
- **Role-Based Access**: Support for user roles and permissions through Keycloak
- **CSRF Protection**: Built-in protection against cross-site request forgery

The system is designed for deployment on Replit with specific configurations for the platform's infrastructure, including sidecar services for cloud storage authentication and development-specific tooling. For production deployment, ensure proper Keycloak server configuration and Redis session storage for scalability.

### Entorno de Desarrollo
- **Correr desde vs code en Windows**: npx cross-env NODE_ENV=development tsx server/index.ts### Local Development (Windows)
Run each in a separate terminal:
1. `cd backend && mvn spring-boot:run -Dspring-boot.run.jvmArguments='-DAUTH_BYPASS=true'`
2. `npx cross-env NODE_ENV=development AUTH_BYPASS=false tsx server/index.ts`