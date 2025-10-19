# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aurora is a full-stack social platform with real-time chat, geolocation features, and user profiles. It's built as a monorepo with a Next.js frontend and NestJS backend, designed for social networking with location-based features.

**Key Technologies:**
- Frontend: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- Backend: NestJS, TypeScript, TypeORM
- Database: PostgreSQL with PostGIS extension for geolocation
- Real-time: Socket.IO for WebSocket connections
- State: Zustand for client state, React Query for server state

## Development Commands

### Root Level (Monorepo)
```bash
# Install all dependencies
npm install

# Run both frontend and backend in development mode
npm run dev

# Build both workspaces
npm run build

# Lint all workspaces
npm run lint
```

### Frontend (Next.js)
```bash
# Run development server (http://localhost:3000)
npm run dev --workspace=frontend

# Build for production
npm run build --workspace=frontend

# Start production server
npm run start --workspace=frontend

# Lint frontend code
npm run lint --workspace=frontend
```

### Backend (NestJS)
```bash
# Run development server with watch mode (http://localhost:4000)
npm run start:dev --workspace=backend

# Build backend
npm run build --workspace=backend

# Run production server
npm run start:prod --workspace=backend

# Run tests
npm run test --workspace=backend
npm run test:watch --workspace=backend
npm run test:cov --workspace=backend
npm run test:e2e --workspace=backend

# Lint backend code
npm run lint --workspace=backend

# Format backend code
npm run format --workspace=backend
```

### Database & Migrations
```bash
# Start PostgreSQL with PostGIS (required before running backend)
docker-compose up -d postgres

# Generate a new migration
npm run migration:generate --workspace=backend -- src/migrations/MigrationName

# Run migrations
npm run migration:run --workspace=backend

# Revert last migration
npm run migration:revert --workspace=backend

# Seed test data with locations
npm run seed:locations --workspace=backend
```

## Architecture

### Monorepo Structure
This is a workspace-based monorepo with two main workspaces:
- `frontend/` - Next.js application
- `backend/` - NestJS API server

Shared dependencies (date-fns, lucide-react, zustand) are hoisted to the root level.

### Backend (NestJS)

**Module Organization:**
- `auth/` - JWT authentication with Passport, role-based access (AdminGuard, JwtAuthGuard)
- `users/` - User management including profiles, gallery photos, and geolocation
- `chat/` - Real-time messaging via WebSocket gateway and REST endpoints
- `waitlist/` - Waitlist management for user onboarding
- `admin/` - Admin-only features (user role management)
- `config/` - TypeORM configuration and Multer (file upload) config
- `database/seeds/` - Database seeding scripts

**Database Schema:**
- Uses TypeORM with entities in `*/entities/` directories
- PostGIS geometry type for location data (SRID 4326 for GPS coordinates)
- Main entities: User, Message, Conversation, GalleryPhoto, Waitlist
- User entity includes both basic fields and escort-specific fields (role-based)

**Real-time Communication:**
- Socket.IO gateway in `chat/chat.gateway.ts`
- WebSocket events: `sendMessage`, `loadMessages`
- Broadcasts messages to conversation rooms: `message:${conversationId}`

**File Uploads:**
- Multer configuration in `config/multer.config.ts`
- Static files served from `/uploads/` directory
- Used for profile pictures and gallery photos

### Frontend (Next.js)

**Directory Structure:**
- `app/` - Next.js App Router pages (file-based routing)
- `components/` - Reusable React components
- `contexts/` - React contexts (SocketContext)
- `hooks/` - Custom React hooks (useChat)
- `services/` - API service layers for backend communication
- `store/` - Zustand stores (authStore, chatStore)
- `types/` - TypeScript type definitions
- `constants/` - Constants and configuration

**State Management:**
- Zustand for global client state (auth, chat)
- React Query (@tanstack/react-query) for server state caching
- Socket context provides WebSocket connection to all components

**API Communication:**
- Axios for HTTP requests to backend
- Base URL: http://localhost:4000
- Services in `services/` directory handle all API calls
- Socket.IO client connects to backend WebSocket gateway

**Routing:**
- App Router structure with nested layouts
- Protected routes should check auth state from authStore
- Dynamic routes: `/chat/[userId]`, `/profile/[id]`

### State Flow

1. **Authentication:** Login → authService → JWT stored → authStore updated → Protected routes accessible
2. **Real-time Chat:** User sends message → useChat hook → Socket.IO → Backend gateway → Broadcast → All clients receive via socket listener
3. **User Location:** Geolocation service → Backend API → PostGIS point stored → Nearby users query

### Key Patterns

**Authentication Flow:**
- JWT tokens from `/auth/login` or `/auth/register`
- Tokens should be included in Authorization header
- AdminGuard checks for UserRole.ADMIN in protected endpoints

**WebSocket Connection:**
- Frontend establishes connection via SocketProvider in root layout
- useSocket() hook provides socket instance and connection status
- Chat components subscribe to room-specific events

**Geolocation:**
- User.location field stores PostGIS Point geometry
- Frontend geolocationService gets browser location
- Backend can query nearby users using PostGIS spatial functions

## Important Notes

- Backend runs on port 4000, frontend on port 3000
- PostgreSQL with PostGIS extension is required (use docker-compose)
- TypeORM synchronize is enabled in development (auto-creates tables)
- CORS is configured to allow localhost:3000
- File uploads are stored locally in backend/uploads/
- Socket.IO requires both CORS configuration in gateway and CORS headers in main.ts

## Testing

Backend uses Jest with the following configuration:
- Unit tests: `*.spec.ts` files next to source files
- E2E tests: `test/` directory with `jest-e2e.json` config
- Use supertest for HTTP endpoint testing
- Socket testing example available in `backend/test-socket.html`
