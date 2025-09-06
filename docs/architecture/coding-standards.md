# Coding Standards

This section establishes a minimal set of high-impact rules that are mandatory for all developers, including AI agents, to enforce our architectural decisions and prevent common mistakes in fullstack development.

## Critical Fullstack Rules

- **Type Sharing:** Always define shared types in `packages/shared-types` and import from there. Never duplicate type definitions between frontend and backend.
- **API Service Layer:** Never make direct HTTP calls - always use the service layer in `lib/api/` for all external API interactions.
- **Environment Variables:** Access only through type-safe configuration objects, never `process.env` directly in application code. All environment variables must be exposed through a dedicated configuration module.
- **Enforced Module Boundaries:** Direct cross-module imports of internal, non-public components are strictly forbidden. Modules may only interact through their public API interfaces. An automated ESLint rule will enforce this boundary.
- **State Management Discipline:** State management must be strictly separated. Use Zustand only for pure UI state (modals, forms, local UI). Use TanStack Query exclusively for all server state (API data, caching, synchronization).
- **Centralized API Error Handling:** All backend API routes must use the centralized error handling middleware. Never handle errors individually in route handlers.
- **State Updates:** Never mutate state directly - use proper state management patterns. For Zustand: use set() function. For TanStack Query: use mutations with optimistic updates.
- **Strict Type Safety:** All function parameters and return types must be explicitly typed. The `any` type is forbidden. Enable TypeScript strict mode and resolve all type errors.
- **Import Organization:** Use absolute imports with path mapping (`@/` prefix). Group imports: external libraries → internal modules → types → relative imports.
- **Component Architecture:** React Server Components by default, Client Components only when needed for interactivity. Mark Client Components with `'use client'` directive.

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Component Files | PascalCase.tsx | - | `UserProfile.tsx` |
| Hook Files | camelCase with 'use' | - | `useAuth.ts` |
| Service Files | camelCase.ts | - | `memberService.ts` |
| Store Files | camelCase + Store.ts | - | `authStore.ts` |
| API Route Files | - | kebab-case/route.ts | `app/api/user-profile/route.ts` |
| Module Files | - | camelCase.ts | `memberModule.ts` |
| Database Tables | - | snake_case | `user_profiles` |
| Database Columns | - | snake_case | `created_at` |
| Prisma Models | PascalCase | PascalCase | `model Member { ... }` |
| Environment Variables | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `DATABASE_URL` |
| Constants | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |

## Enhanced Development Standards

### TypeScript Excellence
- **Module Declaration:** Use `export type` for type-only exports to enable proper tree-shaking
- **Utility Types:** Prefer built-in utility types (`Pick`, `Omit`, `Partial`, `Record`) over manual type construction
- **Interface vs Type:** Use `interface` for object shapes that might be extended, `type` for unions, primitives, and computed types
- **Generic Constraints:** Always provide meaningful constraints for generic types (e.g., `<T extends Record<string, unknown>>`)

### Code Quality Enforcement
- **Languages & Runtimes:** TypeScript (~5.x) with `strict` flag enabled, Node.js (~22.x LTS)
- **Style & Linting:** Prettier for code formatting enforced by pre-commit hooks, ESLint with architectural rules and import/export restrictions
- **Test Organization:** Test files use `.test.ts/.test.tsx` suffix, co-located with source files, fixtures in `__tests__/fixtures/` directories

-----
