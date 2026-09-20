# Deployment Architecture

This section defines our deployment strategy based on our Vercel platform choice, including CI/CD pipeline configuration and environment management for our fullstack Next.js application.

## Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel (Edge Network)
- **Build Command:** `pnpm build`
- **Output Directory:** `.next` (Next.js build output)
- **CDN/Edge:** Vercel Global Edge Network with automatic static optimization

**Backend Deployment:**
- **Platform:** Vercel Serverless Functions
- **Build Command:** `pnpm build` (includes API routes)
- **Deployment Method:** Git-based continuous deployment with automatic serverless function creation

## CI/CD Pipeline

POC Note: CI/CD with GitHub Actions is planned for a later phase. For the POC, deploy manually to Vercel (see below). The following pipeline remains as the planned approach for when CI/CD is enabled.

### POC Manual Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Build and deploy preview
vercel build
vercel deploy --prebuilt

# Promote to production
vercel deploy --prebuilt --prod
```

### Planned: GitHub Actions CI/CD

Our automated deployment pipeline leverages GitHub Actions for testing and Vercel for deployment:

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: emma_user
          POSTGRES_PASSWORD: emma_password
          POSTGRES_DB: emma_companionship_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: latest

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Setup test database
        run: |
          pnpm db:generate
          pnpm db:migrate:dev
        env:
          DATABASE_URL: postgresql://emma_user:emma_password@localhost:5432/emma_companionship_test

      - name: Run type checking
        run: pnpm type-check

      - name: Run linting
        run: pnpm lint

      - name: Run unit tests
        run: pnpm test
        env:
          DATABASE_URL: postgresql://emma_user:emma_password@localhost:5432/emma_companionship_test

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://emma_user:emma_password@localhost:5432/emma_companionship_test

      - name: Build application
        run: pnpm build
        env:
          DATABASE_URL: postgresql://emma_user:emma_password@localhost:5432/emma_companionship_test
          NEXTAUTH_SECRET: test-secret-key
          NEXTAUTH_URL: http://localhost:3000

  deploy-preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    needs: test

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Project Artifacts to Vercel
        id: deploy
        run: |
          url=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          echo "preview_url=$url" >> $GITHUB_OUTPUT

      - name: Comment PR with Preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview deployment ready! View at: ${{ steps.deploy.outputs.preview_url }}'
            })

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: test

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Run Database Migrations
        run: |
          pnpm db:migrate:deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Run Production Health Check
        run: |
          curl -f ${{ secrets.PRODUCTION_URL }}/api/health || exit 1

      - name: Notify Deployment Success
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.repos.createCommitStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              sha: context.sha,
              state: 'success',
              description: 'Production deployment successful',
              context: 'deployment/production'
            })
```

## Environments

Our application is deployed across three distinct environments with clear separation and purpose:

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | `http://localhost:3000` | `http://localhost:3000/api` | Local development and testing |
| Preview | `https://pr-{number}-emma-companionship.vercel.app` | `https://pr-{number}-emma-companionship.vercel.app/api` | Feature branch testing and code review |
| Production | `https://emma-companionship.vercel.app` | `https://emma-companionship.vercel.app/api` | Live application for end users |

**Environment-Specific Configuration:**

- **Development:** Uses local PostgreSQL instance with seeded test data
- **Preview:** Connects to isolated staging database with anonymized data
- **Production:** Uses Vercel Postgres with live user data and enhanced security

**Deployment Triggers:**

- **Development:** Manual local startup (`pnpm dev`)
- **Preview:** Automatic deployment on Pull Request creation/update
- **Production:** Automatic deployment on merge to `main` branch

**Database Strategy:**

- **Development:** Local PostgreSQL container with full schema and test data
- **Preview:** Shared staging database with realistic but anonymized test data
- **Production:** Vercel Postgres with production data and automated backups

## Infrastructure as Code

- **Tool:** Vercel CLI v33.0+ and GitHub Actions
- **Location:** `.github/workflows/ci-cd.yml` (GitHub Actions configuration) and `vercel.json` (Vercel platform configuration)
- **Approach:** Declarative configuration using Vercel's platform-as-a-service model with GitHub Actions for CI/CD orchestration

The `vercel.json` file provides platform-specific configuration for deployment settings, routing rules, and environment variables, while the GitHub Actions workflow (shown above) handles the complete CI/CD pipeline automation.

## Environment Promotion Flow

```text
Development (Local)
        ↓
   Feature Branch
        ↓
   Pull Request → Preview Environment (Staging DB)
        ↓
   Code Review & Automated Testing
        ↓
   Merge to Main → Production Deployment
        ↓
   Database Migration (if required)
        ↓
   Production Verification
```

The promotion flow ensures that:
1. All code changes are tested in isolation via Preview environments
2. Database migrations are applied safely after application deployment
3. Production deployments are atomic and can be rolled back if necessary
4. Each environment uses appropriate data sources (local → staging → production)

## Rollback Strategy

- **Primary Method:** Git-based rollback using Vercel's deployment history and database migration reversals
- **Trigger Conditions:** Failed health checks, critical errors in production, or manual intervention due to business requirements
- **Recovery Time Objective:** Under 5 minutes for application rollback, under 15 minutes for database rollback including migration reversals

### Rollback Procedures

1. **Application Rollback**: Use Vercel dashboard or CLI to revert to previous successful deployment
2. **Database Rollback**: Execute pre-prepared rollback migration scripts for schema changes
3. **Verification**: Automated health checks confirm system stability post-rollback
4. **Communication**: Automated notifications to development team and stakeholders

-----
