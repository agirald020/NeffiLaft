# NeffiLaft - Validación de Terceros en Listas Restrictivas

## Overview
NeffiLaft is a web application for third-party validation against proprietary restrictive lists. It is part of the NeffiTrust ecosystem and shares SSO authentication via Keycloak.

## Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js (Node.js) with Keycloak OIDC SSO
- **Authentication**: Keycloak SSO (OpenID Connect authorization code flow)

## Key Features
1. **SSO Authentication** - Keycloak-based SSO login/logout with session management
2. **Individual Third-Party Validation** - Search by name or cedula (document number)
3. **Bulk Upload** - Excel file upload for mass third-party validation
4. Validation logic against restrictive lists is pending implementation

## Project Structure
```
client/src/
  App.tsx                    - Main app with auth guard and layout
  components/
    app-sidebar.tsx          - Navigation sidebar with user info
    theme-provider.tsx       - Dark/light theme context
    theme-toggle.tsx         - Theme toggle button
    ui/                      - shadcn/ui components
  hooks/
    use-auth.ts              - Keycloak auth hook
  pages/
    login.tsx                - SSO login page
    validation.tsx           - Third-party validation page
    not-found.tsx            - 404 page

server/
  index.ts                   - Express server setup
  auth.ts                    - Keycloak OIDC auth middleware
  routes.ts                  - API routes (search, upload)
  storage.ts                 - In-memory storage

shared/
  schema.ts                  - Shared types and Zod schemas
```

## Environment Variables
- `KEYCLOAK_URL` - Keycloak server URL
- `KEYCLOAK_REALM` - Keycloak realm name
- `KEYCLOAK_CLIENT_ID` - Keycloak client ID for NeffiLaft
- `KEYCLOAK_CLIENT_SECRET` (secret) - Keycloak client secret
- `SESSION_SECRET` (secret) - Express session secret

## Running
- `npm run dev` - Starts development server (Express + Vite) on port 5000
