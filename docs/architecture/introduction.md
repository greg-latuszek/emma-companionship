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

### **Decision: Hybrid Approach**

**Selected Foundation**: **Vercel Turborepo Example** + **T3 Stack Patterns**

**Rationale**:
1. **Turborepo Example** provides the optimal monorepo structure for our Vercel deployment target
2. **T3 Stack patterns** can be adapted for our technology selections (TypeScript, Next.js, Prisma, Auth.js)
3. **Custom Hexagonal Architecture** will be implemented within the established monorepo structure
4. This approach gives us ~40% head start on infrastructure while maintaining full control over architectural patterns

**Implementation Plan**:
1. Start with Vercel's official Turborepo template for Next.js
2. Integrate T3 Stack's TypeScript configurations and tool setups
3. Add our specific dependencies (Prisma, Auth.js, React Flow, etc.)
4. Implement custom Modular Monolith structure in `/apps/web/src/lib/modules/`
5. Apply Hexagonal Architecture patterns within each module

This hybrid approach balances rapid initial setup with our specific architectural requirements.

## Change Log

| Date | Version | Description | Author                        |
| :--- | :--- | :--- |:------------------------------|
| 2024-12-19 | 1.0.0 | Initial Architecture | Grzegorz Latuszek (Architect) |

-----
