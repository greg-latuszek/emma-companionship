# Unified Project Structure

This comprehensive monorepo structure accommodates both frontend and backend concerns while maintaining clear separation of responsibilities. The layout is optimized for Turborepo and follows Next.js fullstack best practices, with the backend modules within `apps/web/src/lib/modules` providing a clear physical representation of our Modular Monolith and Hexagonal Architecture decisions.

```plaintext
emma-companionship/
├── .github/                      # CI/CD workflows and GitHub configuration
│   └── workflows/
│       ├── ci.yml               # Continuous integration pipeline
│       └── deploy.yml           # Deployment pipeline
├── apps/
│   └── web/                     # Next.js fullstack application
│       ├── src/
│       │   ├── app/             # Next.js App Router
│       │   │   ├── (auth)/      # Route groups for auth pages
│       │   │   ├── dashboard/   # Dashboard pages and layouts
│       │   │   ├── api/         # API routes (serverless functions)
│       │   │   │   ├── auth/    # Authentication endpoints
│       │   │   │   ├── members/ # Member management endpoints
│       │   │   │   ├── companionships/ # Relationship endpoints
│       │   │   │   └── graph/   # Graph data endpoints
│       │   │   ├── globals.css  # Global styles
│       │   │   ├── layout.tsx   # Root layout component
│       │   │   └── page.tsx     # Home page
│       │   ├── components/      # React components
│       │   │   ├── ui/          # Basic UI components (Button, Input, etc.)
│       │   │   ├── forms/       # Form components (MemberForm, etc.)
│       │   │   ├── graph/       # Graph visualization components
│       │   │   ├── dashboard/   # Dashboard-specific components
│       │   │   └── providers/   # Context providers
│       │   ├── hooks/           # Custom React hooks
│       │   │   ├── useAuth.ts   # Authentication hook
│       │   │   ├── useMembers.ts # Member data hook
│       │   │   └── useGraph.ts  # Graph state hook
│       │   ├── lib/             # Shared utilities and backend logic
│       │   │   ├── api/         # Frontend API client services
│       │   │   │   ├── client.ts # Base API client setup
│       │   │   │   ├── auth.ts  # Auth service calls
│       │   │   │   ├── members.ts # Member service calls
│       │   │   │   └── relationships.ts # Relationship service calls
│       │   │   ├── modules/     # Backend business logic modules
│       │   │   │   ├── auth/    # Authentication module
│       │   │   │   │   ├── core/ # Business logic
│       │   │   │   │   ├── adapters/ # Database/external adapters
│       │   │   │   │   └── ports/ # Interface definitions
│       │   │   │   ├── geo/     # Geographic module
│       │   │   │   ├── member/  # Member management module
│       │   │   │   └── relationship/ # Relationship module
│       │   │   ├── stores/      # Zustand state stores
│       │   │   │   ├── authStore.ts # Authentication state
│       │   │   │   └── uiStore.ts # UI state management
│       │   │   ├── utils/       # Utility functions
│       │   │   ├── validations/ # Zod validation schemas
│       │   │   └── config.ts    # Application configuration
│       │   └── styles/          # Styling files
│       │       ├── globals.css  # Global CSS styles
│       │       └── components.css # Component-specific styles
│       ├── public/              # Static assets
│       │   ├── images/          # Image assets
│       │   └── favicon.ico      # Site favicon
│       ├── tests/               # Frontend and integration tests
│       │   ├── __mocks__/       # Test mocks
│       │   ├── components/      # Component tests
│       │   ├── pages/           # Page tests
│       │   ├── api/             # API route tests
│       │   └── e2e/             # End-to-end tests
│       ├── .env.local.example   # Environment variables template
│       ├── next.config.js       # Next.js configuration
│       ├── tailwind.config.js   # Tailwind CSS configuration
│       ├── tsconfig.json        # TypeScript configuration
│       └── package.json         # Application dependencies
│
├── packages/                    # Shared packages
│   ├── shared-types/            # Shared TypeScript interfaces
│   │   ├── src/
│   │   │   ├── api/             # API request/response types
│   │   │   ├── entities/        # Business entity types
│   │   │   │   ├── Member.ts    # Member entity types
│   │   │   │   ├── Companionship.ts # Companionship types
│   │   │   │   └── Geographic.ts # Geographic types
│   │   │   ├── ui/              # UI component prop types
│   │   │   └── index.ts         # Type exports
│   │   ├── tsconfig.json        # Package TypeScript config
│   │   └── package.json
│   ├── ui/                      # Shared UI components (shadcn/ui)
│   │   ├── src/
│   │   │   ├── components/      # Reusable UI components
│   │   │   │   ├── button.tsx   # Button component
│   │   │   │   ├── card.tsx     # Card component
│   │   │   │   ├── form.tsx     # Form components
│   │   │   │   └── index.ts     # Component exports
│   │   │   └── styles/          # Component styles
│   │   ├── tailwind.config.js   # UI package Tailwind config
│   │   └── package.json
│   └── config/                  # Shared configuration
│       ├── eslint/              # ESLint configurations
│       │   ├── base.js          # Base ESLint config
│       │   ├── react.js         # React-specific config
│       │   └── next.js          # Next.js-specific config
│       ├── typescript/          # TypeScript configurations
│       │   ├── base.json        # Base TypeScript config
│       │   ├── nextjs.json      # Next.js TypeScript config
│       │   └── react.json       # React TypeScript config
│       ├── jest/                # Jest test configurations
│       │   ├── base.js          # Base Jest config
│       │   └── react.js         # React Jest config
│       └── package.json
│
├── infrastructure/              # Infrastructure as Code
│   ├── vercel/                  # Vercel deployment configuration
│   │   ├── vercel.json          # Vercel project configuration
│   │   └── env-vars.md          # Environment variables documentation
│   └── database/                # Database migration scripts
│       ├── migrations/          # Prisma migrations
│       └── seeds/               # Database seed files
│
├── scripts/                     # Build and deployment scripts
│   ├── build.sh                 # Production build script
│   ├── dev.sh                   # Development startup script
│   ├── test.sh                  # Test execution script
│   └── db-setup.sh              # Database setup script
│
├── docs/                        # Project documentation
│   ├── prd/                     # Product requirements
│   ├── architecture/            # Architecture documentation
│   ├── api/                     # API documentation
│   ├── prd.md                   # Product requirements document
│   ├── architecture.md          # This architecture document
│   ├── frontend-spec.md         # Frontend specifications
│   └── deployment.md            # Deployment guide
│
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore patterns
├── .cursorignore               # Cursor AI ignore patterns
├── package.json                 # Root package.json with workspaces
├── turbo.json                   # Turborepo configuration
├── docker-compose.yml           # Local development database
├── README.md                    # Project overview and setup
└── LICENSE                      # Project license
```

## Key Structural Decisions

**Frontend Organization:**
- **App Router Structure**: Pages organized by feature with route groups for authentication
- **Component Hierarchy**: UI components separated by complexity (ui/ → forms/ → dashboard/)
- **Hook Organization**: Custom hooks grouped by domain (auth, members, graph)
- **Service Layer**: Frontend API services mirror backend module boundaries

**Backend Organization:**
- **Modular Monolith**: Each business module (auth, geo, member, relationship) follows hexagonal architecture
- **API Routes**: RESTful endpoints organized by resource with nested routes for relationships
- **Shared Logic**: Configuration, utilities, and validations available to all modules

**Shared Packages:**
- **Type Safety**: Shared TypeScript interfaces ensure consistency across frontend and backend
- **UI Consistency**: Reusable components built with shadcn/ui and Tailwind CSS
- **Configuration Management**: Centralized tooling configuration for consistency

**Development Infrastructure:**
- **Testing Strategy**: Co-located component tests with dedicated integration and E2E test directories
- **Build System**: Turborepo optimizes builds with intelligent caching and parallel execution
- **Environment Management**: Clear separation of local, staging, and production configurations

-----
