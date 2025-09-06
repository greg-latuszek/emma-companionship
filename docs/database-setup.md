# Database Setup Guide

## Environment Variables

Create a `.env.local` file in the `apps/web/` directory with the following configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://emma_user:emma_password@localhost:5432/emma_companionship"
DATABASE_URL_TEST="postgresql://emma_user_test:emma_password_test@localhost:5433/emma_companionship_test"

# NextAuth.js Configuration  
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Application Environment
NODE_ENV="development"
```

## Local Development Setup

### 1. Start PostgreSQL with Docker

```bash
# Start the database containers
docker-compose up -d postgres

# Check that the database is running
docker-compose ps
```

### 2. Setup Prisma

```bash
# Generate Prisma client
pnpm db:generate

# Apply database schema migrations
pnpm db:migrate

# Seed the database with sample data
pnpm db:seed
```

### 3. Verify Setup

```bash
# Check database connection
docker exec -it emma-companionship-postgres psql -U emma_user -d emma_companionship -c "\dt"
```

## Database Schema

The database includes the following main entities:

- **Members**: Core member information and geographic data
- **Companionships**: Relationship tracking between members
- **Users/Sessions/Accounts**: NextAuth.js authentication tables

## Commands

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Apply schema migrations  
- `pnpm db:seed` - Populate with sample data
- `docker-compose up postgres` - Start database
- `docker-compose down` - Stop database

## Production Notes

- Update `NEXTAUTH_SECRET` with a secure random value
- Use connection pooling for production deployments
- Consider read replicas for high-traffic scenarios
