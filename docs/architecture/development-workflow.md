# Development Workflow

This section defines the development setup and workflow for our fullstack Next.js application, providing comprehensive guidance for setting up local development environment and daily development commands.

## Local Development Setup

### Prerequisites

Before starting development, ensure you have the following tools installed:

```bash
# Install Node.js (v20.x LTS recommended)
# Download from https://nodejs.org or use nvm:
nvm install 20
nvm use 20

# Install pnpm globally for monorepo package management
npm install -g pnpm

# Install Docker and Docker Compose for local database
# Download from https://docker.com/get-started

# Verify installations
node --version  # Should be v20.x
pnpm --version  # Should be v8.x+
docker --version
docker-compose --version
git --version
```

### Initial Setup

First-time setup commands to get the fullstack application running locally:

```bash
# 1. Clone the repository
git clone <repository_url> emma-companionship
cd emma-companionship

# 2. Install all dependencies across the monorepo
pnpm install

# 3. Set up environment configuration
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local

# 4. Start local PostgreSQL database container
pnpm db:start

# 5. Generate Prisma client and apply database schema
pnpm db:generate
pnpm db:migrate

# 6. Seed the database with initial data
pnpm db:seed

# 7. Build shared packages
pnpm build:packages
```

### Development Commands

Common commands for daily development workflow:

```bash
# Start all services (recommended for fullstack development)
pnpm dev

# Start frontend only (Next.js with API routes)
pnpm dev:web

# Start database only (if you need to restart DB)
pnpm db:start

# Run tests
pnpm test              # Run all tests across monorepo
pnpm test:watch        # Run tests in watch mode
pnpm test:web          # Run only frontend tests
pnpm test:integration  # Run integration tests
pnpm test:e2e          # Run end-to-end tests

# Code quality and linting
pnpm lint              # Check code style across monorepo
pnpm lint:fix          # Auto-fix linting issues
pnpm format            # Format code with Prettier
pnpm type-check        # TypeScript type checking

# Database operations
pnpm db:studio         # Open Prisma Studio (database GUI)
pnpm db:reset          # Reset database and re-seed
pnpm db:migrate:dev    # Create and apply new migration
pnpm db:migrate:reset  # Reset migrations

# Build commands
pnpm build             # Build entire monorepo for production
pnpm build:web         # Build Next.js application only
pnpm build:packages    # Build shared packages only

# Deployment and production
pnpm start             # Start production build locally
pnpm preview           # Preview production build
```

### Nx Workspace Commands (alongside pnpm scripts)

These are first-class Nx equivalents you can use directly in the workspace:

```bash
# Visualize the project graph and task dependencies
nx graph

# Serve Next.js app (dev server)
nx serve web

# Build the web app
nx build web

# Run unit tests for the web app
nx test web

# Run linter for the web app
nx lint web

# Format code
nx format:check
nx format:write

# Run targets across many projects
nx run-many -t build
nx run-many -t test

# Affected (useful in CI or local incremental workflows)
nx affected -t lint,test,build

# Clear the Nx cache if needed
nx reset

# Generate code with Nx generators (examples)
nx g @nx/next:page --project=web --name=members
nx g @nx/next:component --project=web --name=MemberCard
```

**Git Hooks & Code Quality Automation:**

The project uses **Husky** and **lint-staged** for automated code quality checks:

```bash
# Git hooks are automatically installed after pnpm install
# The following checks run on every commit:

# Pre-commit hook runs:
# - Prettier formatting on staged files
# - ESLint checking on staged files  
# - TypeScript type checking
# - Unit tests for changed files

# Pre-push hook runs:
# - Full test suite
# - Build verification
# - Integration tests
```

## Environment Configuration

### Required Environment Variables

The application requires different environment variables for development, organized by scope:

```bash
# Frontend Environment Variables (.env.local)
# Next.js application configuration

# Application URLs
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# API Configuration  
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Feature Flags
# POC Note: React Flow is deferred; disable graph view by default
NEXT_PUBLIC_ENABLE_GRAPH_VIEW="false"
NEXT_PUBLIC_ENABLE_DATA_IMPORT="true"

# Backend Environment Variables (.env)
# Database and server configuration

# PostgreSQL connection for Prisma
DATABASE_URL="postgresql://emma_user:emma_password@localhost:5432/emma_companionship_dev?schema=public"

# Direct database URL for migrations
DIRECT_URL="postgresql://emma_user:emma_password@localhost:5432/emma_companionship_dev?schema=public"

# Shadow database for migrations (development)
SHADOW_DATABASE_URL="postgresql://emma_user:emma_password@localhost:5432/emma_companionship_shadow?schema=public"

# Shared Environment Variables
# Configuration used by both frontend and backend

# Authentication secrets
NEXTAUTH_SECRET="your-super-secret-jwt-key-min-32-characters-long"
AUTH_SECRET="your-super-secret-jwt-key-min-32-characters-long"

# Session configuration
SESSION_MAX_AGE="2592000"  # 30 days in seconds

# Security headers
CSRF_SECRET="your-csrf-secret-key"

# Email configuration (for notifications)
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="noreply@emma-companionship.local"

# File upload limits
MAX_FILE_SIZE="10485760"  # 10MB in bytes
UPLOAD_DIR="./uploads"

# Logging configuration
LOG_LEVEL="info"
LOG_FILE="./logs/app.log"

# Development-specific overrides
NODE_ENV="development"
NEXT_PUBLIC_NODE_ENV="development"
VERCEL_ENV="development"
```

**Environment Setup Scripts:**

```bash
# Quick environment setup for new developers
pnpm setup:env         # Interactive environment setup wizard
pnpm setup:dev         # Complete development environment setup
pnpm setup:test        # Setup test environment configuration
pnpm setup:clean       # Clean and reset all environments
```

**Environment Validation:**

The application automatically validates required environment variables on startup and provides helpful error messages for missing or invalid configuration.

-----
