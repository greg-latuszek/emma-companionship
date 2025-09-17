# Introduction
This document outlines the complete fullstack architecture for emmaCompanionship. It serves as the single source of truth for development, ensuring consistency across the stack.

## Starter Template or Existing Project

After evaluating available starter templates against our architectural requirements (TypeScript + Next.js + Monorepo + Modular Monolith + Hexagonal Architecture), the following options were considered:

### **Evaluated Starter Templates:**

**1. T3 Stack (create-t3-app)**
- ✅ **Matches**: TypeScript, Next.js, Prisma, Auth.js
- ❌ **Missing**: Monorepo structure, Modular Monolith patterns, Hexagonal Architecture
- **Assessment**: Excellent technology alignment but lacks architectural patterns we need

**2. Vercel Turborepo Examples**
- ✅ **Matches**: TypeScript, Next.js, Monorepo (Turborepo)
- ❌ **Missing**: Modular Monolith structure, Hexagonal Architecture, integrated auth/database setup
- **Assessment**: Great monorepo foundation but requires significant architectural scaffolding

**3. Nx Next.js Templates**
- ✅ **Matches**: TypeScript, Next.js, Monorepo, some modular patterns
- ❌ **Missing**: Hexagonal Architecture, our specific tech stack (Prisma, Auth.js)
- **Assessment**: Strong monorepo tooling but different from our chosen stack

### **Decision: Selected Foundation**

**Selected Foundation**: **Nx Next.js Template**

**Rationale**:
1. **Nx Workspace** provides a strong, configurable monorepo structure with task graph and caching
2. Future enhancement (optional): adopt robust env validation (e.g., `@t3-oss/env-nextjs`) if/when the team needs it
3. **Custom Hexagonal Architecture** will be implemented within the established monorepo structure
4. This approach gives us ~40% head start on infrastructure while maintaining full control over architectural patterns

**Implementation Plan**:
1. Start with Vercels's official Next.js with Nx template (https://vercel.com/templates/monorepos/monorepo-nx)
2. Establish TypeScript/ESLint/Prettier baselines using Nx defaults
3. Add our specific dependencies (Prisma, Auth.js, React Flow, etc.)
4. Implement custom Modular Monolith structure in `/apps/web/src/lib/modules/`
5. Apply Hexagonal Architecture patterns within each module

Future enhancement: add Zod-based environment validation and consider `@t3-oss/env-nextjs` only if operational need arises.

This approach balances rapid initial setup with our specific architectural requirements.

## Change Log

| Date | Version | Description | Author                        |
| :--- | :--- | :--- |:------------------------------|
| 2024-12-19 | 1.0.0 | Initial Architecture | Grzegorz Latuszek (Architect) |

-----
