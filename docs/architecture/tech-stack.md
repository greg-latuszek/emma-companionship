# Tech Stack

## Cloud Infrastructure

- **Provider:** Vercel
- **Key Services:** Next.js hosting (Edge Network + Serverless Functions), Vercel Postgres, Domain management, Analytics
- **Deployment Regions:** Europe Central/Frankfurt (primary, optimized for Poland), with global edge distribution for static assets

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale                                                                 |
| :--- | :--- | :--- | :--- |:--------------------------------------------------------------------------|
| **Frontend Language** | TypeScript | ~5.x | Frontend development language | Strong typing, excellent tooling, seamless fullstack integration          |
| **Frontend Framework** | Next.js | ~14.x | React framework with App Router | Unified fullstack development with SSR, API routes, and optimizations     |
| **UI Component Library** | shadcn/ui | Latest | Pre-built accessible components | Customizable, accessible, built on Radix UI primitives                    |
| **CSS Framework** | Tailwind CSS | ~3.x | Utility-first CSS framework | Rapid UI development, consistent design system, excellent DX              |
| **State Management** | React Context + useReducer (POC) | N/A | Client-side UI state management | Built-in React for POC; Zustand planned for later phase                  |
| **Data Fetching** | TanStack Query | ~5.x | Server state management & caching | Industry standard for server data, automatic caching, optimistic updates  |
| **Backend Language** | TypeScript | ~5.x | Backend development language | Shared language across stack, type safety, reduced context switching      |
| **Backend Framework** | Next.js API Routes | ~14.x | Serverless API endpoints | Seamless integration with frontend, automatic deployment                  |
| **API Style** | REST | 3.0 | API communication standard | Natively supported by Next.js, universally understood, OpenAPI compatible |
| **Database** | PostgreSQL | 16.x | Primary data storage | Robust relational database, excellent for complex relationships           |
| **ORM** | Prisma | ~5.x | Database client and schema management | Type-safe database access, excellent migrations, great DX                 |
| **Cache** | Next.js Cache | ~14.x | Application-level caching | Built-in caching for API routes and React components                      |
| **File Storage** | Vercel Blob | Latest | File upload and storage | Integrated with Vercel platform, simple API, global CDN                   |
| **Authentication** | Auth.js (NextAuth) | ~5.x | User authentication and session management | Next.js standard, secure, supports multiple providers                     |
| **Frontend Testing** | Jest + React Testing Library | Latest | Component and unit testing | React ecosystem standard, excellent component testing                     |
| **Backend Testing** | Jest + Supertest | Latest | API route and integration testing | Node.js standard, excellent for testing Express-like APIs                 |
| **E2E Testing** | Playwright (planned) | ~1.x | End-to-end browser testing | Planned for later phase; focus on unit and integration tests in POC      |
| **Build Tool** | Nx | Latest | Monorepo build orchestration | Task graph, caching, generators, strong monorepo support                  |
| **Bundler** | Next.js/Webpack | ~14.x | JavaScript bundling and optimization | Built into Next.js, automatic optimizations, code splitting               |
| **IaC Tool** | Vercel CLI | Latest | Infrastructure as Code | Declarative configuration, seamless deployment, environment management    |
| **CI/CD** | GitHub Actions (planned) | N/A | Continuous integration & deployment | Planned for later phase; POC uses manual Vercel deployment               |
| **Monitoring** | Vercel Analytics | Latest | Application performance monitoring | Built-in analytics, Core Web Vitals, user experience metrics              |
| **Logging** | Vercel Functions Logs | N/A | Application logging and debugging | Integrated logging for serverless functions, real-time monitoring         |
| **Graph Visualization** | React Flow (planned) | ~11.x | Interactive graph rendering | Planned for later phase; can be introduced with Epic 2 Story 2.4 |

-----
