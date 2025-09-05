## Introduction
This document outlines the complete fullstack architecture for emmaCompanionship. It serves as the single source of truth for development, ensuring consistency across the stack.

### Starter Template or Existing Project

After evaluating available starter templates against our architectural requirements (TypeScript + Next.js + Monorepo + Modular Monolith + Hexagonal Architecture), the following options were considered:

#### **Evaluated Starter Templates:**

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

#### **Decision: Hybrid Approach**

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

### Change Log

| Date | Version | Description | Author                        |
| :--- | :--- | :--- |:------------------------------|
| 2024-12-19 | 1.0.0 | Initial Architecture | Grzegorz Latuszek (Architect) |

-----

## High Level Architecture

### Technical Summary

The `emmaCompanionship` system employs a **Modular Monolith** architecture style, delivering a unified full-stack TypeScript application via **Next.js** that combines React Server/Client Components with serverless API routes in a single deployment unit. The core architecture features four distinct business modules (Auth, Geographic, Member Management, and Relationship) that interact through well-defined interfaces, with **PostgreSQL** serving as the centralized data layer and **React Flow** powering the interactive relationship graph visualization. The frontend leverages Next.js App Router with Server Components for optimal performance, while the backend uses serverless API routes and Hexagonal Architecture patterns for clean separation of concerns. Primary technology choices center on the **TypeScript/Next.js/Vercel** stack for rapid development and deployment, enabling type-safe fullstack development with shared interfaces between frontend and backend. This architecture directly supports the PRD goals of improving Delegate operational efficiency by providing a scalable, maintainable foundation for complex relationship management workflows, automated constraint enforcement, and visual dashboards that replace manual spreadsheet-based processes.

### High Level Overview

Based on the PRD's Technical Assumptions, the system adopts a **Modular Monolith** architectural style that balances development simplicity with future scalability needs. The **Monorepo** structure enables unified TypeScript type sharing across frontend and backend while maintaining clear module boundaries through Turborepo's workspace management. The service architecture follows a **single-deployment, multi-module** approach where business logic is organized into distinct modules (Auth, Geographic, Member, Relationship) that communicate through well-defined interfaces, preventing code entanglement while avoiding the operational complexity of microservices for the MVP.

The primary user interaction flow centers on Delegates accessing a **React-based dashboard** built with Next.js Server Components for initial page loads and Client Components for interactive elements. Users visualize relationship graphs using React Flow, execute guided workflows (assignment wizard, data import), and perform direct manipulations (drag-and-drop reassignments). These frontend interactions trigger **Next.js API routes** that serve as a Backend-for-Frontend (BFF) layer, making type-safe calls to the appropriate business modules, which then update the PostgreSQL database through Prisma ORM adapters. 

**Key architectural decisions and their rationale** are documented in detail in [Architecture Decision Records (ADRs)](adr.md), including:
- [ADR-001: Unified Technology Stack](adr.md#adr-001-unified-technology-stack) - TypeScript/Next.js for full-stack development
- [ADR-002: Repository Structure](adr.md#adr-002-repository-structure) - Monorepo approach with Turborepo
- [ADR-003: Application and Module Architecture](adr.md#adr-003-application-and-module-architecture) - Modular Monolith with Hexagonal Architecture
- [ADR-004: Database Technology](adr.md#adr-004-database-technology) - PostgreSQL for relational data modeling
- [ADR-005: POC Hosting and Database Platform](adr.md#adr-005-poc-hosting-and-database-platform) - Vercel deployment strategy
- [ADR-006: Graph Visualization Technology](adr.md#adr-006-graph-visualization-technology) - React Flow for interactive graphs
- [ADR-007: Client-Side State Management Strategy](adr.md#adr-007-client-side-state-management-strategy) - Zustand + TanStack Query separation
- [ADR-008: ApprovalProcess Logic Placement](adr.md#adr-008-approvalprocess-logic-placement) - Approval workflow component organization
- [ADR-009: Decoupled Role and Scope Management](adr.md#adr-009-decoupled-role-and-scope-management) - Flexible role assignment architecture
- [ADR-010: Candidate Search with Hard and Soft Constraints](adr.md#adr-010-candidate-search-with-hard-and-soft-constraints) - Constraint-based matching algorithm design
- [ADR-011: Authentication Strategy - Phased Implementation](adr.md#adr-011-authentication-strategy---phased-implementation) - POC manual verification with post-POC OAuth migration

### Platform and Infrastructure Choice

**Options Evaluated:**
1. **Vercel + Vercel Postgres**: Optimized for Next.js, zero-config deployment, integrated database, excellent developer experience
2. **AWS Full Stack**: Enterprise scale with Lambda, API Gateway, RDS, Cognito - offers more control but increased complexity
3. **Azure App Service**: For enterprise Microsoft environments with Azure SQL - good for .NET ecosystems

**Selected Platform:** Vercel + Vercel Postgres

**Rationale:** Perfect alignment with Next.js architecture, zero-configuration deployment pipeline, integrated database with automatic scaling, optimal for MVP rapid development and POC requirements. Vercel's edge network provides global performance while the Hobby tier offers cost-effective hosting for initial validation.

- **Platform:** Vercel
- **Key Services:** Next.js hosting (Edge Network + Serverless Functions), Vercel Postgres, Domain management, Analytics
- **Deployment Regions:** Europe Central/Frankfurt (primary, optimized for Poland), with global edge distribution for static assets
- **Key Features:** No-cost scalable environment with automated backups (Point-in-Time Recovery), custom domain support, and seamless CI/CD integration

### Repository Structure

- **Structure:** Monorepo managed with Turborepo
- **Monorepo Tool:** Turborepo v1.x for high-performance builds and optimal Vercel integration
- **Package Organization:** 
  - `/apps/web` - Next.js fullstack application containing both frontend (App Router) and backend (API routes)
  - `/packages/shared-types` - TypeScript interfaces shared between frontend and backend modules
  - `/packages/ui` - Reusable React components (Button, Card, Form elements)
  - `/packages/config` - Shared configuration (ESLint, TypeScript, Jest configurations)

**Rationale:** Enables unified TypeScript type sharing between frontend and backend, simplifies dependency management, allows code reuse across the stack, and optimizes build performance with Turborepo's intelligent caching. This structure supports our Modular Monolith approach while maintaining clear boundaries between concerns.

### High Level Architecture Diagram

```mermaid
graph TD
    subgraph Browser
        A[User] --> B["Next.js Frontend <br> (React Server/Client Components)"]
    end

    subgraph "Vercel Edge Network"
        B -- HTTPS --> C["Static Assets <br> (CSS, Images, JS)"]
        B -- HTTPS --> D["Next.js API Routes <br> (Serverless Functions)"]
    end

    subgraph "Application Logic"
        D -- invokes --> E["Business Logic Modules <br> (Auth, Geographic, Member, Relationship)"]
        E -- uses adapters --> F["Prisma ORM"]
    end

    subgraph "Database Provider"
        F -- queries --> G["Vercel Postgres"]
    end

    subgraph "External Services"
        E -- future integration --> H["Email Service <br> (Optional)"]
        E -- future integration --> I["File Storage <br> (Optional)"]
    end

    style B fill:#405E61
    style D fill:#405E61
    style E fill:#395E39
    style C fill:#395EFF
```

### Architectural and Design Patterns

**Overall Architecture:**
- **Jamstack with API Routes**: Next.js Server-Side Generation with serverless API routes - _Rationale:_ Optimal performance and SEO while maintaining dynamic backend capabilities for complex business logic

**Frontend Patterns:**
- **Server-First Component Architecture**: React Server Components for initial rendering with selective Client Components for interactivity - _Rationale:_ Reduces client bundle size, improves initial page load, and provides better SEO
- **Progressive Enhancement**: Server-side rendering with client-side interactivity where needed - _Rationale:_ Ensures accessibility and performance for all users while enabling rich interactions
- **Component-Based UI**: Reusable React components with TypeScript interfaces - _Rationale:_ Maintainability, consistency, and type safety across the application

**Backend Patterns:**
- **Modular Monolith**: Business logic organized into distinct modules (Auth, Geographic, Member, Relationship) - _Rationale:_ Clear boundaries and separation of concerns without microservices complexity
- **Hexagonal Architecture (Ports & Adapters)**: Core business logic isolated from external concerns (database, frameworks) - _Rationale:_ Enables independent testing and future migration flexibility
- **Repository Pattern**: Abstract data access through Prisma ORM adapters - _Rationale:_ Clean separation between business logic and data persistence

**Integration Patterns:**
- **API Routes as Backend for Frontend**: Next.js API routes serve as BFF layer with shared TypeScript interfaces - _Rationale:_ Type-safe fullstack development with unified error handling
- **Serverless Functions**: Next.js API routes deployed as serverless functions - _Rationale:_ Excellent scalability, cost-efficiency, and automatic scaling based on demand

-----

## Tech Stack

### Cloud Infrastructure

- **Provider:** Vercel
- **Key Services:** Next.js hosting (Edge Network + Serverless Functions), Vercel Postgres, Domain management, Analytics
- **Deployment Regions:** Europe Central/Frankfurt (primary, optimized for Poland), with global edge distribution for static assets

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale                                                                 |
| :--- | :--- | :--- | :--- |:--------------------------------------------------------------------------|
| **Frontend Language** | TypeScript | ~5.x | Frontend development language | Strong typing, excellent tooling, seamless fullstack integration          |
| **Frontend Framework** | Next.js | ~14.x | React framework with App Router | Unified fullstack development with SSR, API routes, and optimizations     |
| **UI Component Library** | shadcn/ui | Latest | Pre-built accessible components | Customizable, accessible, built on Radix UI primitives                    |
| **CSS Framework** | Tailwind CSS | ~3.x | Utility-first CSS framework | Rapid UI development, consistent design system, excellent DX              |
| **State Management** | Zustand | ~4.x | Client-side UI state management | Lightweight, simple API, perfect for UI-only state                        |
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
| **E2E Testing** | Playwright | ~1.x | End-to-end browser testing | Modern, reliable, multi-browser support, great debugging                  |
| **Build Tool** | Turborepo | ~1.x | Monorepo build orchestration | High-performance builds, intelligent caching, great for Next.js           |
| **Bundler** | Next.js/Webpack | ~14.x | JavaScript bundling and optimization | Built into Next.js, automatic optimizations, code splitting               |
| **IaC Tool** | Vercel CLI | Latest | Infrastructure as Code | Declarative configuration, seamless deployment, environment management    |
| **CI/CD** | GitHub Actions | N/A | Continuous integration & deployment | Native GitHub integration, powerful workflows, free for open source       |
| **Monitoring** | Vercel Analytics | Latest | Application performance monitoring | Built-in analytics, Core Web Vitals, user experience metrics              |
| **Logging** | Vercel Functions Logs | N/A | Application logging and debugging | Integrated logging for serverless functions, real-time monitoring         |
| **Graph Visualization** | React Flow | ~11.x | Interactive graph rendering | Modern, feature-rich, perfect for relationship drag-and-drop UI |

-----

## Data Models

###  Architectural Note on Role Management

To provide clarity for the development team, this section details the reasoning behind our role-management data model.

Our initial, simpler models (with flags like `isDelegate` or direct links like `managesUnitId` on the `Member` record) failed to capture two critical business rules:

1.  A member's role (like Delegate or Supervisor) is always tied to a specific **scope** (e.g., a Province, a Zone).
2.  A member's physical location can be **different** from the scope of their role (e.g., a Zone Delegate for "Europe" might live in a specific province in Poland).

The chosen design solves this by creating a dedicated `RoleAssignment` model. This model acts as a link, explicitly connecting a **Member** to a **Role** for a specific **Scope** (`GeographicUnit`). This approach is highly flexible, accurately models the community's structure, and is the key to correctly implementing complex features like automated supervision and the "power separation" rule.

```typescript
// A branded type for UUIDs to enforce type-safety
export type UUID = string & { readonly __brand: 'UUID' };
```

###  GeographicUnit

**Purpose**: Defines the organizational and geographical tree structure of the community.

**Key Attributes**:
- id: Unique identifier - Primary key for the geographic unit
- name: Display name - Human-readable name (e.g., "Cracow Area", "Poland South Province")
- type: Unit classification - Hierarchical level (sector, province, country, zone, community)
- parentId: Hierarchical reference - Links to parent unit for tree structure

**Relationships**:
- Parent-Child: Self-referential hierarchy where units can contain other units
- Member Assignment: Members belong to exactly one geographic unit
- Role Scope: Roles are scoped to specific geographic units

**TypeScript Interface** *(Development Reference)*:

```typescript
interface GeographicUnit {
  id: UUID;
  name: string; // e.g., "Cracow Area", "Poland South Province"
  type: 'sector' | 'province' | 'country' | 'zone' | 'community';
  parentId?: UUID; // Foreign Key to another GeographicUnit
}
```

###  Member

**Purpose**: The central entity representing an individual person within the community. This model is intentionally kept simple, with all role and leadership information handled by the `RoleAssignment` model.

**Key Attributes**:
- id: Unique identifier - Primary key for the member
- firstName, lastName: Personal identification - Core identity fields
- gender: Biological classification - Required for companionship matching rules
- maritalStatus: Relationship state - Affects companion assignment eligibility
- communityEngagementStatus: Participation level - Member's commitment stage in community
- accompanyingReadiness: Mentor capacity - Availability and ability to guide others
- languages: Communication capabilities - Multi-language support for matching
- geographicUnitId: Location assignment - The geographic unit where member belongs
- Optional fields: Contact info, demographics, notes, consecration status, couple linkage

**Relationships**:
- Geographic Assignment: Belongs to exactly one GeographicUnit
- Role Assignments: Can have multiple roles in different scopes via RoleAssignment
- Couple Formation: Can be linked to another Member via Couple entity
- Companionship Participation: Can be companion or accompanied in multiple relationships
- Supervision Hierarchy: Implicitly supervised based on geographic unit and role structure

**TypeScript Interface** *(Development Reference)*:

```typescript
interface Member {
  id: UUID;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'married' | 'widowed' | 'consecrated';
  communityEngagementStatus: 'Looker-On' | 'In-Probation' | 'Commited' | 'In-Fraternity-Probation' | 'Fraternity';
  accompanyingReadiness: 'Not Candidate' | 'Candidate' | 'Ready' | 'Active' | 'Overwhelmed' | 'Deactivated';
  languages: string[];
  geographicUnitId: UUID; // The unit they BELONG to.

  // Optional fields
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  imageUrl?: string;
  notes?: string;
  consecratedStatus?: 'priest' | 'deacon' | 'seminarian' | 'sister' | 'brother';
  coupleId?: UUID;
}
```

###  Couple

**Purpose**: Groups two `Member` entities so they can be treated as a single unit.

**Key Attributes**:
- id: Unique identifier - Primary key for the couple
- member1Id, member2Id: Partner references - Links to two Member entities forming the couple
- weddingDate: Marriage date - Optional timestamp of their wedding
- numberOfChildren: Family size - Optional count of children in the family

**Relationships**:
- Member Pairing: References exactly two Member entities
- Companionship Unit: Can participate in companionships as a single entity
- Geographic Inheritance: Derives location from constituent members' geographic units

**TypeScript Interface** *(Development Reference)*:

```typescript
interface Couple {
  id: UUID;
  member1Id: UUID; // Foreign Key to Member
  member2Id: UUID; // Foreign Key to Member
  weddingDate?: Date;
  numberOfChildren?: number;
}
```

###  Role & RoleAssignment

**Purpose**: A flexible system to assign roles (like Supervisor or Delegate) to Members with a specific geographical scope.

**Key Attributes**:
- Role.id: Unique identifier - Primary key for role definition
- Role.name: Role classification - Type of responsibility (Companionship Delegate, Supervisor, Admin)
- Role.level: Authority scope - Geographic level where role operates
- RoleAssignment.id: Unique identifier - Primary key for role assignment
- RoleAssignment.memberId: Member reference - Who has the role
- RoleAssignment.roleId: Role reference - What role is assigned
- RoleAssignment.scopeId: Geographic scope - Where the role applies

**Relationships**:
- Role Definition: Role entity defines types and levels of responsibility
- Member Assignment: RoleAssignment links Members to Roles for specific geographic scopes
- Geographic Scoping: Roles are always bound to specific GeographicUnit scopes
- Multiple Assignments: Members can have multiple roles in different scopes
- Authority Hierarchy: Role levels create implicit supervision chains

**TypeScript Interfaces** *(Development Reference)*:

```typescript
interface Role {
  id: UUID;
  name: 'Companionship Delegate' | 'Supervisor' | 'Admin'; 
  level: 'sector' | 'province' | 'country' | 'zone' | 'international';
}

interface RoleAssignment {
  id: UUID;
  memberId: UUID;   // Foreign Key to the Member
  roleId: UUID;     // Foreign Key to the Role
  scopeId: UUID;    // Foreign Key to GeographicUnit (the scope of the role)
}
```

###  Companionship, ApprovalProcess & ApprovalStep

**Purpose**: These models manage the lifecycle of a voluntary `Companionship`, including the flexible, multi-step approval workflow.

**Key Attributes**:
- Companionship.id: Unique identifier - Primary key for the relationship
- Companionship.companionId/Type: Mentor reference - Who provides guidance (Member or Couple)
- Companionship.accompaniedId/Type: Mentee reference - Who receives guidance (Member or Couple)
- Companionship.status: Lifecycle state - Current phase (proposed, active, archived)
- Companionship.healthStatus: Relationship quality - Health indicator for monitoring
- Companionship.startDate/endDate: Timeline - When relationship began and ended
- ApprovalProcess.id: Unique identifier - Primary key for approval workflow
- ApprovalProcess.companionshipId: Relationship reference - Links to pending companionship
- ApprovalProcess.status: Workflow state - Overall approval status
- ApprovalStep.approverRole: Authority type - Who needs to approve at this step
- ApprovalStep.status: Step state - Individual approval decision status
- ApprovalStep.approvalDate: Decision timestamp - When approval/rejection occurred
- ApprovalStep.approvedBy: Decision maker - Member who made the approval/rejection decision
- ApprovalStep.comments: Decision notes - Optional comments explaining the approval/rejection

**Relationships**:
- Companionship Pairing: Links Members/Couples in mentor-mentee relationships
- Approval Workflow: ApprovalProcess orchestrates multi-step approval for new companionships
- Step Dependencies: ApprovalSteps define sequential approval requirements
- Role-Based Approval: Steps reference specific roles that must approve
- Status Tracking: Models track both relationship health and approval progress

**TypeScript Interfaces** *(Development Reference)*:

```typescript
interface Companionship {
  id: UUID;
  companionId: UUID;
  companionType: 'member' | 'couple';
  accompaniedId: UUID;
  accompaniedType: 'member' | 'couple';
  status: 'proposed' | 'active' | 'archived';
  healthStatus?: 'green' | 'yellow' | 'red' | 'gray';
  startDate: Date;
  endDate?: Date;
}

interface ApprovalProcess {
  id: UUID;
  companionshipId: UUID;
  status: 'in_progress' | 'approved' | 'rejected';
  steps: ApprovalStep[]; 
}

interface ApprovalStep {
  approverRole: 'province_head' | 'country_head' | 'zone_delegate' | 'zone_delegate_for_priests' | 'zone_delegate_for_consecrated_sisters' | 'zone_companionship_delegate' | 'international_companionship_delegate' | 'general_moderator' | 'companion' | 'accompanied';
  status: 'pending' | 'approved' | 'rejected';
  approvalDate?: Date;
  approvedBy?: UUID;
  comments?: string;
}
```

###  Note on the `Supervision` Model
A dedicated `Supervision` model is not needed. This relationship is implicitly defined by Role, Geography and `Member.geographicUnitId`.
- Member is in some Geographical unit (e.g., Sector).
- Another Member has a Role (Sector Head) that is scoped to that Sector
- Another Member has a Role (Province Head) that is scoped to Province of that Sector
- Another Member has a Role (Country Head) that is scoped to Country of that Province
- and so on...

###  Note on the Companionship Delegates
As for Supervisors, Companionship Delegates responsibility (which Members they take care for) is implicitly defined by Role, Geography and `Member.geographicUnitId`.
- Member is in some Geographical unit (e.g., Province).
- Another Member has a Role Companionship Delegate that is scoped to that Geographical unit
- Another Member has a Role Zone Companionship Delegate that is scoped to Zone where mentioned Province belongs

### Shared TypeScript Interface Organization

The above conceptual models will be implemented as shared TypeScript interfaces organized in `/packages/shared-types/` to enable type-safe communication between frontend and backend components.

#### Entity Types (`/packages/shared-types/src/entities/`)

Core business entity interfaces that represent our domain models:

```typescript
// Member.ts - Central community member entity
export interface Member {
  id: UUID;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'married' | 'widowed' | 'consecrated';
  communityEngagementStatus: 'Looker-On' | 'In-Probation' | 'Commited' | 'In-Fraternity-Probation' | 'Fraternity';
  accompanyingReadiness: 'Not Candidate' | 'Candidate' | 'Ready' | 'Active' | 'Overwhelmed' | 'Deactivated';
  languages: string[];
  geographicUnitId: UUID;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  imageUrl?: string;
  notes?: string;
  consecratedStatus?: 'priest' | 'deacon' | 'seminarian' | 'sister' | 'brother';
  coupleId?: UUID;
  passwordHash: string;
}

// Geographic.ts - Organizational hierarchy
export interface GeographicUnit {
  id: UUID;
  name: string;
  type: 'sector' | 'province' | 'country' | 'zone' | 'community';
  parentId?: UUID;
}

// Companionship.ts - Relationship management
export interface Companionship {
  id: UUID;
  companionId: UUID;
  companionType: 'member' | 'couple';
  accompaniedId: UUID;
  accompaniedType: 'member' | 'couple';
  status: 'proposed' | 'active' | 'archived';
  healthStatus?: 'green' | 'yellow' | 'red' | 'gray';
  healthStatusUpdatedAt?: Date;
  startDate: Date;
  endDate?: Date;
}

// Additional entities: Couple, Role, RoleAssignment, ApprovalProcess, ApprovalStep
```

#### API Types (`/packages/shared-types/src/api/`)

Request/response schemas for type-safe API communication:

```typescript
// requests.ts - API request schemas
export interface CreateMemberRequest {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  maritalStatus: Member['maritalStatus'];
  communityEngagementStatus: Member['communityEngagementStatus'];
  accompanyingReadiness: Member['accompanyingReadiness'];
  languages: string[];
  geographicUnitId: UUID;
  email?: string;
  phone?: string;
  dateOfBirth?: string; // ISO date string
  notes?: string;
  consecratedStatus?: Member['consecratedStatus'];
}

export interface UpdateMemberRequest extends Partial<CreateMemberRequest> {
  id: UUID;
}

export interface CreateCompanionshipRequest {
  companionId: UUID;
  companionType: 'member' | 'couple';
  accompaniedId: UUID;
  accompaniedType: 'member' | 'couple';
  startDate?: string; // ISO date string
}

export interface GraphFilterRequest {
  unitId: UUID;
  filters?: {
    healthStatus?: Companionship['healthStatus'][];
    memberType?: ('single' | 'couple' | 'priest' | 'consecrated')[];
    roleType?: string[];
    companionId?: UUID;
    accompaniedId?: UUID;
  };
}

// responses.ts - API response schemas
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  requestId: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    correlationId: string;
  };
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    totalMembers: number;
    totalCompanionships: number;
    healthStatusCounts: Record<string, number>;
  };
}

export interface GraphNode {
  id: string;
  type: 'member' | 'couple';
  data: {
    name: string;
    status: string;
    roles?: string[];
    imageUrl?: string;
  };
  position?: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'companionship' | 'supervision';
  data: {
    healthStatus?: Companionship['healthStatus'];
    startDate?: string;
    label?: string;
  };
}
```

#### UI Component Types (`/packages/shared-types/src/ui/`)

Frontend-specific types for component props and state management:

```typescript
// forms.ts - Form component prop types
export interface MemberFormProps {
  member?: Member;
  geographicUnits: GeographicUnit[];
  onSubmit: (data: CreateMemberRequest | UpdateMemberRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export interface CompanionshipFormProps {
  companionship?: Companionship;
  eligibleCompanions: Member[];
  onSubmit: (data: CreateCompanionshipRequest) => Promise<void>;
  onCancel: () => void;
  validationErrors?: string[];
}

// graph.ts - Graph visualization types
export interface GraphProps {
  unitId: UUID;
  initialFilters?: GraphFilterRequest['filters'];
  onNodeClick?: (nodeId: string, nodeData: GraphNode['data']) => void;
  onEdgeClick?: (edgeId: string, edgeData: GraphEdge['data']) => void;
  onFilterChange?: (filters: GraphFilterRequest['filters']) => void;
  isInteractive?: boolean;
}

// state.ts - State management types
export interface AuthState {
  user: Member | null;
  roles: RoleAssignment[];
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  activeFilters: GraphFilterRequest['filters'];
  toasts: ToastMessage[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
```

#### Validation Types (`/packages/shared-types/src/validation/`)

Zod schemas for runtime validation shared between frontend and backend:

```typescript
// schemas.ts - Zod validation schemas
import { z } from 'zod';

export const UUIDSchema = z.string().uuid();

export const MemberSchema = z.object({
  id: UUIDSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['male', 'female']),
  maritalStatus: z.enum(['single', 'married', 'widowed', 'consecrated']),
  communityEngagementStatus: z.enum(['Looker-On', 'In-Probation', 'Commited', 'In-Fraternity-Probation', 'Fraternity']),
  accompanyingReadiness: z.enum(['Not Candidate', 'Candidate', 'Ready', 'Active', 'Overwhelmed', 'Deactivated']),
  languages: z.array(z.string()),
  geographicUnitId: UUIDSchema,
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.date().optional(),
  imageUrl: z.string().url().optional(),
  notes: z.string().optional(),
  consecratedStatus: z.enum(['priest', 'deacon', 'seminarian', 'sister', 'brother']).optional(),
  coupleId: UUIDSchema.optional(),
  passwordHash: z.string(),
});

export const CreateMemberRequestSchema = MemberSchema.omit({ id: true, passwordHash: true }).extend({
  dateOfBirth: z.string().datetime().optional(),
});

export const CompanionshipSchema = z.object({
  id: UUIDSchema,
  companionId: UUIDSchema,
  companionType: z.enum(['member', 'couple']),
  accompaniedId: UUIDSchema,
  accompaniedType: z.enum(['member', 'couple']),
  status: z.enum(['proposed', 'active', 'archived']),
  healthStatus: z.enum(['green', 'yellow', 'red', 'gray']).optional(),
  healthStatusUpdatedAt: z.date().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
});

// Export inferred types for TypeScript usage
export type MemberValidation = z.infer<typeof MemberSchema>;
export type CreateMemberRequestValidation = z.infer<typeof CreateMemberRequestSchema>;
export type CompanionshipValidation = z.infer<typeof CompanionshipSchema>;
```

#### Type Export Strategy (`/packages/shared-types/src/index.ts`)

Centralized exports for easy importing across the application:

```typescript
// Entity exports
export * from './entities/Member';
export * from './entities/Geographic';
export * from './entities/Companionship';
export * from './entities/Role';
export * from './entities/Couple';
export * from './entities/ApprovalProcess';

// API exports
export * from './api/requests';
export * from './api/responses';

// UI exports
export * from './ui/forms';
export * from './ui/graph';
export * from './ui/state';

// Validation exports
export * from './validation/schemas';

// Utility types
export type UUID = string & { readonly __brand: 'UUID' };
export type Timestamp = string & { readonly __brand: 'Timestamp' };

// Re-export common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredNonNull<T> = { [P in keyof T]-?: NonNullable<T[P]> };
```

This organization enables:
- **Type Safety**: Shared interfaces prevent frontend-backend type mismatches
- **Code Reuse**: Validation schemas work on both client and server
- **Developer Experience**: Auto-completion and IntelliSense across the entire stack
- **Maintainability**: Single source of truth for all type definitions
- **Scalability**: Clear package boundaries for future microservice extraction

-----

## API Specification

### API Style Decision

Based on our Tech Stack selection, we've chosen **REST** as our primary API communication standard. This decision was made because:
- Native support in Next.js API Routes
- Universal understanding across development teams  
- Excellent OpenAPI documentation ecosystem
- Simple integration with TanStack Query on the frontend

**Alternative Formats Considered:**
- **GraphQL**: Would provide flexible querying but adds complexity for our domain-specific workflows
- **tRPC**: Would give end-to-end type safety but limits API reusability for future mobile applications

For future iterations, if query flexibility becomes critical for complex relationship filtering, GraphQL could be considered as an additional endpoint alongside REST.

### REST API Specification

This OpenAPI 3.0 specification defines all REST endpoints for the emmaCompanionship application, including authentication, member management, companionship workflows, and graph visualization.

**Security Note:** The Member schema intentionally excludes the `passwordHash` field for security reasons. Password hashes are never returned in API responses and are only used internally for authentication validation.

```yaml
openapi: 3.0.0
info:
  title: emmaCompanionship API
  version: 1.0.0
  description: REST API for managing community members, companionship relationships, and organizational workflows
  contact:
    name: Development Team
    email: dev@emma-companionship.org

servers:
  - url: http://localhost:3000/api
    description: Local development server
  - url: https://emma-companionship.vercel.app/api
    description: Production server

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  
  schemas:
    Error:
      type: object
      required:
        - error
      properties:
        error:
          type: object
          required:
            - code
            - message
            - timestamp
            - correlationId
          properties:
            code:
              type: string
              example: "VALIDATION_FAILED"
            message:
              type: string
              example: "Invalid member data provided"
            details:
              type: object
            timestamp:
              type: string
              format: date-time
            correlationId:
              type: string
              format: uuid

    Member:
      type: object
      required:
        - id
        - firstName
        - lastName
        - gender
        - maritalStatus
        - communityEngagementStatus
        - accompanyingReadiness
        - languages
        - geographicUnitId
      properties:
        id:
          type: string
          format: uuid
        firstName:
          type: string
        lastName:
          type: string
        gender:
          type: string
          enum: [male, female]
        maritalStatus:
          type: string
          enum: [single, married, widowed, consecrated]
        communityEngagementStatus:
          type: string
          enum: [Looker-On, In-Probation, Commited, In-Fraternity-Probation, Fraternity]
        accompanyingReadiness:
          type: string
          enum: [Not Candidate, Candidate, Ready, Active, Overwhelmed, Deactivated]
        languages:
          type: array
          items:
            type: string
        geographicUnitId:
          type: string
          format: uuid
        email:
          type: string
          format: email
        phone:
          type: string
        dateOfBirth:
          type: string
          format: date
        imageUrl:
          type: string
          format: uri
        notes:
          type: string
        consecratedStatus:
          type: string
          enum: [priest, deacon, seminarian, sister, brother]
        coupleId:
          type: string
          format: uuid

    Companionship:
      type: object
      required:
        - id
        - companionId
        - companionType
        - accompaniedId
        - accompaniedType
        - status
        - startDate
      properties:
        id:
          type: string
          format: uuid
        companionId:
          type: string
          format: uuid
        companionType:
          type: string
          enum: [member, couple]
        accompaniedId:
          type: string
          format: uuid
        accompaniedType:
          type: string
          enum: [member, couple]
        status:
          type: string
          enum: [proposed, active, archived]
        healthStatus:
          type: string
          enum: [green, yellow, red, gray]
        healthStatusUpdatedAt:
          type: string
          format: date-time
          description: "Timestamp when health status was last updated"
        startDate:
          type: string
          format: date
        endDate:
          type: string
          format: date

    GraphData:
      type: object
      required:
        - nodes
        - edges
      properties:
        nodes:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              type:
                type: string
                enum: [member, couple]
              data:
                type: object
        edges:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              source:
                type: string
              target:
                type: string
              type:
                type: string
                enum: [companionship, supervision]

security:
  - BearerAuth: []

paths:
  /auth/login:
    post:
      tags:
        - Authentication
      summary: Authenticate user and get access token
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  user:
                    $ref: '#/components/schemas/Member'
                  roles:
                    type: array
                    items:
                      type: object
        '401':
          description: Authentication failed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /members:
    get:
      tags:
        - Members
      summary: List members with optional filtering
      parameters:
        - name: unitId
          in: query
          schema:
            type: string
            format: uuid
        - name: filters
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of members
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Member'
    
    post:
      tags:
        - Members
      summary: Create a new member
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Member'
      responses:
        '201':
          description: Member created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Member'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /members/{id}:
    get:
      tags:
        - Members
      summary: Get member by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Member details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Member'
        '404':
          description: Member not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /members/{id}/eligible-companions:
    get:
      tags:
        - Members
      summary: Get eligible companions for a member
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Categorized list of eligible companions
          content:
            application/json:
              schema:
                type: object
                properties:
                  perfectMatches:
                    type: array
                    items:
                      $ref: '#/components/schemas/Member'
                  softViolations:
                    type: array
                    items:
                      $ref: '#/components/schemas/Member'

  /data/import/analyze:
    post:
      tags:
        - Data Import
      summary: Analyze spreadsheet for complete data import mapping
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
      responses:
        '200':
          description: Detected data structure and column headers for mapping
          content:
            application/json:
              schema:
                type: object
                properties:
                  detectedHeaders:
                    type: array
                    items:
                      type: string
                  suggestedMappings:
                    type: object

  /data/import/execute:
    post:
      tags:
        - Data Import
      summary: Execute bulk data import (members + companionships) with field mappings
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                mappings:
                  type: object
      responses:
        '200':
          description: Data import (members + companionships) completed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  created:
                    type: integer
                  errors:
                    type: integer
                  errorDetails:
                    type: array
                    items:
                      type: object
        '207':
          description: Partial success with some errors
          content:
            application/json:
              schema:
                type: object
                properties:
                  created:
                    type: integer
                  failed:
                    type: integer
                  errors:
                    type: array

  /companionships:
    post:
      tags:
        - Companionships
      summary: Propose a new companionship (initiates approval workflow)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - companionId
                - companionType
                - accompaniedId
                - accompaniedType
              properties:
                companionId:
                  type: string
                  format: uuid
                companionType:
                  type: string
                  enum: [member, couple]
                accompaniedId:
                  type: string
                  format: uuid
                accompaniedType:
                  type: string
                  enum: [member, couple]
      responses:
        '201':
          description: Companionship proposal created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Companionship'

  /companionships/direct:
    post:
      tags:
        - Companionships
      summary: Create companionship directly (bypass approval if authorized)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - companionId
                - accompaniedId
              properties:
                companionId:
                  type: string
                  format: uuid
                accompaniedId:
                  type: string
                  format: uuid
      responses:
        '201':
          description: Companionship created directly
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Companionship'
        '202':
          description: Sent for approval workflow
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Companionship'

  /companionships/reassign:
    post:
      tags:
        - Companionships
      summary: Reassign an accompanied member to a new companion
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - oldCompanionshipId
                - newCompanionId
                - accompaniedId
              properties:
                oldCompanionshipId:
                  type: string
                  format: uuid
                newCompanionId:
                  type: string
                  format: uuid
                accompaniedId:
                  type: string
                  format: uuid
      responses:
        '200':
          description: Reassignment proposal created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Companionship'
        '400':
          description: Constraint violations prevent reassignment
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /companionships/{id}/health:
    patch:
      tags:
        - Companionships
      summary: Update companionship health status
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - healthStatus
              properties:
                healthStatus:
                  type: string
                  enum: [green, yellow, red, gray]
      responses:
        '200':
          description: Health status updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Companionship'

  /graph/{unitId}:
    get:
      tags:
        - Graph
      summary: Get graph visualization data for a geographic unit
      parameters:
        - name: unitId
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: filters
          in: query
          schema:
            type: string
          description: Comma-separated filter criteria (e.g., healthStatus,memberType,roleType)
      responses:
        '200':
          description: Graph data with nodes and edges
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GraphData'
```

-----

## Components

Based on our fullstack Next.js architecture, the application is organized into frontend and backend components that work together seamlessly within a single deployment unit. The frontend leverages React Server/Client Components with Next.js App Router, while the backend uses our Modular Monolith with Hexagonal patterns.

### Frontend Components

The frontend architecture follows Next.js App Router conventions with clear separation between server and client components, organized by feature and complexity.

#### Page Components (`/apps/web/src/app/`)

**Responsibility:** Define application routes and layouts using Next.js App Router with server-side rendering optimization.

**Key Components:**
- `layout.tsx` - Root layout with navigation, authentication provider, and global UI
- `page.tsx` - Home page with authentication redirect and dashboard link
- `dashboard/page.tsx` - Main dashboard with member overview and graph navigation
- `(auth)/login/page.tsx` - Authentication page with Auth.js integration
- `members/page.tsx` - Member list with filtering and search capabilities
- `members/[id]/page.tsx` - Individual member profile and edit functionality
- `graph/page.tsx` - Interactive relationship graph visualization

**Technology Stack:**
- Next.js App Router for file-based routing and server components
- React Server Components for initial page rendering
- TypeScript strict interfaces for page props
- Tailwind CSS for responsive layout styling

#### UI Components (`/apps/web/src/components/`)

**Responsibility:** Reusable React components organized by complexity and feature domain.

**Component Hierarchy:**
- `ui/` - Basic shadcn/ui components (Button, Input, Card, Dialog)
- `forms/` - Complex form components (MemberForm, CompanionshipForm, RoleAssignmentForm)
- `graph/` - Graph visualization components (GraphContainer, NodeRenderer, EdgeRenderer, FilterPanel)
- `dashboard/` - Dashboard-specific components (MemberOverview, HealthStatusCards, QuickActions)
- `providers/` - Context providers (AuthProvider, ThemeProvider, QueryProvider)

**Key Interfaces:**
- `<MemberForm onSubmit={handleSubmit} member={member} />` - Member creation/editing
- `<GraphContainer unitId={unitId} filters={filters} />` - Interactive relationship graph
- `<CompanionshipWizard accompaniedId={id} />` - Guided companion assignment
- `<HealthStatusIndicator status={status} lastUpdated={date} />` - Relationship health display

**Technology Stack:**
- React 18 with Server/Client Component separation
- shadcn/ui + Radix UI for accessible component primitives
- React Hook Form + Zod for form validation
- React Flow for graph visualization components
- Tailwind CSS for component styling

#### Custom Hooks (`/apps/web/src/hooks/`)

**Responsibility:** Encapsulate data fetching, state management, and complex component logic.

**Key Hooks:**
- `useAuth()` - Authentication state and methods from Auth.js
- `useMembers(unitId, filters)` - Member data fetching with TanStack Query
- `useCompanionships(unitId)` - Relationship data with real-time updates
- `useGraphData(unitId, filters)` - Graph visualization data with caching
- `usePermissions(userId)` - Role-based access control checks
- `useTheme()` - Dark/light mode toggle with persistence

**Technology Stack:**
- TanStack Query for server state management and caching
- Zustand for UI-only state management
- Custom hooks for complex business logic
- TypeScript for hook interfaces and return types

#### Service Layer (`/apps/web/src/lib/api/`)

**Responsibility:** Frontend API client services that communicate with backend modules through type-safe interfaces.

**Key Services:**
- `authService.ts` - Authentication API calls (login, logout, session)
- `memberService.ts` - Member CRUD operations and search
- `relationshipService.ts` - Companionship management and approval workflows
- `graphService.ts` - Graph data fetching with filtering
- `importService.ts` - Data import analysis and execution

**Service Interfaces:**
- `createMember(data: CreateMemberRequest): Promise<Member>` - Type-safe member creation
- `getEligibleCompanions(memberId: UUID): Promise<{perfectMatches: Member[], softViolations: Member[]}>` - Companion matching
- `updateHealthStatus(companionshipId: UUID, status: HealthStatus): Promise<Companionship>` - Health tracking
- `getGraphData(unitId: UUID, filters: GraphFilters): Promise<GraphResponse>` - Graph visualization

**Technology Stack:**
- Axios/Fetch for HTTP client with interceptors
- Shared TypeScript interfaces from `/packages/shared-types`
- TanStack Query for caching and background updates
- Zod schemas for runtime validation of API responses

### Backend Components

The backend follows Modular Monolith architecture with Hexagonal patterns, organized into four distinct modules with clear boundaries and interfaces.

#### Auth Module

**Responsibility:** User registration, login, session management, and decoding access tokens to provide user identity across the entire application.

**Key Interfaces:**
- `registerUser(userData)` - Create new user accounts
- `loginUser(credentials)` - Authenticate users and create sessions
- `getCurrentUser(token)` - Retrieve current user identity
- `decodeToken(jwt)` - Validate and extract user information from tokens
- `hasPermission(userId, action, scope)` - Authorization checks

**Dependencies:** None (foundational module)

**Technology Stack:** 
- Auth.js (NextAuth) v5.x for authentication framework
- JWT tokens for stateless session management
- Prisma ORM for user data persistence
- Argon2 for password hashing
- TypeScript strict mode for type safety

#### Geographic Module

**Responsibility:** Manages the `GeographicUnit` organizational tree structure that defines community hierarchy and serves as the foundation for role scoping and member organization.

**Key Interfaces:**
- `getUnitById(id)` - Retrieve specific geographic unit
- `getUnitTree()` - Get complete hierarchical structure
- `getDescendantUnits(unitId)` - Find all child units in hierarchy
- `getAncestorUnits(unitId)` - Get parent chain to root
- `validateUnitScope(childId, parentId)` - Verify hierarchical relationships

**Dependencies:** None (foundational module)

**Technology Stack:**
- Prisma ORM with PostgreSQL for hierarchical data storage
- Recursive SQL queries for tree operations
- TypeScript interfaces for geographic unit types
- Zod schemas for input validation
- Materialized path pattern for efficient tree queries

#### Member Management Module

**Responsibility:** Manages business logic for `Member` and `Couple` entities, handles `RoleAssignment` records, and provides member search and filtering capabilities while enforcing community rules.

**Key Interfaces:**
- `getMemberById(id)` - Retrieve individual member details
- `listMembersByUnit(unitId, filters)` - Search members within geographic scope
- `createMember(memberData)` - Add new community members
- `updateMember(id, changes)` - Modify member information
- `assignRoleToMember(memberId, roleId, scopeId)` - Grant roles with geographic scope
- `getMemberRoles(memberId)` - Retrieve all roles for a member
- `validateMemberConstraints(member)` - Enforce business rules

**Dependencies:** 
- Auth Module (for permission validation)
- Geographic Module (for scope validation and hierarchy queries)

**Technology Stack:**
- Prisma ORM with complex relational queries
- PostgreSQL with indexes on foreign keys and search fields
- TypeScript strict interfaces for member data
- Zod schemas for comprehensive input validation
- Business rule engine patterns for constraint validation

#### Relationship Module

**Responsibility:** Manages the complete lifecycle of `Companionship` relationships, orchestrates the multi-step `ApprovalProcess` workflow, and provides graph data for visualization while enforcing complex community relationship rules.

**Key Interfaces:**
- `proposeCompanionship(companionData)` - Initiate new companionship proposals
- `getApprovalProcess(companionshipId)` - Retrieve approval workflow status
- `advanceApprovalStep(processId, decision)` - Process approval/rejection decisions
- `getGraphDataForUnit(unitId)` - Generate visualization data for frontend
- `evaluateMatchingConstraints(companionId, accompaniedId)` - Validate relationship rules
- `getCompanionshipHealth(companionshipId)` - Assess relationship status
- `analyzeDataImport(file)` - Parse spreadsheet and detect data structure for import mapping
- `executeDataImport(file, mappings)` - Bulk import complete relational data (members + companionships) from spreadsheet

**Dependencies:** 
- Auth Module (for user identity and permissions)
- Member Management Module (for role information and member data)
- Geographic Module (for scope validation in approval workflows)

**Technology Stack:**
- Prisma ORM with complex transaction management
- PostgreSQL with relationship-specific indexes
- State machine patterns for approval workflow management
- TypeScript union types for status management
- Complex business rule validation engine
- JSON aggregation for graph data generation

**Design Constraint:** The `ApprovalProcess` logic is implemented as an isolated sub-component within this module, designed for easy extraction to a separate service if future requirements demand microservice decomposition.

### Component Integration Patterns

The frontend and backend components work together through well-defined integration patterns that leverage Next.js fullstack capabilities and shared TypeScript interfaces.

#### Frontend-Backend Communication Flow

**Pattern:** Frontend services call Next.js API routes, which invoke backend modules through type-safe interfaces.

**Implementation:**
1. **React Component** triggers user action (form submission, button click)
2. **Custom Hook** (useMembers, useCompanionships) manages state and calls service
3. **Service Layer** (memberService.ts) makes HTTP request to API route
4. **Next.js API Route** validates request and calls appropriate backend module
5. **Backend Module** executes business logic and returns data
6. **Response flows back** through the same chain with type safety

**Example Flow:**
```typescript
// Frontend Component
const { mutate: createMember } = useMutation({
  mutationFn: (data: CreateMemberRequest) => memberService.createMember(data),
  onSuccess: () => queryClient.invalidateQueries(['members'])
});

// Service Layer
export const memberService = {
  createMember: async (data: CreateMemberRequest): Promise<Member> => {
    const response = await fetch('/api/members', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
};

// API Route
export async function POST(request: Request) {
  const data = CreateMemberRequestSchema.parse(await request.json());
  const member = await memberModule.createMember(data);
  return NextResponse.json(member);
}
```

#### Shared Type Safety Pattern

**Pattern:** TypeScript interfaces from `/packages/shared-types` ensure type safety across the entire stack.

**Implementation:**
- **Shared interfaces** define contracts between frontend and backend
- **API request/response types** prevent frontend-backend mismatches
- **Validation schemas** work on both client and server
- **Component prop types** ensure UI consistency

**Example:**
```typescript
// Shared interface used across stack
interface CreateMemberRequest {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  // ... other fields
}

// Frontend form component
const MemberForm: React.FC<{
  onSubmit: (data: CreateMemberRequest) => Promise<void>;
}> = ({ onSubmit }) => {
  // Type-safe form handling
};

// Backend module
const createMember = async (data: CreateMemberRequest): Promise<Member> => {
  // Type-safe business logic
};
```

#### Error Handling Integration

**Pattern:** Errors flow from backend modules through API routes to frontend with consistent formatting.

**Implementation:**
- **Backend modules** throw typed errors with business context
- **API routes** catch errors and format as ApiError responses
- **Frontend services** parse ApiError and trigger appropriate UI feedback
- **UI components** display user-friendly error messages

#### State Management Integration

**Pattern:** Frontend state management separates UI state (Zustand) from server state (TanStack Query).

**Implementation:**
- **TanStack Query** manages all server data with automatic caching and updates
- **Zustand stores** handle UI-only state (theme, filters, modals)
- **Custom hooks** combine both for component-level state management
- **Server Components** handle initial data loading

### Component Diagrams

#### Fullstack Component Architecture (C4 Container View)

```mermaid
graph TD
    subgraph "Browser"
        A["React Components<br/>(Server & Client)"]
        B["Custom Hooks<br/>(useAuth, useMembers)"]
        C["Service Layer<br/>(API Clients)"]
        D["State Management<br/>(Zustand + TanStack Query)"]
        
        A --> B
        B --> C
        B --> D
    end
    
    subgraph "Next.js Application (Vercel)"
        E["API Routes<br/>(Serverless Functions)"]
        F["Auth Module<br/>(NextAuth + JWT)"]
        G["Geographic Module<br/>(Hierarchy Management)"]
        H["Member Module<br/>(Member & Role Management)"]
        I["Relationship Module<br/>(Companionships & Approvals)"]
        
        E --> F
        E --> G
        E --> H
        E --> I
        
        H --> F
        H --> G
        I --> F
        I --> H
        I --> G
    end
    
    subgraph "Shared Packages"
        J["TypeScript Interfaces<br/>(Entity, API, UI Types)"]
        K["UI Components<br/>(shadcn/ui Library)"]
        L["Configuration<br/>(ESLint, TypeScript, Jest)"]
    end
    
    subgraph "Database & Storage"
        M["PostgreSQL<br/>(Vercel Postgres)"]
        N["File Storage<br/>(Vercel Blob)"]
    end
    
    C -- HTTPS --> E
    A --> J
    A --> K
    E --> J
    F --> M
    G --> M
    H --> M
    I --> M
    I --> N
    
    style A fill:#405E61
    style E fill:#405E61
```

#### Frontend Component Data Flow

```mermaid
graph TD
    subgraph "Page Components"
        A1["dashboard/page.tsx<br/>(Server Component)"]
        A2["members/page.tsx<br/>(Server Component)"]
        A3["graph/page.tsx<br/>(Client Component)"]
    end
    
    subgraph "UI Components"
        B1["MemberForm<br/>(Client Component)"]
        B2["GraphContainer<br/>(Client Component)"]
        B3["HealthStatusIndicator<br/>(Server Component)"]
    end
    
    subgraph "Custom Hooks"
        C1["useMembers()<br/>(TanStack Query)"]
        C2["useAuth()<br/>(Auth Context)"]
        C3["useGraphData()<br/>(TanStack Query)"]
    end
    
    subgraph "Services"
        D1["memberService.ts<br/>(API Client)"]
        D2["relationshipService.ts<br/>(API Client)"]
        D3["graphService.ts<br/>(API Client)"]
    end
    
    subgraph "State Stores"
        E1["authStore (Zustand)<br/>(UI State)"]
        E2["Query Cache<br/>(TanStack Query)"]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> B2
    B1 --> C1
    B2 --> C3
    B3 --> C2
    
    C1 --> D1
    C2 --> E1
    C3 --> D3
    
    D1 --> E2
    D2 --> E2
    D3 --> E2
    
    style A1 fill:#405E61
    style B1 fill:#395E39
```

#### Backend Module Interaction (Hexagonal Architecture)

```mermaid
graph TD
    subgraph "API Routes Layer"
        API1["/api/auth/*"]
        API2["/api/members/*"]
        API3["/api/companionships/*"]
        API4["/api/graph/*"]
    end
    
    subgraph "Auth Module (Hexagonal)"
        AUTH_CORE["Authentication Core<br/>(Business Logic)"]
        AUTH_PORT["Auth Port<br/>(Interface)"]
        AUTH_ADAPTER["Database Adapter<br/>(Prisma)"]
        
        AUTH_CORE --> AUTH_PORT
        AUTH_PORT --> AUTH_ADAPTER
    end
    
    subgraph "Member Module (Hexagonal)"
        MEMBER_CORE["Member Core<br/>(Business Logic)"]
        MEMBER_PORT["Member Port<br/>(Interface)"]
        MEMBER_ADAPTER["Database Adapter<br/>(Prisma)"]
        
        MEMBER_CORE --> MEMBER_PORT
        MEMBER_PORT --> MEMBER_ADAPTER
    end
    
    subgraph "Relationship Module (Hexagonal)"
        REL_CORE["Relationship Core<br/>(Business Logic)"]
        APPROVAL_CORE["Approval Core<br/>(Workflow Engine)"]
        REL_PORT["Relationship Port"]
        GRAPH_PORT["Graph Port"]
        REL_ADAPTER["Database Adapter<br/>(Prisma)"]
        
        REL_CORE --> REL_PORT
        APPROVAL_CORE --> REL_PORT
        REL_CORE --> GRAPH_PORT
        REL_PORT --> REL_ADAPTER
        GRAPH_PORT --> REL_ADAPTER
    end
    
    subgraph "External Systems"
        DB[(PostgreSQL)]
        STORAGE[(Vercel Blob)]
    end
    
    API1 --> AUTH_CORE
    API2 --> MEMBER_CORE
    API3 --> REL_CORE
    API4 --> REL_CORE
    
    MEMBER_CORE --> AUTH_CORE
    REL_CORE --> MEMBER_CORE
    REL_CORE --> AUTH_CORE
    
    AUTH_ADAPTER --> DB
    MEMBER_ADAPTER --> DB
    REL_ADAPTER --> DB
    REL_ADAPTER --> STORAGE
    
    style AUTH_CORE fill:#405E61
    style MEMBER_CORE fill:#405E61
    style REL_CORE fill:#405E61
    style DB fill:#395E39
```

This comprehensive component architecture demonstrates how our fullstack Next.js application integrates frontend React components with backend business modules through type-safe interfaces and clear architectural boundaries. The integration patterns ensure maintainability, scalability, and developer experience while supporting the complex business requirements of the community companionship management system.

-----

## External APIs

For the MVP, there are no required integrations with external third-party APIs for core business logic.

-----

## Core Workflows

This section illustrates key fullstack system workflows using sequence diagrams, showing both frontend and backend component interactions, error handling paths, async operations, and modern React patterns for critical user journeys identified in the PRD.

**Frontend Patterns Included:**
- React Server/Client Component interactions
- TanStack Query state management and cache invalidation
- Form validation and UI state management
- Optimistic updates and real-time synchronization
- Frontend service layer and error handling

**Backend Patterns Included:**
- Next.js API routes and middleware
- Module boundaries and business logic
- Database transactions and error handling
- Permission validation and security

### User Authentication and Authorization Workflow
**PRD Reference:** Story 1.2 - User Authentication & Role Management

This fullstack workflow shows how Delegates securely access the system with React state management, Auth.js integration, and proper frontend-backend coordination.

```mermaid
sequenceDiagram
    actor User as Delegate
    participant LoginPage as "Login Page<br/>(Client Component)"
    participant AuthHook as "useAuth Hook<br/>(TanStack Query)"
    participant AuthService as "authService.ts<br/>(Frontend API Client)"
    participant AuthRoute as "/api/auth/[...nextauth]<br/>(Auth.js)"
    participant AuthModule as "Auth Module"
    participant MemberModule as "Member Module"
    participant DB as "PostgreSQL"

    User->>LoginPage: "1. Enters credentials and submits"
    LoginPage->>LoginPage: "2. Client-side validation (Zod schema)"
    LoginPage->>AuthHook: "3. signIn mutation trigger"
    
    AuthHook->>AuthService: "4. signIn(credentials)"
    AuthService->>AuthRoute: "5. POST /api/auth/signin (Auth.js)"
    AuthRoute->>AuthModule: "6. loginUser(credentials)"
    
    AuthModule->>DB: "7. Query user by email"
    DB-->>AuthModule: "User record or null"
    
    alt Valid credentials
        AuthModule->>AuthModule: "8. Verify password hash (Argon2)"
        AuthModule-->>AuthRoute: "User authenticated"
        AuthRoute->>MemberModule: "9. getMemberRoles(userId)"
        MemberModule->>DB: "10. Query role assignments"
        DB-->>MemberModule: "Role data"
        MemberModule-->>AuthRoute: "User roles and permissions"
        
        AuthRoute-->>AuthService: "200 OK with session"
        AuthService-->>AuthHook: "Authentication success"
        
        Note over AuthHook: "TanStack Query:<br/>- Cache user session<br/>- Invalidate auth queries<br/>- Trigger refetch of protected data"
        
        AuthHook->>LoginPage: "Success state"
        LoginPage->>LoginPage: "11. Router.push('/dashboard')"
        LoginPage-->>User: "Redirect to dashboard"
        
    else Invalid credentials
        AuthModule-->>AuthRoute: "Invalid credentials"
        AuthRoute-->>AuthService: "401 Unauthorized"
        AuthService-->>AuthHook: "Authentication error"
        AuthHook->>LoginPage: "Error state"
        LoginPage->>LoginPage: "12. Show error message (toast)"
        LoginPage-->>User: "Display validation error"
    end
    
    Note over User, DB: "Frontend State Management:<br/>- Loading states during async operations<br/>- Form validation feedback<br/>- Error handling with user-friendly messages<br/>- Automatic retry on network failures"
```

### Member Creation and Management Workflow
**PRD Reference:** Stories 1.3, 1.4 - Create and Edit Community Members

This fullstack workflow demonstrates member lifecycle management with React Hook Form, Zod validation, optimistic updates, and comprehensive error handling.

```mermaid
sequenceDiagram
    actor User as Delegate
    participant MemberPage as "members/page.tsx<br/>(Server Component)"
    participant MemberForm as "MemberForm<br/>(Client Component)"
    participant UseMembers as "useMembers Hook<br/>(TanStack Query)"
    participant MemberService as "memberService.ts<br/>(API Client)"
    participant APIRoute as "/api/members<br/>(API Route)"
    participant AuthModule as "Auth Module"
    participant MemberModule as "Member Module"
    participant GeoModule as "Geographic Module"
    participant DB as "PostgreSQL"

    User->>MemberPage: "1. Navigate to member creation"
    MemberPage->>MemberForm: "2. Render form (initial data from Server Component)"
    
    User->>MemberForm: "3. Fills form fields"
    MemberForm->>MemberForm: "4. Real-time validation (Zod + React Hook Form)"
    MemberForm-->>User: "Live validation feedback"
    
    User->>MemberForm: "5. Submits form"
    MemberForm->>MemberForm: "6. Final client validation"
    MemberForm->>UseMembers: "7. createMember mutation"
    
    Note over UseMembers: "Optimistic Update:<br/>- Add temporary member to cache<br/>- Show loading state<br/>- Update UI immediately"
    
    UseMembers->>MemberService: "8. createMember(memberData)"
    MemberService->>APIRoute: "9. POST /api/members (validated data)"
    
    APIRoute->>APIRoute: "10. Auth middleware (session validation)"
    APIRoute->>AuthModule: "11. hasPermission(userId, 'create_member', scopeId)"
    AuthModule-->>APIRoute: "Permission granted"
    
    APIRoute->>APIRoute: "12. Zod schema validation (server-side)"
    APIRoute->>MemberModule: "13. validateMemberConstraints(memberData)"
    MemberModule->>GeoModule: "14. validateUnitScope(memberData.geographicUnitId)"
    GeoModule-->>MemberModule: "Valid geographic unit"
    MemberModule-->>APIRoute: "Validation passed"
    
    APIRoute->>MemberModule: "15. createMember(memberData)"
    MemberModule->>DB: "16. BEGIN TRANSACTION"
    MemberModule->>DB: "17. INSERT member record"
    
    alt Success
        DB-->>MemberModule: "Member created with ID"
        MemberModule->>DB: "18. COMMIT"
        MemberModule-->>APIRoute: "Created member object"
        APIRoute-->>MemberService: "201 Created with member data"
        MemberService-->>UseMembers: "Success response"
        
        Note over UseMembers: "TanStack Query Success:<br/>- Replace optimistic update with real data<br/>- Invalidate member list queries<br/>- Update related caches"
        
        UseMembers->>MemberForm: "Success state"
        MemberForm->>MemberForm: "19. Reset form, show success toast"
        MemberForm-->>User: "Member created successfully"
        
    else Validation error
        MemberModule->>DB: "18. ROLLBACK"
        DB-->>MemberModule: "Constraint violation"
        MemberModule-->>APIRoute: "Validation error details"
        APIRoute-->>MemberService: "400 Bad Request with field errors"
        MemberService-->>UseMembers: "Validation error"
        
        Note over UseMembers: "TanStack Query Error:<br/>- Remove optimistic update<br/>- Restore previous cache state<br/>- Trigger error handler"
        
        UseMembers->>MemberForm: "Error state with field-specific errors"
        MemberForm->>MemberForm: "20. Display field errors, focus first error"
        MemberForm-->>User: "Show validation errors inline"
    end
    
    Note over User, DB: "Frontend Enhancement Patterns:<br/>- Form autosave to localStorage<br/>- Keyboard shortcuts (Ctrl+S to save)<br/>- Accessibility (ARIA labels, focus management)<br/>- Progressive enhancement (works without JS)"
```

### Data Import Workflow
**PRD Reference:** Story 3.1 - Flexible Data Import from CSV/Excel

This stateless workflow enables bulk member import with sophisticated field mapping and error handling.

```mermaid
sequenceDiagram
    actor User as Delegate
    participant FE as "Frontend (Next.js)"
    participant API as "Backend API (Next.js)"
    participant Member as "Member Module"
    participant DB as "PostgreSQL Database"

    User->>FE: "1. Selects spreadsheet file"
    FE-->>User: "2. File ready for analysis"

    User->>FE: "3. Clicks 'Analyze'"
    FE->>API: "4. POST /api/data/import/analyze (file data)"
    API->>Relationship: "5. analyzeDataImport(file)"
    Relationship-->>API: "Detected data structure mappings"
    API-->>FE: "200 OK with column mappings"
    FE-->>User: "6. Display field mapping interface"

    User->>FE: "7. Defines mappings and clicks 'Import'"
    FE->>API: "8. POST /api/data/import/execute (file + mappings)"
    API->>Relationship: "9. executeDataImport(file, mappings)"
    
    Note over Relationship, DB: "Async processing:<br/>Validate each row,<br/>Build bulk transaction,<br/>Log errors"
    
    Relationship->>DB: "10. BEGIN TRANSACTION"
    Relationship->>DB: "11. Bulk INSERT members & companionships"
    
    alt All valid
        DB-->>Relationship: "All records inserted"
        Relationship-->>API: "Success summary"
        API-->>FE: "200 OK with results"
        FE-->>User: "Success message"
    else Partial success
        DB-->>Relationship: "Some records failed"
        Relationship-->>API: "Partial success with error details"
        API-->>FE: "207 Multi-Status"
        FE-->>User: "Summary with error report"
    else Complete failure
        Relationship->>DB: "ROLLBACK"
        Relationship-->>API: "Import failed"
        API-->>FE: "400 Bad Request"
        FE-->>User: "Error message"
    end
```

### Guided Companionship Assignment Workflow
**PRD Reference:** Story 3.2 - Guided Companionship Assignment Wizard

This workflow shows the sophisticated matching algorithm and approval process initiation.

```mermaid
sequenceDiagram
    actor User as Delegate
    participant FE as "Frontend (Next.js)"
    participant API as "Backend API (Next.js)"
    participant Relationship as "Relationship Module"
    participant Member as "Member Module"
    participant Auth as "Auth Module"
    participant DB as "PostgreSQL Database"

    User->>FE: "1. Clicks 'Assign Companion' for Member"
    FE->>API: "2. GET /api/members/{id}/eligible-companions"
    API->>Relationship: "3. evaluateMatchingConstraints(memberId, unitScope)"
    Relationship->>Member: "4. listMembersByUnit(unitId, eligibilityFilters)"
    Member->>DB: "5. Query with hard constraints"
    DB-->>Member: "Candidate members"
    Member-->>Relationship: "Filtered candidates"
    
    Note over Relationship: "ADR-010: Partition candidates<br/>into perfectMatches and<br/>softConstraintViolations"
    
    Relationship-->>API: "{perfectMatches, softViolations}"
    API-->>FE: "200 OK with categorized candidates"
    FE-->>User: "Display assignment wizard"

    User->>FE: "6. Selects companion and submits"
    FE->>API: "7. POST /api/companionships (proposal)"
    API->>Auth: "8. hasPermission(userId, 'propose_companionship')"
    Auth-->>API: "Permission granted"
    
    API->>Relationship: "9. proposeCompanionship(companionData)"
    Relationship->>DB: "10. BEGIN TRANSACTION"
    Relationship->>DB: "11. INSERT Companionship (status: 'proposed')"
    Relationship->>DB: "12. INSERT ApprovalProcess"
    DB-->>Relationship: "Records created"
    Relationship->>DB: "13. COMMIT"
    Relationship-->>API: "Companionship with approval workflow"
    API-->>FE: "201 Created"
    FE-->>User: "Proposal sent for approval"
```

### Manual Companionship Creation Workflow
**PRD Reference:** Story 2.2 - Manually Create and Manage Companionship Relationships

This workflow handles direct companionship creation by authorized Delegates.

```mermaid
sequenceDiagram
    actor User as Delegate
    participant FE as "Frontend (Next.js)"
    participant API as "Backend API (Next.js)"
    participant Relationship as "Relationship Module"
    participant Auth as "Auth Module"
    participant DB as "PostgreSQL Database"

    User->>FE: "1. Manual companion assignment form"
    FE->>API: "2. POST /api/companionships/direct (companion, accompanied)"
    API->>Auth: "3. hasPermission(userId, 'create_companionship_direct')"
    
    alt Has direct creation permission
        Auth-->>API: "Permission granted"
        API->>Relationship: "4. proposeCompanionship(data, skipApproval: true)"
        Relationship->>DB: "5. INSERT Companionship (status: 'active')"
        DB-->>Relationship: "Companionship created"
        Relationship-->>API: "Active companionship"
        API-->>FE: "201 Created"
        FE-->>User: "Companionship created"
    else Requires approval
        Auth-->>API: "Requires approval workflow"
        API->>Relationship: "4. proposeCompanionship(data)"
        Note over Relationship: "Standard approval process"
        Relationship-->>API: "Approval workflow initiated"
        API-->>FE: "202 Accepted"
        FE-->>User: "Sent for approval"
    end
```

### Supervision Role Assignment Workflow
**PRD Reference:** Story 2.3 - Automate Supervision Relationship Management

This workflow demonstrates how Community Delegates (CD) assign supervisory roles to members, which automatically establishes supervision relationships through geographic hierarchy.

```mermaid
sequenceDiagram
    actor User as Community Delegate
    participant FE as "Frontend (Next.js)"
    participant API as "Backend API (Next.js)"
    participant Member as "Member Module"
    participant Geo as "Geographic Module"
    participant DB as "PostgreSQL Database"

    User->>FE: "1. Opens supervision assignment form"
    
    par Load available roles and units
        FE->>API: "2a. GET /api/roles?level=supervisor"
        API->>DB: "3a. Query supervisor roles"
        DB-->>API: "Available roles"
        API-->>FE: "Supervisor role options"
    and
        FE->>API: "2b. GET /api/geographic-units"
        API->>Geo: "3b. getGeographicUnits()"
        Geo->>DB: "4b. Query units"
        DB-->>Geo: "Unit hierarchy"
        Geo-->>API: "Geographic unit tree"
        API-->>FE: "Unit selection options"
    end
    
    FE-->>User: "Display role and unit selection"
    User->>FE: "4. Selects unit and confirms assignment"
    FE->>API: "5. POST /api/role-assignments"
    
    API->>Member: "6. assignSupervisorRole(memberId, unitId)"
    Member->>DB: "7. BEGIN TRANSACTION"
    
    par Create role assignment
        Member->>DB: "8a. INSERT INTO role_assignments"
    and Validate geographic scope
        Member->>Geo: "8b. validateUnitScope(unitId)"
        Geo->>DB: "9b. Check unit hierarchy"
        DB-->>Geo: "Validation result"
    end
    
    Member->>DB: "10. COMMIT"
    
    Note over API: "Supervision relationships now\nimplicitly defined through\nrole and geographic scope"
    
    API-->>FE: "201 Created"
    FE-->>User: "Supervision role assigned"
```

Note: Supervision relationships are implicit through the `RoleAssignment` and `GeographicUnit` models. When a member is assigned a supervisory role for a geographic unit:
1. They automatically supervise all members whose `geographicUnitId` belongs to their assigned unit's hierarchy
2. No explicit supervision relationship records are needed
3. The system can determine supervision relationships by querying roles and geographic hierarchy

### Initial Graph View Implementation Workflow
**PRD Reference:** Story 2.4 - V1 Graph View for All Relationships

This workflow shows how the system builds and renders the initial view-only graph visualization of both companionship and supervision relationships.

```mermaid
sequenceDiagram
    actor User as Delegate
    participant FE as "Frontend (Next.js)"
    participant API as "Backend API (Next.js)"
    participant Relationship as "Relationship Module"
    participant Member as "Member Module"
    participant DB as "PostgreSQL Database"

    User->>FE: "1. Opens graph view page"
    FE->>API: "2. GET /api/graph/{unitId}"
    
    par Fetch relationships
        API->>Relationship: "3a. getCompanionshipRelations(unitId)"
        Relationship->>DB: "4a. Query companionships"
        DB-->>Relationship: "Active companionships"
        Relationship-->>API: "Companionship edges"
    and Fetch supervision structure
        API->>Relationship: "3b. getSupervisionRelations(unitId)"
        Relationship->>DB: "4b. Query supervision"
        DB-->>Relationship: "Supervision hierarchy"
        Relationship-->>API: "Supervision edges"
    and Fetch member data
        API->>Member: "3c. getMembersInUnit(unitId)"
        Member->>DB: "4c. Query members"
        DB-->>Member: "Member details"
        Member-->>API: "Node data"
    end
    
    Note over API: "5. Build graph structure\nwith distinct visual styles\nfor each relationship type"
    
    API-->>FE: "6. Complete graph data"
    FE->>FE: "7. Render view-only graph\nwith React Flow"
    FE-->>User: "Display graph visualization"
```

### Health Status Tracking Workflow
**PRD Reference:** Story 4.1 - Track and Display Relationship Health

This workflow demonstrates health status updates and monitoring.

```mermaid
sequenceDiagram
    actor User as Delegate
    participant FE as "Frontend (Next.js)"
    participant API as "Backend API (Next.js)"
    participant Relationship as "Relationship Module"
    participant DB as "PostgreSQL Database"

    User->>FE: "1. Updates companionship health status"
    FE->>API: "2. PATCH /api/companionships/{id}/health (status)"
    API->>Relationship: "3. getCompanionshipHealth(companionshipId)"
    Relationship->>DB: "4. Query current companionship"
    DB-->>Relationship: "Companionship data"
    
    Relationship->>Relationship: "5. Validate status transition"
    Relationship->>DB: "6. UPDATE health status with timestamp"
    DB-->>Relationship: "Status updated"
    Relationship-->>API: "Updated companionship"
    API-->>FE: "200 OK"
    FE-->>User: "Health status updated"
    
    Note over FE: "Async: Update graph visualization<br/>to reflect new health color"
```

### Drag-and-Drop Reassignment Workflow
**PRD Reference:** Story 4.2 - "Quick Record" Drag-and-Drop Reassignment

This workflow handles the interactive graph reassignment feature.

```mermaid
sequenceDiagram
    actor User as Delegate
    participant FE as "Frontend (Next.js)"
    participant API as "Backend API (Next.js)"
    participant Relationship as "Relationship Module"
    participant Auth as "Auth Module"
    participant DB as "PostgreSQL Database"

    User->>FE: "1. Drags accompanied node to new companion"
    FE->>FE: "2. Client-side validation"
    FE->>API: "3. POST /api/companionships/reassign (oldId, newCompanionId, accompaniedId)"
    
    API->>Auth: "4. hasPermission(userId, 'reassign_companionship')"
    Auth-->>API: "Permission granted"
    
    API->>Relationship: "5. evaluateMatchingConstraints(newCompanionId, accompaniedId)"
    Relationship-->>API: "Constraints validation"
    
    alt Valid reassignment
        API->>Relationship: "6. proposeCompanionship(newPairing)"
        Relationship->>DB: "7. UPDATE old companionship (status: 'archived')"
        Relationship->>DB: "8. INSERT new companionship (status: 'proposed')"
        DB-->>Relationship: "Reassignment recorded"
        Relationship-->>API: "New proposal created"
        API-->>FE: "200 OK with new relationship"
        FE-->>User: "Graph updated, 'Reassignment proposed'"
    else Constraint violation
        API-->>FE: "400 Bad Request with violations"
        FE->>FE: "Revert drag operation"
        FE-->>User: "Show constraint violation message"
    end
```

### Graph Filtering and Visualization Workflow
**PRD Reference:** Story 4.3 - Graph Filtering Capabilities

This advanced fullstack workflow demonstrates dynamic graph filtering with React Flow, real-time updates, debounced filtering, and sophisticated caching strategies.

```mermaid
sequenceDiagram
    actor User as Delegate
    participant GraphPage as "graph/page.tsx<br/>(Client Component)"
    participant GraphContainer as "GraphContainer<br/>(Client Component)"
    participant FilterPanel as "FilterPanel<br/>(Client Component)"
    participant UseGraphData as "useGraphData Hook<br/>(TanStack Query)"
    participant GraphService as "graphService.ts<br/>(API Client)"
    participant GraphAPI as "/api/graph/[unitId]<br/>(API Route)"
    participant RelModule as "Relationship Module"
    participant MemberModule as "Member Module"
    participant GeoModule as "Geographic Module"
    participant DB as "PostgreSQL"

    User->>GraphPage: "1. Navigate to graph view (/graph?unitId=123)"
    GraphPage->>GraphContainer: "2. Mount with initial unitId from URL"
    GraphContainer->>UseGraphData: "3. Trigger initial data fetch"
    
    UseGraphData->>GraphService: "4. getGraphData(unitId, defaultFilters)"
    GraphService->>GraphAPI: "5. GET /api/graph/{unitId}?filters=default"
    
    GraphAPI->>GraphAPI: "6. Auth middleware & permission check"
    GraphAPI->>RelModule: "7. getGraphDataForUnit(unitId, filterCriteria)"
    
    par Parallel data fetching
        RelModule->>DB: "8a. Query companionships with health filters"
        DB-->>RelModule: "Filtered companionships"
    and 
        RelModule->>MemberModule: "8b. listMembersByUnit(unitId, memberFilters)"
        MemberModule->>DB: "9b. Query members with type/role filters"
        DB-->>MemberModule: "Filtered members"
        MemberModule-->>RelModule: "Member subset"
    and 
        RelModule->>GeoModule: "8c. getDescendantUnits(unitId)"
        GeoModule->>DB: "9c. Query geographic hierarchy"
        DB-->>GeoModule: "Unit tree"
        GeoModule-->>RelModule: "Scope boundaries"
    end
    
    Note over RelModule: "Server-side aggregation:<br/>- Build graph nodes and edges<br/>- Calculate layout positions<br/>- Apply health status colors<br/>- Generate metadata"
    
    RelModule-->>GraphAPI: "Complete graph data structure"
    GraphAPI-->>GraphService: "200 OK with graph JSON"
    GraphService-->>UseGraphData: "Graph data received"
    
    Note over UseGraphData: "TanStack Query Caching:<br/>- Cache graph data by unitId + filters<br/>- Set stale time to 5 minutes<br/>- Background refetch on window focus"
    
    UseGraphData->>GraphContainer: "Graph data available"
    GraphContainer->>GraphContainer: "10. Initialize React Flow"
    GraphContainer-->>User: "Render interactive graph"
    
    User->>FilterPanel: "11. Changes health status filter"
    FilterPanel->>FilterPanel: "12. Debounced filter update (300ms)"
    
    Note over FilterPanel: "Client-side optimization:<br/>- Immediate UI feedback<br/>- Debounce API calls<br/>- Smart cache utilization"
    
    alt Minor filter change (cached data available)
        FilterPanel->>GraphContainer: "13a. Apply client-side filtering"
        GraphContainer->>GraphContainer: "Filter nodes/edges locally"
        GraphContainer-->>User: "Instant visual update"
        
    else Major filter change (requires server data)
        FilterPanel->>UseGraphData: "13b. Trigger new query with filters"
        UseGraphData->>GraphService: "14b. getGraphData(unitId, newFilters)"
        
        Note over UseGraphData: "Background fetch:<br/>- Keep showing current data<br/>- Display loading indicator<br/>- Optimistic updates where possible"
        
        GraphService->>GraphAPI: "15b. GET with updated filters"
        Note over GraphAPI, DB: "Repeat parallel data fetch"
        GraphAPI-->>GraphService: "Fresh filtered data"
        GraphService-->>UseGraphData: "Updated graph data"
        UseGraphData->>GraphContainer: "New data available"
        GraphContainer->>GraphContainer: "16b. Smooth transition to new layout"
        GraphContainer-->>User: "Updated graph visualization"
    end
    
    User->>GraphContainer: "17. Drags node to new position"
    GraphContainer->>GraphContainer: "18. Update local state (optimistic)"
    GraphContainer->>GraphService: "19. saveGraphLayout(nodePositions)"
    
    Note over GraphService: "Background sync:<br/>- Save layout to localStorage<br/>- Debounced API call for persistence<br/>- No UI blocking"
    
    GraphService->>GraphAPI: "20. PATCH /api/graph/{unitId}/layout"
    GraphAPI-->>GraphService: "Layout saved"
    
    Note over User, DB: "Advanced Frontend Features:<br/>- Real-time collaboration (WebSockets)<br/>- Keyboard navigation (accessibility)<br/>- Export functionality (PNG, SVG)<br/>- Minimap for large graphs<br/>- Search and highlight nodes"
```

-----

## Database Schema

This section transforms our conceptual data models into concrete PostgreSQL database schemas with proper relationships, constraints, and indexes for optimal performance and data integrity.

```sql
-- ====================================
-- Core Geographic and Organization Schema
-- ====================================

-- Geographic units for organizational hierarchy
CREATE TABLE geographic_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('sector', 'province', 'country', 'zone', 'community')),
    parent_id UUID REFERENCES geographic_units(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for geographic hierarchy queries
CREATE INDEX idx_geographic_units_parent_id ON geographic_units(parent_id);
CREATE INDEX idx_geographic_units_type ON geographic_units(type);
CREATE INDEX idx_geographic_units_name ON geographic_units(name);

-- ====================================
-- Member and Identity Schema
-- ====================================

-- Core member information
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    marital_status VARCHAR(20) NOT NULL CHECK (marital_status IN ('single', 'married', 'widowed', 'consecrated')),
    community_engagement_status VARCHAR(50) NOT NULL CHECK (community_engagement_status IN ('Looker-On', 'In-Probation', 'Commited', 'In-Fraternity-Probation', 'Fraternity')),
    accompanying_readiness VARCHAR(30) NOT NULL CHECK (accompanying_readiness IN ('Not Candidate', 'Candidate', 'Ready', 'Active', 'Overwhelmed', 'Deactivated')),
    languages TEXT[] NOT NULL DEFAULT '{}',
    geographic_unit_id UUID NOT NULL REFERENCES geographic_units(id) ON DELETE RESTRICT,
    
    -- Optional contact and personal information
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Argon2 hashed password
    phone VARCHAR(50),
    date_of_birth DATE,
    image_url TEXT,
    notes TEXT,
    consecrated_status VARCHAR(20) CHECK (consecrated_status IN ('priest', 'deacon', 'seminarian', 'sister', 'brother')),
    couple_id UUID REFERENCES couples(id) ON DELETE SET NULL,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes for member queries
CREATE INDEX idx_members_geographic_unit_id ON members(geographic_unit_id);
CREATE INDEX idx_members_accompanying_readiness ON members(accompanying_readiness);
CREATE INDEX idx_members_community_engagement ON members(community_engagement_status);
CREATE INDEX idx_members_gender ON members(gender);
CREATE INDEX idx_members_marital_status ON members(marital_status);
CREATE INDEX idx_members_consecrated_status ON members(consecrated_status);
CREATE INDEX idx_members_couple_id ON members(couple_id);
CREATE INDEX idx_members_name ON members(last_name, first_name);

-- Full-text search index for member search
CREATE INDEX idx_members_search ON members USING GIN (
    to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(email, ''))
);

-- Couple relationships
CREATE TABLE couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member1_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    member2_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    wedding_date DATE,
    number_of_children INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure couple members are unique
    CONSTRAINT unique_couple_members UNIQUE(member1_id, member2_id),
    CONSTRAINT no_self_couple CHECK (member1_id != member2_id)
);

CREATE INDEX idx_couples_member1_id ON couples(member1_id);
CREATE INDEX idx_couples_member2_id ON couples(member2_id);

-- ====================================
-- Role and Authorization Schema
-- ====================================

-- Role definitions
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE CHECK (name IN ('Companionship Delegate', 'Supervisor', 'Admin')),
    level VARCHAR(20) NOT NULL CHECK (level IN ('sector', 'province', 'country', 'zone', 'international')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role assignments with geographic scope
CREATE TABLE role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    scope_id UUID NOT NULL REFERENCES geographic_units(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES members(id),
    
    -- Prevent duplicate role assignments
    CONSTRAINT unique_member_role_scope UNIQUE(member_id, role_id, scope_id)
);

CREATE INDEX idx_role_assignments_member_id ON role_assignments(member_id);
CREATE INDEX idx_role_assignments_role_id ON role_assignments(role_id);
CREATE INDEX idx_role_assignments_scope_id ON role_assignments(scope_id);

-- ====================================
-- Companionship and Relationship Schema
-- ====================================

-- Companionship relationships
CREATE TABLE companionships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    companion_id UUID NOT NULL,
    companion_type VARCHAR(10) NOT NULL CHECK (companion_type IN ('member', 'couple')),
    accompanied_id UUID NOT NULL,
    accompanied_type VARCHAR(10) NOT NULL CHECK (accompanied_type IN ('member', 'couple')),
    status VARCHAR(20) NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'active', 'archived')),
    health_status VARCHAR(10) CHECK (health_status IN ('green', 'yellow', 'red', 'gray')),
    health_status_updated_at TIMESTAMP WITH TIME ZONE,  -- When the health status was last changed
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure valid date range
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date),
    -- Prevent self-companionship
    CONSTRAINT no_self_companionship CHECK (
        NOT (companion_id = accompanied_id AND companion_type = accompanied_type)
    )
);

-- Performance indexes for companionship queries
CREATE INDEX idx_companionships_companion ON companionships(companion_id, companion_type);
CREATE INDEX idx_companionships_accompanied ON companionships(accompanied_id, accompanied_type);
CREATE INDEX idx_companionships_status ON companionships(status);
CREATE INDEX idx_companionships_health_status ON companionships(health_status);
CREATE INDEX idx_companionships_date_range ON companionships(start_date, end_date);

-- ====================================
-- Approval Workflow Schema
-- ====================================

-- Approval process tracking
CREATE TABLE approval_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    companionship_id UUID NOT NULL REFERENCES companionships(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure one approval process per companionship
    CONSTRAINT unique_companionship_approval UNIQUE(companionship_id)
);

CREATE INDEX idx_approval_processes_companionship_id ON approval_processes(companionship_id);
CREATE INDEX idx_approval_processes_status ON approval_processes(status);

-- Individual approval steps
CREATE TABLE approval_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_process_id UUID NOT NULL REFERENCES approval_processes(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    approver_role VARCHAR(50) NOT NULL CHECK (approver_role IN (
        'province_head', 'country_head', 'zone_delegate', 
        'zone_delegate_for_priests', 'zone_delegate_for_consecrated_sisters',
        'zone_companionship_delegate', 'international_companionship_delegate',
        'general_moderator', 'companion', 'accompanied'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approval_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES members(id),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique step order per process
    CONSTRAINT unique_process_step_order UNIQUE(approval_process_id, step_order)
);

CREATE INDEX idx_approval_steps_process_id ON approval_steps(approval_process_id);
CREATE INDEX idx_approval_steps_status ON approval_steps(status);
CREATE INDEX idx_approval_steps_approver_role ON approval_steps(approver_role);
CREATE INDEX idx_approval_steps_approved_by ON approval_steps(approved_by);

-- ====================================
-- Audit and History Schema
-- ====================================

-- Audit trail for sensitive operations
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES members(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_changed_by ON audit_log(changed_by);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at);

-- ====================================
-- Database Functions and Triggers
-- ====================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_members_updated_at 
    BEFORE UPDATE ON members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_couples_updated_at 
    BEFORE UPDATE ON couples 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companionships_updated_at 
    BEFORE UPDATE ON companionships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geographic_units_updated_at 
    BEFORE UPDATE ON geographic_units 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate geographic hierarchy (prevent cycles)
CREATE OR REPLACE FUNCTION validate_geographic_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent creating cycles in geographic hierarchy
    IF NEW.parent_id IS NOT NULL THEN
        -- Use a recursive CTE to check for cycles
        WITH RECURSIVE hierarchy_check AS (
            SELECT id, parent_id, 1 as level
            FROM geographic_units 
            WHERE id = NEW.parent_id
            
            UNION ALL
            
            SELECT gu.id, gu.parent_id, hc.level + 1
            FROM geographic_units gu
            JOIN hierarchy_check hc ON gu.id = hc.parent_id
            WHERE hc.level < 10 -- Prevent infinite recursion
        )
        SELECT 1 FROM hierarchy_check WHERE id = NEW.id;
        
        IF FOUND THEN
            RAISE EXCEPTION 'Cannot create geographic hierarchy cycle';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_geographic_hierarchy_trigger
    BEFORE INSERT OR UPDATE ON geographic_units
    FOR EACH ROW EXECUTE FUNCTION validate_geographic_hierarchy();

-- ====================================
-- Performance and Maintenance
-- ====================================

-- Partial indexes for active records
CREATE INDEX idx_active_companionships ON companionships(status, health_status) 
    WHERE status = 'active';

CREATE INDEX idx_pending_approvals ON approval_steps(approval_process_id, step_order) 
    WHERE status = 'pending';

-- Composite indexes for common query patterns
CREATE INDEX idx_member_location_readiness ON members(geographic_unit_id, accompanying_readiness, gender);
CREATE INDEX idx_companionship_timeline ON companionships(status, start_date, end_date) 
    WHERE status IN ('active', 'proposed');

-- ====================================
-- Initial Data and Constraints
-- ====================================

-- Insert default roles
INSERT INTO roles (name, level, description) VALUES
    ('Admin', 'international', 'System administrator with full access'),
    ('Supervisor', 'province', 'Province-level supervision role'),
    ('Companionship Delegate', 'province', 'Manages companionship assignments within province');

-- Add constraint to ensure couples reference valid members
-- (This will be enforced by foreign keys, but documented here for clarity)

-- Add constraint to ensure companionship participants exist
-- (This will be validated at application level due to polymorphic references)
```

-----

## Frontend Architecture

This section defines frontend-specific architecture details for our Next.js application, including component organization, state management, routing patterns, and service layer integration.

### Component Architecture

Our component architecture follows Next.js App Router conventions with clear separation between Server and Client Components, organized by feature domain and complexity levels for maximum maintainability and developer experience.

#### Component Organization

```
apps/web/src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout (Server Component)
│   ├── page.tsx                 # Home page (Server Component)
│   ├── (auth)/                  # Route groups for auth pages
│   │   ├── login/page.tsx       # Login page (Client Component)
│   │   └── layout.tsx           # Auth layout (Server Component)
│   ├── dashboard/
│   │   ├── page.tsx             # Dashboard (Server Component)
│   │   └── loading.tsx          # Loading UI (Server Component)
│   ├── members/
│   │   ├── page.tsx             # Member list (Server Component)
│   │   ├── [id]/page.tsx        # Member detail (Server Component)
│   │   ├── [id]/edit/page.tsx   # Member edit (Client Component)
│   │   └── create/page.tsx      # Member creation (Client Component)
│   └── graph/
│       ├── page.tsx             # Graph view (Client Component)
│       └── error.tsx            # Error boundary (Client Component)
│
├── components/                   # Reusable components
│   ├── ui/                      # Basic UI primitives (shadcn/ui)
│   │   ├── button.tsx           # Base Button component
│   │   ├── input.tsx            # Base Input component
│   │   ├── card.tsx             # Base Card component
│   │   ├── dialog.tsx           # Modal dialog component
│   │   ├── toast.tsx            # Toast notification component
│   │   └── index.ts             # Barrel exports
│   │
│   ├── forms/                   # Complex form components
│   │   ├── MemberForm.tsx       # Member CRUD form (Client Component)
│   │   ├── CompanionshipForm.tsx # Companionship form (Client Component)
│   │   ├── RoleAssignmentForm.tsx # Role assignment (Client Component)
│   │   └── ImportWizard.tsx     # Data import wizard (Client Component)
│   │
│   ├── graph/                   # Graph visualization components
│   │   ├── GraphContainer.tsx   # Main graph wrapper (Client Component)
│   │   ├── NodeRenderer.tsx     # Custom node components
│   │   ├── EdgeRenderer.tsx     # Custom edge components
│   │   ├── FilterPanel.tsx      # Graph filtering UI
│   │   ├── GraphMinimap.tsx     # Navigation minimap
│   │   └── ExportButton.tsx     # Graph export functionality
│   │
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── MemberOverview.tsx   # Member statistics card
│   │   ├── HealthStatusCards.tsx # Health status overview
│   │   ├── QuickActions.tsx     # Common action buttons
│   │   ├── RecentActivity.tsx   # Activity feed
│   │   └── SearchBar.tsx        # Global search component
│   │
│   ├── layout/                  # Layout components
│   │   ├── Navigation.tsx       # Main navigation (Client Component)
│   │   ├── Sidebar.tsx          # Collapsible sidebar
│   │   ├── Header.tsx           # Page header with user menu
│   │   ├── Footer.tsx           # Application footer
│   │   └── BreadcrumbNav.tsx    # Breadcrumb navigation
│   │
│   └── providers/               # Context providers
│       ├── AuthProvider.tsx     # Authentication context
│       ├── ThemeProvider.tsx    # Dark/light theme context
│       ├── QueryProvider.tsx    # TanStack Query provider
│       ├── ToastProvider.tsx    # Toast notification provider
│       └── PermissionProvider.tsx # Role-based access control
```

**Organization Principles:**

1. **Server-First Approach:** Default to Server Components for better performance and SEO
2. **Client Boundaries:** Mark Client Components only when interactivity is required
3. **Feature-Based Grouping:** Organize components by business domain
4. **Complexity Separation:** Basic UI → Complex Forms → Feature-Specific
5. **Composition Over Inheritance:** Small, composable components

#### Component Template

```typescript
// Example: Complex form component with full patterns
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateMemberRequest, CreateMemberRequestSchema } from '@/packages/shared-types';
import { memberService } from '@/lib/api/memberService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';

interface MemberFormProps {
  initialData?: Partial<CreateMemberRequest>;
  onSuccess?: (member: Member) => void;
  onCancel?: () => void;
}

export function MemberForm({ initialData, onSuccess, onCancel }: MemberFormProps) {
  const queryClient = useQueryClient();
  
  // Form state management with validation
  const form = useForm<CreateMemberRequest>({
    resolver: zodResolver(CreateMemberRequestSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'male',
      ...initialData,
    },
  });

  // Server state mutation with optimistic updates
  const createMember = useMutation({
    mutationFn: memberService.createMember,
    onMutate: async (newMember) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['members'] });
      
      // Optimistic update
      const previousMembers = queryClient.getQueryData(['members']);
      queryClient.setQueryData(['members'], (old: Member[] = []) => [
        ...old,
        { ...newMember, id: 'temp-' + Date.now() }
      ]);
      
      return { previousMembers };
    },
    onError: (err, newMember, context) => {
      // Rollback optimistic update
      queryClient.setQueryData(['members'], context?.previousMembers);
      toast.error('Failed to create member: ' + err.message);
    },
    onSuccess: (member) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member created successfully');
      onSuccess?.(member);
      form.reset();
    },
  });

  // Form submission handler
  const onSubmit = (data: CreateMemberRequest) => {
    createMember.mutate(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Form fields with validation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                {...form.register('firstName')}
                placeholder="First Name"
                aria-invalid={!!form.formState.errors.firstName}
                aria-describedby={form.formState.errors.firstName ? 'firstName-error' : undefined}
              />
              {form.formState.errors.firstName && (
                <p id="firstName-error" className="text-red-500 text-sm mt-1">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            
            <div>
              <Input
                {...form.register('lastName')}
                placeholder="Last Name"
                aria-invalid={!!form.formState.errors.lastName}
                aria-describedby={form.formState.errors.lastName ? 'lastName-error' : undefined}
              />
              {form.formState.errors.lastName && (
                <p id="lastName-error" className="text-red-500 text-sm mt-1">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={createMember.isPending}
              aria-describedby="submit-status"
            >
              {createMember.isPending ? 'Creating...' : 'Create Member'}
            </Button>
          </div>
          
          {/* Screen reader status */}
          <div id="submit-status" className="sr-only">
            {createMember.isPending && 'Creating member, please wait'}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Export with display name for debugging
MemberForm.displayName = 'MemberForm';
```

**Component Pattern Features:**

1. **TypeScript Integration:** Full type safety with shared interfaces
2. **Form Management:** React Hook Form with Zod validation
3. **Server State:** TanStack Query with optimistic updates
4. **Error Handling:** User-friendly error messages and rollback
5. **Accessibility:** ARIA labels, screen reader support, keyboard navigation
6. **Performance:** Proper re-render optimization and loading states

### State Management Architecture

Our state management architecture follows a clear separation of concerns between server state and UI state, leveraging modern React patterns for optimal performance and developer experience.

#### State Structure

```typescript
// ===============================
// Server State (TanStack Query)
// ===============================

// Query key factory for consistent caching
export const queryKeys = {
  // Member queries
  members: {
    all: ['members'] as const,
    lists: () => [...queryKeys.members.all, 'list'] as const,
    list: (filters: MemberFilters) => [...queryKeys.members.lists(), filters] as const,
    details: () => [...queryKeys.members.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.members.details(), id] as const,
    roles: (id: string) => [...queryKeys.members.detail(id), 'roles'] as const,
  },
  
  // Companionship queries
  companionships: {
    all: ['companionships'] as const,
    lists: () => [...queryKeys.companionships.all, 'list'] as const,
    list: (unitId: string) => [...queryKeys.companionships.lists(), unitId] as const,
    details: () => [...queryKeys.companionships.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.companionships.details(), id] as const,
    health: (id: string) => [...queryKeys.companionships.detail(id), 'health'] as const,
  },
  
  // Graph queries
  graph: {
    all: ['graph'] as const,
    data: (unitId: string, filters: GraphFilters) => 
      [...queryKeys.graph.all, 'data', unitId, filters] as const,
    layout: (unitId: string) => [...queryKeys.graph.all, 'layout', unitId] as const,
  },
  
  // Geographic queries
  geographic: {
    all: ['geographic'] as const,
    units: () => [...queryKeys.geographic.all, 'units'] as const,
    tree: () => [...queryKeys.geographic.units(), 'tree'] as const,
    descendants: (unitId: string) => [...queryKeys.geographic.units(), 'descendants', unitId] as const,
  },
  
  // Auth queries
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    permissions: (userId: string) => [...queryKeys.auth.all, 'permissions', userId] as const,
  },
} as const;

// ===============================
// UI State (Zustand Stores)
// ===============================

// Theme and UI preferences
interface UIState {
  // Theme management
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Layout state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Modal/dialog state
  modals: {
    memberForm: { open: boolean; mode: 'create' | 'edit'; memberId?: string };
    companionshipWizard: { open: boolean; accompaniedId?: string };
    roleAssignment: { open: boolean; memberId?: string };
    dataImport: { open: boolean; step: 'upload' | 'mapping' | 'preview' | 'results' };
  };
  openModal: (modal: keyof UIState['modals'], data?: any) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  
  // Toast notifications
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    duration?: number;
  }>;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
}

// Graph-specific UI state
interface GraphState {
  // View state
  selectedNodes: string[];
  selectedEdges: string[];
  hoveredNode: string | null;
  
  // Filter state
  filters: {
    healthStatus: HealthStatus[];
    memberTypes: MemberType[];
    roleTypes: RoleType[];
    showSupervision: boolean;
    showCompanionships: boolean;
  };
  
  // Layout state
  layout: {
    algorithm: 'force' | 'hierarchical' | 'circular';
    nodeSpacing: number;
    edgeLength: number;
  };
  
  // Interaction state
  isSelecting: boolean;
  isDragging: boolean;
  panPosition: { x: number; y: number };
  zoomLevel: number;
  
  // Actions
  setSelectedNodes: (nodeIds: string[]) => void;
  setFilters: (filters: Partial<GraphState['filters']>) => void;
  setLayout: (layout: Partial<GraphState['layout']>) => void;
  resetView: () => void;
}

// Form state for complex multi-step workflows
interface FormState {
  // Data import wizard state
  importWizard: {
    currentStep: number;
    uploadedFile: File | null;
    detectedColumns: string[];
    fieldMappings: Record<string, string>;
    validationResults: {
      validRows: number;
      invalidRows: number;
      errors: Array<{ row: number; field: string; message: string }>;
    };
    importProgress: {
      isImporting: boolean;
      progress: number;
      processedRows: number;
      totalRows: number;
    };
  };
  
  // Companionship wizard state
  companionshipWizard: {
    step: 'select-accompanied' | 'find-companions' | 'review-proposal';
    accompaniedMember: Member | null;
    eligibleCompanions: {
      perfectMatches: Member[];
      softViolations: Array<{ member: Member; violations: string[] }>;
    };
    selectedCompanion: Member | null;
    justification: string;
  };
  
  // Actions for form workflows
  setImportWizardStep: (step: number) => void;
  setFieldMappings: (mappings: Record<string, string>) => void;
  setCompanionshipWizardStep: (step: FormState['companionshipWizard']['step']) => void;
  resetFormState: () => void;
}

// ===============================
// Authentication State (Context + Query)
// ===============================

interface AuthContextType {
  // Session data (from TanStack Query)
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Permissions (cached via TanStack Query)
  permissions: UserPermissions | null;
  hasPermission: (action: string, scope?: string) => boolean;
  
  // Auth actions
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
```

#### State Management Patterns

**Server State Management (TanStack Query):**

- **Centralized Query Keys:** Hierarchical key structure for precise cache invalidation
- **Optimistic Updates:** Immediate UI updates with rollback on failure
- **Background Refetching:** Automatic data freshness with configurable stale times
- **Infinite Queries:** Pagination support for large member lists
- **Parallel Queries:** Simultaneous data fetching for dashboard views
- **Dependent Queries:** Conditional queries based on user permissions
- **Cache Persistence:** LocalStorage persistence for offline functionality

**UI State Management (Zustand):**

- **Slice Pattern:** Separate stores for different UI concerns
- **Immer Integration:** Immutable updates with simple mutation syntax
- **DevTools Support:** Redux DevTools integration for debugging
- **Persistence Middleware:** LocalStorage sync for user preferences
- **Computed Values:** Derived state with automatic dependency tracking
- **Action Creators:** Consistent action patterns across stores

**State Synchronization Patterns:**

- **Server-UI Bridge:** TanStack Query mutations trigger UI state updates
- **Optimistic UI:** Immediate feedback with server state reconciliation
- **Error Recovery:** Automatic rollback of optimistic updates on failure
- **Cache Invalidation:** Smart invalidation based on data relationships
- **Background Sync:** Periodic data synchronization for long-running sessions

**Performance Optimization Patterns:**

- **Selective Subscriptions:** Components subscribe only to needed state slices
- **Memoization:** React.memo and useMemo for expensive computations
- **Virtual Scrolling:** Efficient rendering of large member lists
- **Debounced Updates:** Prevent excessive API calls from user interactions
- **Code Splitting:** Lazy loading of heavy state management code

### Routing Architecture

Our routing architecture leverages Next.js App Router with file-based routing, implementing modern patterns for authentication, authorization, and user experience optimization.

#### Route Organization

```
apps/web/src/app/
├── layout.tsx                    # Root layout with providers
├── page.tsx                      # Home page (public)
├── loading.tsx                   # Global loading UI
├── error.tsx                     # Global error boundary
├── not-found.tsx                 # 404 page
│
├── (auth)/                       # Route group for authentication
│   ├── layout.tsx               # Auth layout (minimal, no navigation)
│   ├── login/
│   │   ├── page.tsx             # Login form
│   │   └── loading.tsx          # Login loading state
│   ├── register/
│   │   └── page.tsx             # Registration (if enabled)
│   └── forgot-password/
│       └── page.tsx             # Password reset
│
├── (dashboard)/                  # Route group for authenticated app
│   ├── layout.tsx               # Dashboard layout with navigation
│   ├── dashboard/
│   │   ├── page.tsx             # Main dashboard
│   │   ├── loading.tsx          # Dashboard loading skeleton
│   │   └── error.tsx            # Dashboard error boundary
│   │
│   ├── members/                 # Member management routes
│   │   ├── page.tsx             # Member list with filters/search
│   │   ├── loading.tsx          # Member list loading state
│   │   ├── create/
│   │   │   └── page.tsx         # Member creation form
│   │   └── [id]/                # Dynamic member routes
│   │       ├── page.tsx         # Member detail view
│   │       ├── edit/
│   │       │   └── page.tsx     # Member edit form
│   │       ├── roles/
│   │       │   └── page.tsx     # Role assignment for member
│   │       └── companionships/
│   │           └── page.tsx     # Member's companionship history
│   │
│   ├── companionships/          # Companionship management
│   │   ├── page.tsx             # Companionship list
│   │   ├── create/
│   │   │   └── page.tsx         # Manual companionship creation
│   │   ├── wizard/
│   │   │   └── page.tsx         # Guided assignment wizard
│   │   └── [id]/
│   │       ├── page.tsx         # Companionship detail
│   │       ├── edit/
│   │       │   └── page.tsx     # Edit companionship
│   │       └── approval/
│   │           └── page.tsx     # Approval workflow interface
│   │
│   ├── graph/                   # Graph visualization
│   │   ├── page.tsx             # Interactive graph view
│   │   ├── loading.tsx          # Graph loading with skeleton
│   │   └── error.tsx            # Graph-specific error handling
│   │
│   ├── import/                  # Data import workflows
│   │   ├── page.tsx             # Import dashboard
│   │   ├── upload/
│   │   │   └── page.tsx         # File upload step
│   │   ├── mapping/
│   │   │   └── page.tsx         # Field mapping step
│   │   ├── preview/
│   │   │   └── page.tsx         # Data preview and validation
│   │   └── results/
│   │       └── page.tsx         # Import results and errors
│   │
│   ├── reports/                 # Reporting and analytics
│   │   ├── page.tsx             # Report dashboard
│   │   ├── health/
│   │   │   └── page.tsx         # Relationship health reports
│   │   ├── coverage/
│   │   │   └── page.tsx         # Companionship coverage analysis
│   │   └── export/
│   │       └── page.tsx         # Data export utilities
│   │
│   └── settings/                # Application settings
│       ├── page.tsx             # User preferences
│       ├── profile/
│       │   └── page.tsx         # User profile management
│       ├── permissions/
│       │   └── page.tsx         # Role and permission management
│       └── system/
│           └── page.tsx         # System configuration (admin only)
│
└── api/                         # API routes (separate from pages)
    ├── auth/
    │   └── [...nextauth]/
    │       └── route.ts         # Auth.js configuration
    ├── members/
    │   ├── route.ts             # Member CRUD operations
    │   └── [id]/
    │       ├── route.ts         # Individual member operations
    │       └── roles/
    │           └── route.ts     # Member role management
    ├── companionships/
    │   ├── route.ts             # Companionship operations
    │   ├── [id]/
    │   │   └── route.ts         # Individual companionship operations
    │   └── wizard/
    │       └── route.ts         # Guided assignment API
    ├── graph/
    │   └── [unitId]/
    │       ├── route.ts         # Graph data API
    │       └── layout/
    │           └── route.ts     # Graph layout persistence
    └── import/
        ├── analyze/
        │   └── route.ts         # File analysis API
        └── execute/
            └── route.ts         # Import execution API
```

**Routing Principles:**

1. **File-Based Routing:** Leverage Next.js conventions for intuitive navigation
2. **Route Groups:** Organize related routes without affecting URL structure
3. **Nested Layouts:** Provide appropriate context and navigation for each section
4. **Loading States:** Implement skeleton UIs for better perceived performance
5. **Error Boundaries:** Graceful error handling at appropriate route levels
6. **SEO Optimization:** Server-side rendering for public pages

#### Protected Route Pattern

```typescript
// middleware.ts - Global route protection
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/forgot-password', '/'];
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users to login
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based route protection
    const adminRoutes = ['/settings/system', '/settings/permissions'];
    const delegateRoutes = ['/members', '/companionships', '/graph'];
    
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (!token.roles?.includes('admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    if (delegateRoutes.some(route => pathname.startsWith(route))) {
      if (!token.roles?.some(role => ['admin', 'delegate'].includes(role))) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

// Layout-level permission checking
// apps/web/src/app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Navigation } from '@/components/layout/Navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { PermissionProvider } from '@/components/providers/PermissionProvider';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Server-side authentication check
  if (!session?.user) {
    redirect('/login');
  }

  // Server-side permission check for dashboard access
  const hasMinimumAccess = session.user.roles?.some(role => 
    ['admin', 'delegate', 'supervisor'].includes(role)
  );

  if (!hasMinimumAccess) {
    redirect('/unauthorized');
  }

  return (
    <PermissionProvider session={session}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navigation />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </PermissionProvider>
  );
}

// Page-level permission component
// components/auth/ProtectedPage.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedPageProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackUrl?: string;
}

export function ProtectedPage({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackUrl = '/dashboard'
}: ProtectedPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.push('/login');
      return;
    }

    // Check role requirements
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role =>
        session.user.roles?.includes(role)
      );
      if (!hasRequiredRole) {
        router.push(fallbackUrl);
        return;
      }
    }

    // Check permission requirements
    if (requiredPermissions.length > 0) {
      const hasRequiredPermission = requiredPermissions.every(permission =>
        session.user.permissions?.includes(permission)
      );
      if (!hasRequiredPermission) {
        router.push(fallbackUrl);
        return;
      }
    }
  }, [session, status, router, requiredRoles, requiredPermissions, fallbackUrl]);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

// Usage in pages that need specific permissions
// app/(dashboard)/settings/system/page.tsx
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { SystemSettings } from '@/components/settings/SystemSettings';

export default function SystemSettingsPage() {
  return (
    <ProtectedPage 
      requiredRoles={['admin']}
      fallbackUrl="/dashboard"
    >
      <SystemSettings />
    </ProtectedPage>
  );
}

// Dynamic route with permission checking
// app/(dashboard)/members/[id]/edit/page.tsx
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { memberService } from '@/lib/api/memberService';
import { EditMemberForm } from '@/components/forms/EditMemberForm';

interface Props {
  params: { id: string };
}

export default async function EditMemberPage({ params }: Props) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  // Check if user can edit members
  const canEditMembers = session.user.permissions?.includes('edit_members') ||
                         session.user.roles?.includes('admin');
  
  if (!canEditMembers) {
    redirect('/members');
  }

  // Fetch member data server-side
  try {
    const member = await memberService.getMember(params.id);
    
    // Additional permission check: can user edit this specific member?
    const canEditThisMember = session.user.roles?.includes('admin') ||
                             member.geographicUnitId === session.user.geographicUnitId;
    
    if (!canEditThisMember) {
      redirect('/members');
    }

    return <EditMemberForm member={member} />;
  } catch (error) {
    notFound();
  }
}
```

**Routing Pattern Features:**

1. **Multi-Level Protection:** Middleware → Layout → Page → Component level security
2. **Role-Based Access:** Different routes for different user roles
3. **Permission Granularity:** Fine-grained permission checking at component level
4. **Server-Side Validation:** Authentication and authorization on the server
5. **Graceful Redirects:** Appropriate fallback URLs for unauthorized access
6. **SEO Friendly:** Server-side rendering with proper meta tags and redirects

### Frontend Services Layer

Our frontend services layer provides a clean abstraction between React components and backend APIs, implementing type-safe communication, error handling, caching strategies, and optimistic updates.

#### API Client Setup

```typescript
// lib/api/client.ts - Base API client configuration
import { QueryClient } from '@tanstack/react-query';
import { ApiError, ApiResponse } from '@/packages/shared-types';

// Global query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error instanceof ApiError && error.status === 401) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

// Base API client with interceptors
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Default headers
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Merge headers
    const headers = {
      ...defaultHeaders,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for auth
      });

      // Handle non-JSON responses (like file downloads)
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        // Try to parse error response
        let errorData: ApiError;
        if (contentType?.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorData = {
            status: response.status,
            message: response.statusText,
            code: 'HTTP_ERROR',
          };
        }
        throw new ApiError(errorData.message, errorData.status, errorData.code);
      }

      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }

      // Parse JSON response
      if (contentType?.includes('application/json')) {
        const data: ApiResponse<T> = await response.json();
        return data.data || data as T;
      }

      // Return response as-is for non-JSON content
      return response as unknown as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        'Network error or server unavailable',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    
    return this.request<T>(url, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // File upload with progress tracking
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.data || response);
          } catch {
            resolve(xhr.responseText as T);
          }
        } else {
          reject(new ApiError(xhr.statusText, xhr.status, 'UPLOAD_ERROR'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new ApiError('Upload failed', 0, 'NETWORK_ERROR'));
      });

      xhr.open('POST', `${this.baseURL}${endpoint}`);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.withCredentials = true;
      xhr.send(formData);
    });
  }
}

export const apiClient = new ApiClient();

// Custom error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

#### Service Example

```typescript
// lib/api/memberService.ts - Complete member service implementation
import { apiClient } from './client';
import { queryKeys } from './queryKeys';
import {
  Member,
  CreateMemberRequest,
  UpdateMemberRequest,
  MemberFilters,
  PaginatedResponse,
  Role,
  RoleAssignment,
} from '@/packages/shared-types';

export const memberService = {
  // ===============================
  // Query Functions (for TanStack Query)
  // ===============================

  // Get paginated member list with filters
  getMembers: async (
    unitId: string,
    filters: MemberFilters = {},
    page = 1,
    limit = 50
  ): Promise<PaginatedResponse<Member>> => {
    return apiClient.get<PaginatedResponse<Member>>('/members', {
      unitId,
      page,
      limit,
      ...filters,
    });
  },

  // Get single member by ID
  getMember: async (id: string): Promise<Member> => {
    return apiClient.get<Member>(`/members/${id}`);
  },

  // Get member roles and permissions
  getMemberRoles: async (memberId: string): Promise<RoleAssignment[]> => {
    return apiClient.get<RoleAssignment[]>(`/members/${memberId}/roles`);
  },

  // Get eligible companions for a member
  getEligibleCompanions: async (memberId: string): Promise<{
    perfectMatches: Member[];
    softViolations: Array<{ member: Member; violations: string[] }>;
  }> => {
    return apiClient.get(`/members/${memberId}/eligible-companions`);
  },

  // Search members with full-text search
  searchMembers: async (
    query: string,
    unitId?: string,
    limit = 20
  ): Promise<Member[]> => {
    return apiClient.get<Member[]>('/members/search', {
      q: query,
      unitId,
      limit,
    });
  },

  // ===============================
  // Mutation Functions
  // ===============================

  // Create new member
  createMember: async (data: CreateMemberRequest): Promise<Member> => {
    return apiClient.post<Member>('/members', data);
  },

  // Update existing member
  updateMember: async (
    id: string,
    data: UpdateMemberRequest
  ): Promise<Member> => {
    return apiClient.put<Member>(`/members/${id}`, data);
  },

  // Delete member (soft delete)
  deleteMember: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/members/${id}`);
  },

  // Assign role to member
  assignRole: async (
    memberId: string,
    roleId: string,
    scopeId: string
  ): Promise<RoleAssignment> => {
    return apiClient.post<RoleAssignment>(`/members/${memberId}/roles`, {
      roleId,
      scopeId,
    });
  },

  // Remove role from member
  removeRole: async (
    memberId: string,
    roleAssignmentId: string
  ): Promise<void> => {
    return apiClient.delete<void>(
      `/members/${memberId}/roles/${roleAssignmentId}`
    );
  },

  // Bulk import members from file
  importMembers: async (
    file: File,
    mappings: Record<string, string>,
    onProgress?: (progress: number) => void
  ): Promise<{
    successCount: number;
    errorCount: number;
    errors: Array<{ row: number; message: string }>;
  }> => {
    return apiClient.uploadFile(
      '/members/import',
      file,
      { mappings: JSON.stringify(mappings) },
      onProgress
    );
  },

  // Export members to CSV
  exportMembers: async (
    unitId: string,
    filters: MemberFilters = {}
  ): Promise<Blob> => {
    const response = await fetch('/api/members/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ unitId, filters }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },
};

// ===============================
// React Hook Wrappers
// ===============================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';

// Hook for fetching members with automatic caching
export function useMembers(
  unitId: string,
  filters: MemberFilters = {},
  options?: {
    page?: number;
    limit?: number;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: queryKeys.members.list({ unitId, ...filters }),
    queryFn: () =>
      memberService.getMembers(
        unitId,
        filters,
        options?.page,
        options?.limit
      ),
    enabled: options?.enabled !== false,
    keepPreviousData: true, // For pagination
  });
}

// Hook for fetching single member
export function useMember(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.members.detail(id),
    queryFn: () => memberService.getMember(id),
    enabled: enabled && !!id,
  });
}

// Hook for member creation with optimistic updates
export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memberService.createMember,
    onMutate: async (newMember) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.members.lists() });

      // Snapshot the previous value
      const previousMembers = queryClient.getQueriesData({
        queryKey: queryKeys.members.lists(),
      });

      // Optimistically update member lists
      queryClient.setQueriesData<PaginatedResponse<Member>>(
        { queryKey: queryKeys.members.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: [{ ...newMember, id: `temp-${Date.now()}` } as Member, ...old.data],
            total: old.total + 1,
          };
        }
      );

      return { previousMembers };
    },
    onError: (err, newMember, context) => {
      // Rollback optimistic updates
      if (context?.previousMembers) {
        context.previousMembers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(`Failed to create member: ${err.message}`);
    },
    onSuccess: (member) => {
      // Invalidate and refetch member queries
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      toast.success('Member created successfully');
    },
  });
}

// Hook for member updates
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMemberRequest }) =>
      memberService.updateMember(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.members.detail(id) });

      const previousMember = queryClient.getQueryData(queryKeys.members.detail(id));

      // Optimistically update member
      queryClient.setQueryData(queryKeys.members.detail(id), (old: Member) => ({
        ...old,
        ...data,
      }));

      return { previousMember };
    },
    onError: (err, { id }, context) => {
      if (context?.previousMember) {
        queryClient.setQueryData(queryKeys.members.detail(id), context.previousMember);
      }
      toast.error(`Failed to update member: ${err.message}`);
    },
    onSuccess: (updatedMember, { id }) => {
      // Update the specific member in cache
      queryClient.setQueryData(queryKeys.members.detail(id), updatedMember);
      // Invalidate member lists to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.members.lists() });
      toast.success('Member updated successfully');
    },
  });
}

// Hook for role assignment
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      roleId,
      scopeId,
    }: {
      memberId: string;
      roleId: string;
      scopeId: string;
    }) => memberService.assignRole(memberId, roleId, scopeId),
    onSuccess: (roleAssignment, { memberId }) => {
      // Invalidate member roles
      queryClient.invalidateQueries({
        queryKey: queryKeys.members.roles(memberId),
      });
      // Invalidate member details to refresh permissions
      queryClient.invalidateQueries({
        queryKey: queryKeys.members.detail(memberId),
      });
      toast.success('Role assigned successfully');
    },
    onError: (err) => {
      toast.error(`Failed to assign role: ${err.message}`);
    },
  });
}

// Hook for member search with debouncing
export function useMemberSearch(query: string, unitId?: string) {
  return useQuery({
    queryKey: queryKeys.members.search(query, unitId),
    queryFn: () => memberService.searchMembers(query, unitId),
    enabled: query.length >= 2, // Only search with 2+ characters
    staleTime: 30 * 1000, // 30 seconds for search results
  });
}
```

**Service Layer Features:**

1. **Type-Safe Communication:** Full TypeScript integration with shared interfaces
2. **Error Handling:** Comprehensive error handling with user-friendly messages
3. **Optimistic Updates:** Immediate UI feedback with automatic rollback on failure
4. **File Upload Support:** Progress tracking and error handling for large files
5. **Caching Strategy:** Intelligent cache invalidation and background refetching
6. **Request Deduplication:** Automatic deduplication of identical requests
7. **Offline Support:** Cache persistence and retry mechanisms
8. **Performance Optimization:** Pagination, search debouncing, and selective updates

**Integration Patterns:**

- **React Hook Wrappers:** Custom hooks that encapsulate common query and mutation patterns
- **Cache Management:** Sophisticated cache invalidation strategies based on data relationships
- **State Synchronization:** Automatic UI updates when server state changes
- **Error Recovery:** Graceful handling of network failures and server errors
- **Background Sync:** Automatic data refetching and cache updates

## Backend Architecture

This section defines backend-specific architecture details for our Next.js serverless API implementation, including service organization, database access patterns, and authentication strategies.

### Service Architecture

Our backend follows a serverless architecture using Next.js API routes deployed as Vercel serverless functions, organized into modular business domains with clean separation of concerns.

#### Function Organization

```
apps/web/src/app/api/                    # Next.js API routes (serverless functions)
├── auth/
│   └── [...nextauth]/
│       └── route.ts                     # Auth.js configuration and handlers
│
├── members/                             # Member management endpoints
│   ├── route.ts                         # GET /api/members, POST /api/members
│   ├── search/
│   │   └── route.ts                     # GET /api/members/search
│   ├── export/
│   │   └── route.ts                     # POST /api/members/export
│   ├── import/
│   │   ├── analyze/
│   │   │   └── route.ts                 # POST /api/members/import/analyze
│   │   └── execute/
│   │       └── route.ts                 # POST /api/members/import/execute
│   └── [id]/                            # Dynamic member routes
│       ├── route.ts                     # GET, PUT, DELETE /api/members/{id}
│       ├── roles/
│       │   └── route.ts                 # GET, POST /api/members/{id}/roles
│       ├── eligible-companions/
│       │   └── route.ts                 # GET /api/members/{id}/eligible-companions
│       └── companionships/
│           └── route.ts                 # GET /api/members/{id}/companionships
│
├── companionships/                      # Companionship management endpoints
│   ├── route.ts                         # GET /api/companionships, POST /api/companionships
│   ├── direct/
│   │   └── route.ts                     # POST /api/companionships/direct (skip approval)
│   ├── reassign/
│   │   └── route.ts                     # POST /api/companionships/reassign
│   ├── wizard/
│   │   └── route.ts                     # POST /api/companionships/wizard
│   └── [id]/                            # Dynamic companionship routes
│       ├── route.ts                     # GET, PUT, DELETE /api/companionships/{id}
│       ├── health/
│       │   └── route.ts                 # PATCH /api/companionships/{id}/health
│       ├── approval/
│       │   └── route.ts                 # GET, POST /api/companionships/{id}/approval
│       └── archive/
│           └── route.ts                 # POST /api/companionships/{id}/archive
│
├── graph/                               # Graph visualization endpoints
│   └── [unitId]/
│       ├── route.ts                     # GET /api/graph/{unitId} (graph data)
│       └── layout/
│           └── route.ts                 # GET, PATCH /api/graph/{unitId}/layout
│
├── geographic/                          # Geographic unit endpoints
│   ├── route.ts                         # GET /api/geographic (units tree)
│   ├── [id]/
│   │   └── route.ts                     # GET /api/geographic/{id}
│   └── units/
│       ├── descendants/
│       │   └── [id]/
│       │       └── route.ts             # GET /api/geographic/units/descendants/{id}
│       └── ancestors/
│           └── [id]/
│               └── route.ts             # GET /api/geographic/units/ancestors/{id}
│
├── roles/                               # Role management endpoints
│   ├── route.ts                         # GET /api/roles
│   └── [id]/
│       └── route.ts                     # GET /api/roles/{id}
│
└── health/                              # Health check and monitoring
    └── route.ts                         # GET /api/health
```

**Function Organization Principles:**

1. **Resource-Based Routing:** API routes follow RESTful resource patterns
2. **Nested Resources:** Hierarchical relationships reflected in URL structure
3. **Business Domain Grouping:** Functions organized by business capability
4. **Single Responsibility:** Each route handles one specific operation
5. **Serverless Optimization:** Stateless functions with minimal cold start overhead

#### Function Template

```typescript
// Example: Complete API route with all modern patterns
// app/api/members/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { memberModule } from '@/lib/modules/memberModule';
import { geographicModule } from '@/lib/modules/geographicModule';
import { authModule } from '@/lib/modules/authModule';
import { 
  CreateMemberRequestSchema, 
  MemberFiltersSchema,
  ApiResponse,
  ApiError 
} from '@/packages/shared-types';
import { prisma } from '@/lib/prisma';

// Input validation schemas
const GetMembersQuerySchema = z.object({
  unitId: z.string().uuid(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  maritalStatus: z.enum(['single', 'married', 'widowed', 'consecrated']).optional(),
  accompanyingReadiness: z.enum(['Not Candidate', 'Candidate', 'Ready', 'Active', 'Overwhelmed', 'Deactivated']).optional(),
});

// GET /api/members - List members with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication & Session Management
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Input Validation
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);
    
    const validatedQuery = GetMembersQuerySchema.safeParse(queryParams);
    if (!validatedQuery.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          code: 'VALIDATION_ERROR',
          details: validatedQuery.error.issues 
        },
        { status: 400 }
      );
    }

    const { unitId, page, limit, ...filters } = validatedQuery.data;

    // 3. Authorization Checks
    const hasPermission = await authModule.hasPermission(
      session.user.id, 
      'read_members', 
      unitId
    );
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // 4. Geographic Scope Validation
    const validScope = await geographicModule.validateUserScope(
      session.user.id, 
      unitId
    );
    
    if (!validScope) {
      return NextResponse.json(
        { error: 'Invalid geographic scope', code: 'INVALID_SCOPE' },
        { status: 403 }
      );
    }

    // 5. Business Logic Execution
    const result = await memberModule.getMembers(unitId, filters, page, limit);

    // 6. Response Formatting
    const response: ApiResponse<typeof result> = {
      data: result,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    // 7. Error Handling
    console.error('GET /api/members error:', error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// POST /api/members - Create new member
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Input Validation
    const body = await request.json();
    const validatedData = CreateMemberRequestSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: 'Invalid member data', 
          code: 'VALIDATION_ERROR',
          details: validatedData.error.issues 
        },
        { status: 400 }
      );
    }

    const memberData = validatedData.data;

    // 3. Authorization
    const hasPermission = await authModule.hasPermission(
      session.user.id, 
      'create_members', 
      memberData.geographicUnitId
    );
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create members', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // 4. Business Logic with Transaction
    const member = await prisma.$transaction(async (tx) => {
      // Validate business constraints
      await memberModule.validateMemberConstraints(memberData, tx);
      
      // Create member
      return await memberModule.createMember(memberData, tx);
    });

    // 5. Success Response
    const response: ApiResponse<typeof member> = {
      data: member,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('POST /api/members error:', error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create member', code: 'CREATION_FAILED' },
      { status: 500 }
    );
  }
}

// OPTIONS - CORS preflight for browser requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

**Serverless Function Features:**

1. **Stateless Design:** No server state, all data from database/external services
2. **Edge Optimization:** Deployed to Vercel Edge Network for global performance
3. **Auto-Scaling:** Automatic scaling based on request volume
4. **Cold Start Optimization:** Minimal dependencies and lazy loading
5. **Transaction Support:** Database transactions for data consistency
6. **Type Safety:** End-to-end TypeScript with shared schemas
7. **Error Boundaries:** Comprehensive error handling with proper HTTP status codes
8. **Security Layers:** Authentication, authorization, and input validation

### Database Architecture

Our database architecture leverages PostgreSQL as the primary data store with Prisma as the ORM, implementing repository patterns and optimized access patterns for our serverless environment.

#### Schema Design

The database schema is already comprehensively documented in the Database Schema section above. The key design principles for our serverless architecture include:

**Performance Optimizations:**
- **Connection Pooling:** Prisma connection pool optimized for serverless functions
- **Query Optimization:** Strategic indexes on frequently queried fields
- **Batch Operations:** Efficient bulk operations for data import/export
- **Read Replicas:** Potential for read scaling with Vercel Postgres

**Serverless Considerations:**
- **Connection Management:** Prisma handles connection lifecycle for short-lived functions
- **Cold Start Mitigation:** Database connections warmed up efficiently
- **Transaction Boundaries:** Clear transaction scopes for data consistency

#### Data Access Layer

```typescript
// lib/modules/memberModule.ts - Repository pattern implementation
import { PrismaClient, Prisma } from '@prisma/client';
import { 
  Member, 
  CreateMemberRequest, 
  UpdateMemberRequest, 
  MemberFilters,
  PaginatedResponse 
} from '@/packages/shared-types';
import { ApiError } from '@/lib/errors';

// Prisma singleton for serverless optimization
import { prisma } from '@/lib/prisma';

export class MemberRepository {
  constructor(private db: PrismaClient = prisma) {}

  // ===============================
  // Query Methods
  // ===============================

  async findMany(
    unitId: string,
    filters: MemberFilters = {},
    page = 1,
    limit = 50,
    tx?: Prisma.TransactionClient
  ): Promise<PaginatedResponse<Member>> {
    const db = tx || this.db;
    
    // Build dynamic where clause
    const where: Prisma.MemberWhereInput = {
      geographicUnitId: unitId,
      ...this.buildFilterClause(filters),
    };

    // Execute count and data queries in parallel
    const [total, members] = await Promise.all([
      db.member.count({ where }),
      db.member.findMany({
        where,
        include: {
          geographicUnit: true,
          couple: true,
          roleAssignments: {
            include: {
              role: true,
              scope: true,
            },
          },
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: members as Member[],
      total,
      page,
      limit,
    };
  }

  async findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<Member | null> {
    const db = tx || this.db;
    
    const member = await db.member.findUnique({
      where: { id },
      include: {
        geographicUnit: true,
        couple: true,
        roleAssignments: {
          include: {
            role: true,
            scope: true,
          },
        },
        asCompanion: {
          include: {
            accompanied: true,
          },
        },
        asAccompanied: {
          include: {
            companion: true,
          },
        },
      },
    });

    return member as Member | null;
  }

  async searchByText(
    query: string,
    unitId?: string,
    limit = 20,
    tx?: Prisma.TransactionClient
  ): Promise<Member[]> {
    const db = tx || this.db;
    
    const where: Prisma.MemberWhereInput = {
      ...(unitId && { geographicUnitId: unitId }),
      OR: [
        { 
          firstName: { 
            contains: query, 
            mode: 'insensitive' 
          } 
        },
        { 
          lastName: { 
            contains: query, 
            mode: 'insensitive' 
          } 
        },
        { 
          email: { 
            contains: query, 
            mode: 'insensitive' 
          } 
        },
      ],
    };

    const members = await db.member.findMany({
      where,
      include: {
        geographicUnit: true,
      },
      orderBy: {
        _relevance: {
          fields: ['firstName', 'lastName'],
          search: query,
          sort: 'desc',
        },
      },
      take: limit,
    });

    return members as Member[];
  }

  // ===============================
  // Mutation Methods
  // ===============================

  async create(
    data: CreateMemberRequest,
    tx?: Prisma.TransactionClient
  ): Promise<Member> {
    const db = tx || this.db;
    
    try {
      const member = await db.member.create({
        data: {
          ...data,
          passwordHash: await this.hashPassword(data.password),
        },
        include: {
          geographicUnit: true,
        },
      });

      return member as Member;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ApiError('Email already exists', 409, 'DUPLICATE_EMAIL');
        }
      }
      throw error;
    }
  }

  async update(
    id: string,
    data: UpdateMemberRequest,
    tx?: Prisma.TransactionClient
  ): Promise<Member> {
    const db = tx || this.db;
    
    try {
      const updateData: any = { ...data };
      
      // Hash password if provided
      if (data.password) {
        updateData.passwordHash = await this.hashPassword(data.password);
        delete updateData.password;
      }

      const member = await db.member.update({
        where: { id },
        data: updateData,
        include: {
          geographicUnit: true,
          roleAssignments: {
            include: {
              role: true,
              scope: true,
            },
          },
        },
      });

      return member as Member;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ApiError('Member not found', 404, 'MEMBER_NOT_FOUND');
        }
      }
      throw error;
    }
  }

  async delete(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const db = tx || this.db;
    
    try {
      // Soft delete by updating a deletedAt timestamp
      await db.member.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          email: null, // Clear email to allow reuse
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ApiError('Member not found', 404, 'MEMBER_NOT_FOUND');
        }
      }
      throw error;
    }
  }

  // ===============================
  // Business Logic Methods
  // ===============================

  async validateConstraints(
    data: CreateMemberRequest | UpdateMemberRequest,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const db = tx || this.db;
    
    // Check if email is already in use (for create or email update)
    if ('email' in data && data.email) {
      const existing = await db.member.findUnique({
        where: { email: data.email },
      });
      
      if (existing) {
        throw new ApiError('Email already in use', 409, 'DUPLICATE_EMAIL');
      }
    }

    // Validate geographic unit exists
    if ('geographicUnitId' in data && data.geographicUnitId) {
      const unit = await db.geographicUnit.findUnique({
        where: { id: data.geographicUnitId },
      });
      
      if (!unit) {
        throw new ApiError('Invalid geographic unit', 400, 'INVALID_GEOGRAPHIC_UNIT');
      }
    }

    // Additional business rule validations...
  }

  // ===============================
  // Utility Methods
  // ===============================

  private buildFilterClause(filters: MemberFilters): Prisma.MemberWhereInput {
    const where: Prisma.MemberWhereInput = {};

    if (filters.gender) {
      where.gender = filters.gender;
    }

    if (filters.maritalStatus) {
      where.maritalStatus = filters.maritalStatus;
    }

    if (filters.accompanyingReadiness) {
      where.accompanyingReadiness = filters.accompanyingReadiness;
    }

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Exclude soft-deleted members
    where.deletedAt = null;

    return where;
  }

  private async hashPassword(password: string): Promise<string> {
    const { hash } = await import('argon2');
    return hash(password);
  }
}

// Module-level business logic
export const memberModule = {
  repository: new MemberRepository(),

  async getMembers(
    unitId: string,
    filters: MemberFilters = {},
    page = 1,
    limit = 50
  ): Promise<PaginatedResponse<Member>> {
    return this.repository.findMany(unitId, filters, page, limit);
  },

  async getMember(id: string): Promise<Member> {
    const member = await this.repository.findById(id);
    if (!member) {
      throw new ApiError('Member not found', 404, 'MEMBER_NOT_FOUND');
    }
    return member;
  },

  async createMember(
    data: CreateMemberRequest,
    tx?: Prisma.TransactionClient
  ): Promise<Member> {
    await this.repository.validateConstraints(data, tx);
    return this.repository.create(data, tx);
  },

  async updateMember(
    id: string,
    data: UpdateMemberRequest,
    tx?: Prisma.TransactionClient
  ): Promise<Member> {
    await this.repository.validateConstraints(data, tx);
    return this.repository.update(id, data, tx);
  },

  async deleteMember(id: string): Promise<void> {
    return this.repository.delete(id);
  },

  async searchMembers(
    query: string,
    unitId?: string,
    limit = 20
  ): Promise<Member[]> {
    return this.repository.searchByText(query, unitId, limit);
  },

  async validateMemberConstraints(
    data: CreateMemberRequest | UpdateMemberRequest,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    return this.repository.validateConstraints(data, tx);
  },
};
```

**Data Access Features:**

1. **Repository Pattern:** Clean separation between business logic and data access
2. **Transaction Support:** Proper transaction boundaries for complex operations
3. **Type Safety:** Full TypeScript integration with Prisma generated types
4. **Connection Optimization:** Prisma connection pooling for serverless functions
5. **Error Handling:** Structured error handling with business context
6. **Query Optimization:** Efficient queries with proper indexing strategies
7. **Business Rule Validation:** Centralized constraint validation
8. **Soft Deletes:** Data preservation with logical deletion

### Authentication and Authorization

Our authentication architecture leverages Auth.js (NextAuth) v5 for session management with JWT tokens and implements fine-grained role-based access control throughout the application.

#### Auth Flow

```mermaid
sequenceDiagram
    actor User as Delegate
    participant Browser as Browser
    participant AuthAPI as "/api/auth/*<br/>(Auth.js)"
    participant AuthModule as "Auth Module"
    participant MemberModule as "Member Module"
    participant Database as "PostgreSQL"

    Note over User, Database: Login Flow

    User->>Browser: 1. Navigate to /login
    Browser->>AuthAPI: 2. GET /api/auth/signin
    AuthAPI-->>Browser: 3. Login form rendered
    
    User->>Browser: 4. Submit credentials
    Browser->>AuthAPI: 5. POST /api/auth/signin (email, password)
    
    AuthAPI->>AuthModule: 6. validateCredentials(email, password)
    AuthModule->>Database: 7. Query member by email
    Database-->>AuthModule: 8. Member record with passwordHash
    
    AuthModule->>AuthModule: 9. Verify password with Argon2
    
    alt Valid Credentials
        AuthModule-->>AuthAPI: 10. Authentication success
        AuthAPI->>MemberModule: 11. getMemberRoles(userId)
        MemberModule->>Database: 12. Query role assignments
        Database-->>MemberModule: 13. Role and permission data
        MemberModule-->>AuthAPI: 14. User roles and permissions
        
        AuthAPI->>AuthAPI: 15. Generate JWT session token
        AuthAPI-->>Browser: 16. Set secure httpOnly cookie + redirect
        Browser->>Browser: 17. Store session, redirect to /dashboard
        Browser-->>User: 18. Authenticated dashboard view
        
    else Invalid Credentials
        AuthModule-->>AuthAPI: 10. Authentication failed
        AuthAPI-->>Browser: 16. Error response
        Browser-->>User: 17. Show error message
    end

    Note over User, Database: Protected Resource Access

    User->>Browser: 19. Request protected resource
    Browser->>AuthAPI: 20. Include session cookie
    AuthAPI->>AuthAPI: 21. Verify JWT token signature
    AuthAPI->>AuthAPI: 22. Check token expiration
    
    alt Valid Session
        AuthAPI->>AuthModule: 23. hasPermission(userId, action, scope)
        AuthModule->>Database: 24. Query user permissions
        Database-->>AuthModule: 25. Permission check result
        AuthModule-->>AuthAPI: 26. Authorization decision
        
        alt Authorized
            AuthAPI-->>Browser: 27. Resource access granted
            Browser-->>User: 28. Display requested content
        else Unauthorized
            AuthAPI-->>Browser: 27. 403 Forbidden
            Browser-->>User: 28. Access denied message
        end
        
    else Invalid Session
        AuthAPI-->>Browser: 21. 401 Unauthorized + redirect
        Browser->>Browser: 22. Clear local session
        Browser-->>User: 23. Redirect to login
    end

    Note over User, Database: Logout Flow

    User->>Browser: 29. Click logout
    Browser->>AuthAPI: 30. POST /api/auth/signout
    AuthAPI->>AuthAPI: 31. Invalidate session token
    AuthAPI-->>Browser: 32. Clear cookies + redirect
    Browser->>Browser: 33. Clear local session data
    Browser-->>User: 34. Redirect to login page
```

#### Middleware/Guards

```typescript
// middleware.ts - Global authentication and authorization middleware
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Define route patterns and their required permissions
    const routePermissions = {
      // Public routes (no authentication required)
      public: [
        '/',
        '/login',
        '/register',
        '/forgot-password',
        '/api/health',
      ],
      
      // Admin-only routes
      admin: [
        '/settings/system',
        '/settings/permissions',
        '/api/admin',
      ],
      
      // Delegate routes (requires delegate or admin role)
      delegate: [
        '/dashboard',
        '/members',
        '/companionships',
        '/graph',
        '/import',
        '/reports',
        '/api/members',
        '/api/companionships',
        '/api/graph',
      ],
      
      // User profile routes (any authenticated user)
      authenticated: [
        '/settings/profile',
        '/api/auth',
      ],
    };

    // Check if route is public
    if (routePermissions.public.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    )) {
      return NextResponse.next();
    }

    // Require authentication for all other routes
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin routes
    if (routePermissions.admin.some(route => 
      pathname.startsWith(route)
    )) {
      if (!token.roles?.includes('admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Check delegate routes
    if (routePermissions.delegate.some(route => 
      pathname.startsWith(route)
    )) {
      const hasAccess = token.roles?.some(role => 
        ['admin', 'delegate', 'supervisor'].includes(role)
      );
      
      if (!hasAccess) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Geographic scope validation for API routes
    if (pathname.startsWith('/api/') && token.geographicUnitId) {
      const response = NextResponse.next();
      response.headers.set('X-User-Geographic-Unit', token.geographicUnitId);
      response.headers.set('X-User-Roles', JSON.stringify(token.roles));
      return response;
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This callback is called for every request
        // Return true to allow the middleware function to run
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
      error: '/auth/error',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints handled by Auth.js)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

// lib/auth.ts - Auth.js configuration
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { authModule } from '@/lib/modules/authModule';
import { memberModule } from '@/lib/modules/memberModule';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Authenticate user
          const user = await authModule.validateCredentials(
            credentials.email,
            credentials.password
          );

          if (!user) {
            return null;
          }

          // Get user roles and permissions
          const roles = await memberModule.getMemberRoles(user.id);
          
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            roles: roles.map(r => r.role.name),
            geographicUnitId: user.geographicUnitId,
            permissions: roles.flatMap(r => r.role.permissions || []),
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist user data to token
      if (user) {
        token.roles = user.roles;
        token.geographicUnitId = user.geographicUnitId;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.sub!;
        session.user.roles = token.roles as string[];
        session.user.geographicUnitId = token.geographicUnitId as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
});

// lib/modules/authModule.ts - Authentication business logic
import { verify } from 'argon2';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import type { Member } from '@/packages/shared-types';

export const authModule = {
  async validateCredentials(
    email: string, 
    password: string
  ): Promise<Member | null> {
    try {
      const member = await prisma.member.findUnique({
        where: { 
          email: email.toLowerCase(),
          deletedAt: null, // Exclude soft-deleted members
        },
        include: {
          geographicUnit: true,
        },
      });

      if (!member || !member.passwordHash) {
        return null;
      }

      const isValid = await verify(member.passwordHash, password);
      if (!isValid) {
        return null;
      }

      // Don't return password hash
      const { passwordHash, ...memberWithoutPassword } = member;
      return memberWithoutPassword as Member;
      
    } catch (error) {
      console.error('Credential validation error:', error);
      return null;
    }
  },

  async hasPermission(
    userId: string,
    action: string,
    scopeId?: string
  ): Promise<boolean> {
    try {
      const roleAssignments = await prisma.roleAssignment.findMany({
        where: {
          memberId: userId,
          ...(scopeId && { scopeId }),
        },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
          scope: true,
        },
      });

      // Check if user has the required permission
      const hasDirectPermission = roleAssignments.some(assignment =>
        assignment.role.permissions?.some(perm => perm.name === action)
      );

      if (hasDirectPermission) {
        return true;
      }

      // Check for admin override
      const isAdmin = roleAssignments.some(assignment =>
        assignment.role.name === 'admin'
      );

      if (isAdmin) {
        return true;
      }

      // Check geographic scope hierarchy
      if (scopeId) {
        return this.checkHierarchicalPermission(
          roleAssignments,
          action,
          scopeId
        );
      }

      return false;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  },

  private async checkHierarchicalPermission(
    roleAssignments: any[],
    action: string,
    targetScopeId: string
  ): Promise<boolean> {
    // Implementation for checking if user has permission in parent geographic units
    // This allows supervisors at higher levels to manage lower-level units
    
    for (const assignment of roleAssignments) {
      if (assignment.role.permissions?.some((perm: any) => perm.name === action)) {
        // Check if assignment scope is parent of target scope
        const isParentScope = await this.isParentGeographicUnit(
          assignment.scopeId,
          targetScopeId
        );
        
        if (isParentScope) {
          return true;
        }
      }
    }

    return false;
  },

  private async isParentGeographicUnit(
    parentId: string,
    childId: string
  ): Promise<boolean> {
    // Recursive check up the geographic hierarchy
    let currentUnit = await prisma.geographicUnit.findUnique({
      where: { id: childId },
    });

    while (currentUnit?.parentId) {
      if (currentUnit.parentId === parentId) {
        return true;
      }
      
      currentUnit = await prisma.geographicUnit.findUnique({
        where: { id: currentUnit.parentId },
      });
    }

    return false;
  },

  async refreshUserPermissions(userId: string): Promise<{
    roles: string[];
    permissions: string[];
    geographicUnitId: string;
  }> {
    const member = await prisma.member.findUnique({
      where: { id: userId },
      include: {
        roleAssignments: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    });

    if (!member) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const roles = member.roleAssignments.map(assignment => assignment.role.name);
    const permissions = member.roleAssignments.flatMap(assignment =>
      assignment.role.permissions?.map(perm => perm.name) || []
    );

    return {
      roles: [...new Set(roles)], // Remove duplicates
      permissions: [...new Set(permissions)], // Remove duplicates
      geographicUnitId: member.geographicUnitId,
    };
  },
};
```

**Authentication Features:**

1. **JWT-Based Sessions:** Stateless authentication with secure token management
2. **Role-Based Access Control:** Fine-grained permissions with geographic scope
3. **Hierarchical Permissions:** Parent geographic units can manage children
4. **Middleware Protection:** Global route protection with role validation
5. **Session Management:** Automatic token refresh and secure cookie handling
6. **Password Security:** Argon2 hashing with salt for password storage
7. **Audit Trail:** Login attempts and permission checks logged
8. **Security Headers:** CSRF protection and secure cookie configuration

-----

## Unified Project Structure

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

### Key Structural Decisions

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

## Development Workflow

This section defines the development setup and workflow for our fullstack Next.js application, providing comprehensive guidance for setting up local development environment and daily development commands.

### Local Development Setup

#### Prerequisites

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

#### Initial Setup

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

#### Development Commands

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

### Environment Configuration

#### Required Environment Variables

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
NEXT_PUBLIC_ENABLE_GRAPH_VIEW="true"
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

## Deployment Architecture

This section defines our deployment strategy based on our Vercel platform choice, including CI/CD pipeline configuration and environment management for our fullstack Next.js application.

### Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel (Edge Network)
- **Build Command:** `pnpm build`
- **Output Directory:** `.next` (Next.js build output)
- **CDN/Edge:** Vercel Global Edge Network with automatic static optimization

**Backend Deployment:**
- **Platform:** Vercel Serverless Functions
- **Build Command:** `pnpm build` (includes API routes)
- **Deployment Method:** Git-based continuous deployment with automatic serverless function creation

### CI/CD Pipeline

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

### Environments

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

### Infrastructure as Code

- **Tool:** Vercel CLI v33.0+ and GitHub Actions
- **Location:** `.github/workflows/ci-cd.yml` (GitHub Actions configuration) and `vercel.json` (Vercel platform configuration)
- **Approach:** Declarative configuration using Vercel's platform-as-a-service model with GitHub Actions for CI/CD orchestration

The `vercel.json` file provides platform-specific configuration for deployment settings, routing rules, and environment variables, while the GitHub Actions workflow (shown above) handles the complete CI/CD pipeline automation.

### Environment Promotion Flow

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

### Rollback Strategy

- **Primary Method:** Git-based rollback using Vercel's deployment history and database migration reversals
- **Trigger Conditions:** Failed health checks, critical errors in production, or manual intervention due to business requirements
- **Recovery Time Objective:** Under 5 minutes for application rollback, under 15 minutes for database rollback including migration reversals

#### Rollback Procedures

1. **Application Rollback**: Use Vercel dashboard or CLI to revert to previous successful deployment
2. **Database Rollback**: Execute pre-prepared rollback migration scripts for schema changes
3. **Verification**: Automated health checks confirm system stability post-rollback
4. **Communication**: Automated notifications to development team and stakeholders

-----

## Testing Strategy

This section defines a comprehensive testing approach for the fullstack application, providing detailed guidance for AI agents and development teams. All testing practices align with Test-Driven Development (TDD) methodology and architectural decisions.

### Testing Pyramid

```text
           E2E Tests
          /         \
     Integration Tests
    /                 \
Frontend Unit    Backend Unit
```

**Distribution Strategy:**
- **70% Unit Tests:** Fast, isolated tests for business logic and components
- **20% Integration Tests:** Module interactions, database operations, API endpoints
- **10% E2E Tests:** Critical user journeys and complete workflow validation

**Philosophy:**
- Test-Driven Development (TDD) - Write tests before implementation code
- Coverage Goals: 90% business logic modules, 80% overall project, 100% critical constraints
- Follow Red-Green-Refactor cycle for all new features

### Test Organization

#### Frontend Tests

```text
apps/web/src/
├── components/
│   ├── MemberForm/
│   │   ├── MemberForm.tsx
│   │   ├── MemberForm.test.tsx
│   │   └── __tests__/
│   │       └── fixtures/
│   │           └── memberFormData.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useAuth.test.ts
│   └── __tests__/
│       └── fixtures/
│           └── authData.ts
├── lib/
│   ├── api/
│   │   ├── memberService.ts
│   │   └── memberService.test.ts
│   └── utils/
│       ├── validation.ts
│       └── validation.test.ts
└── stores/
    ├── authStore.ts
    └── authStore.test.ts
```

**Frontend Test Categories:**
- **Component Tests:** React Testing Library for UI components, user interactions
- **Hook Tests:** Custom hooks with React Testing Library's renderHook
- **Service Tests:** API client functions with MSW for HTTP mocking
- **Store Tests:** Zustand state management with isolated state scenarios
- **Utility Tests:** Pure functions for validation, formatting, business logic

#### Backend Tests

```text
apps/web/src/
├── app/api/
│   ├── members/
│   │   ├── route.ts
│   │   ├── route.test.ts
│   │   └── __tests__/
│   │       └── fixtures/
│   │           └── memberApiData.ts
├── lib/modules/
│   ├── authModule/
│   │   ├── authModule.ts
│   │   ├── authModule.test.ts
│   │   └── __tests__/
│   │       └── fixtures/
│   │           └── authTestData.ts
│   ├── memberModule/
│   │   ├── memberModule.ts
│   │   ├── memberModule.test.ts
│   │   └── __tests__/
│   │       └── fixtures/
│   │           └── memberTestData.ts
└── tests/integration/
    ├── api/
    │   ├── members.integration.test.ts
    │   └── auth.integration.test.ts
    └── modules/
        ├── memberModule.integration.test.ts
        └── authModule.integration.test.ts
```

**Backend Test Categories:**
- **API Route Tests:** Next.js API handlers with request/response validation
- **Module Tests:** Business logic modules with database mocking
- **Integration Tests:** Module interactions with Testcontainers PostgreSQL
- **Database Tests:** Prisma operations with transaction rollback
- **Middleware Tests:** Authentication, authorization, error handling

#### E2E Tests

```text
tests/e2e/
├── specs/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── registration.spec.ts
│   ├── members/
│   │   ├── member-creation.spec.ts
│   │   └── member-management.spec.ts
│   ├── companionships/
│   │   ├── assignment-workflow.spec.ts
│   │   └── health-monitoring.spec.ts
│   └── graph/
│       └── relationship-visualization.spec.ts
├── fixtures/
│   ├── users.ts
│   ├── members.ts
│   └── companionships.ts
├── pages/
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   └── MemberPage.ts
└── playwright.config.ts
```

**E2E Test Categories:**
- **User Authentication:** Login, logout, session management, role-based access
- **Member Management:** CRUD operations, import/export, validation workflows
- **Companionship Assignment:** End-to-end assignment workflow, constraint validation
- **Graph Visualization:** Interactive relationship graphs, filtering, performance
- **Data Import:** CSV/Excel import workflows with error handling

### Test Examples

#### Frontend Component Test

```typescript
// apps/web/src/components/MemberForm/MemberForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemberForm } from './MemberForm';
import { memberService } from '@/lib/api/memberService';

// Mock the service
jest.mock('@/lib/api/memberService');
const mockMemberService = memberService as jest.Mocked<typeof memberService>;

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('MemberForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create member with valid data', async () => {
    // Arrange
    const mockMember = { id: '1', name: 'John Doe', email: 'john@example.com' };
    mockMemberService.createMember.mockResolvedValue(mockMember);
    
    const onSuccess = jest.fn();
    renderWithProviders(<MemberForm onSuccess={onSuccess} />);

    // Act
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Assert
    await waitFor(() => {
      expect(mockMemberService.createMember).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      });
      expect(onSuccess).toHaveBeenCalledWith(mockMember);
    });
  });

  it('should display validation errors for invalid input', async () => {
    // Arrange
    renderWithProviders(<MemberForm />);

    // Act
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });
});
```

#### Backend API Test

```typescript
// apps/web/src/app/api/members/route.test.ts
import { POST } from './route';
import { memberModule } from '@/lib/modules/memberModule';
import { NextRequest } from 'next/server';

// Mock the member module
jest.mock('@/lib/modules/memberModule');
const mockMemberModule = memberModule as jest.Mocked<typeof memberModule>;

// Mock NextAuth for authentication
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}));

describe('/api/members POST', () => {
  const mockSession = {
    user: { id: '1', email: 'admin@example.com' },
    permissions: ['member:create']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (require('next-auth/next').getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  it('should create member with valid data', async () => {
    // Arrange
    const memberData = { name: 'John Doe', email: 'john@example.com' };
    const createdMember = { id: '1', ...memberData };
    mockMemberModule.createMember.mockResolvedValue(createdMember);

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
      headers: { 'Content-Type': 'application/json' }
    });

    // Act
    const response = await POST(request);
    const responseData = await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(responseData.data).toEqual(createdMember);
    expect(mockMemberModule.createMember).toHaveBeenCalledWith(memberData, mockSession.user);
  });

  it('should return 400 for validation errors', async () => {
    // Arrange
    const invalidData = { name: '', email: 'invalid-email' };
    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: { 'Content-Type': 'application/json' }
    });

    // Act
    const response = await POST(request);
    const responseData = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(responseData.error.code).toBe('VALIDATION_FAILED');
    expect(responseData.error.details).toHaveProperty('name');
    expect(responseData.error.details).toHaveProperty('email');
  });

  it('should return 401 for unauthorized access', async () => {
    // Arrange
    (require('next-auth/next').getServerSession as jest.Mock).mockResolvedValue(null);
    
    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      body: JSON.stringify({ name: 'John', email: 'john@example.com' }),
      headers: { 'Content-Type': 'application/json' }
    });

    // Act
    const response = await POST(request);
    const responseData = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(responseData.error.code).toBe('UNAUTHORIZED');
  });
});
```

#### E2E Test

```typescript
// tests/e2e/specs/members/member-creation.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { MemberPage } from '../../pages/MemberPage';

test.describe('Member Creation Workflow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let memberPage: MemberPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    memberPage = new MemberPage(page);

    // Login as Community Delegate
    await loginPage.navigate();
    await loginPage.login('cd@example.com', 'password123');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create new member successfully', async ({ page }) => {
    // Navigate to member creation
    await dashboardPage.navigateToMembers();
    await memberPage.clickCreateMember();

    // Fill member form
    await memberPage.fillMemberForm({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567890',
      geographicUnit: 'Province East',
      role: 'Member'
    });

    // Submit form
    await memberPage.submitForm();

    // Verify success
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(
      'Member created successfully'
    );
    await expect(page).toHaveURL(/\/members\/\d+/);
    
    // Verify member details
    await expect(page.locator('[data-testid="member-name"]')).toContainText('Jane Smith');
    await expect(page.locator('[data-testid="member-email"]')).toContainText('jane.smith@example.com');
  });

  test('should show validation errors for invalid data', async () => {
    // Navigate to member creation
    await dashboardPage.navigateToMembers();
    await memberPage.clickCreateMember();

    // Submit empty form
    await memberPage.submitForm();

    // Verify validation errors
    await expect(page.locator('[data-testid="name-error"]')).toContainText('Name is required');
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required');
    
    // Fill invalid email
    await memberPage.fillEmail('invalid-email');
    await memberPage.submitForm();
    
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format');
  });

  test('should enforce permission-based access', async ({ page }) => {
    // Logout and login as regular member (no create permissions)
    await dashboardPage.logout();
    await loginPage.login('member@example.com', 'password123');
    
    // Try to access member creation
    await dashboardPage.navigateToMembers();
    
    // Verify create button is not visible
    await expect(page.locator('[data-testid="create-member-btn"]')).not.toBeVisible();
    
    // Try direct navigation to create URL
    await page.goto('/members/create');
    await expect(page.locator('[data-testid="access-denied"]')).toContainText(
      'You do not have permission to create members'
    );
  });
});
```

### Enhanced Testing Practices

#### Test Data Management
- **Factory Pattern:** Realistic but anonymized test data generation with Faker.js
- **Fixtures:** Static test data in `tests/fixtures/` organized by domain
- **Cleanup:** Transaction rollback for unit tests, full database reset for integration tests

#### Continuous Testing Integration
- **Pre-commit:** Unit tests and linting with husky hooks
- **Pull Request:** Full test suite (unit + integration + E2E) with coverage reports
- **Main Branch:** Complete test suite + performance regression tests + security validation

#### AI Agent Testing Requirements
- Generate tests using TDD approach for all public methods
- Cover edge cases, constraint violations, and boundary conditions
- Follow AAA pattern (Arrange, Act, Assert) consistently
- Mock external dependencies (database, APIs, file system)
- Test companionship constraint validation exhaustively
- Generate property-based tests for complex business rules

-----

## Coding Standards

This section establishes a minimal set of high-impact rules that are mandatory for all developers, including AI agents, to enforce our architectural decisions and prevent common mistakes in fullstack development.

### Critical Fullstack Rules

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

### Naming Conventions

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

### Enhanced Development Standards

#### TypeScript Excellence
- **Module Declaration:** Use `export type` for type-only exports to enable proper tree-shaking
- **Utility Types:** Prefer built-in utility types (`Pick`, `Omit`, `Partial`, `Record`) over manual type construction
- **Interface vs Type:** Use `interface` for object shapes that might be extended, `type` for unions, primitives, and computed types
- **Generic Constraints:** Always provide meaningful constraints for generic types (e.g., `<T extends Record<string, unknown>>`)

#### Code Quality Enforcement
- **Languages & Runtimes:** TypeScript (~5.x) with `strict` flag enabled, Node.js (~20.x LTS)
- **Style & Linting:** Prettier for code formatting enforced by pre-commit hooks, ESLint with architectural rules and import/export restrictions
- **Test Organization:** Test files use `.test.ts/.test.tsx` suffix, co-located with source files, fixtures in `__tests__/fixtures/` directories

-----

## Error Handling Strategy

This section defines unified error handling across frontend and backend, providing comprehensive guidance for AI and human developers in consistent error management across the entire application stack.

### Error Flow

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as Backend API
    participant Module as Business Logic
    
    FE->>+API: Makes API Request
    API->>+Module: Executes business logic
    Module-->>-API: Throws specific error (e.g., ValidationError)
    Note over API: Central error middleware catches error
    API-->>-FE: Responds with 400 Bad Request and standard ApiError JSON
    Note over FE: Global error handler parses ApiError
    FE-->>FE: Displays user-friendly toast notification
```

### Error Response Format

All errors returned from our backend API adhere to this consistent JSON structure:

```typescript
interface ApiError {
  error: {
    code: string; // Machine-readable error code, e.g., 'VALIDATION_FAILED'
    message: string; // User-friendly message for display
    details?: Record<string, any>; // Additional context, e.g., invalid form fields
    timestamp: string; // ISO 8601 timestamp of the error
    correlationId: string; // Unique ID for tracing across multiple subsystems (superior to requestId)
  };
}
```

**Note on correlationId:** We use `correlationId` instead of the template's `requestId` because correlation is a more generic term that allows developer troubleshooting across multiple subsystems, not just HTTP requests.

### Frontend Error Handling

```typescript
// lib/utils/errorHandler.ts
import { toast } from '@/components/ui/use-toast';
import { QueryClient } from '@tanstack/react-query';

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    correlationId: string;
  };
}

// Global error handler for TanStack Query
export const globalErrorHandler = (error: unknown, queryClient: QueryClient) => {
  console.error('Global error handler:', error);
  
  if (isApiError(error)) {
    // Handle API errors with structured format
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.error.message,
      action: error.error.details?.retryable ? (
        <button onClick={() => queryClient.invalidateQueries()}>Retry</button>
      ) : undefined,
    });
    
    // Log with correlation ID for debugging
    console.error(`[${error.error.correlationId}] API Error:`, {
      code: error.error.code,
      message: error.error.message,
      details: error.error.details,
    });
  } else if (error instanceof Error) {
    // Handle generic errors
    toast({
      variant: 'destructive',
      title: 'Unexpected Error',
      description: 'Something went wrong. Please try again.',
    });
    
    console.error('Unexpected error:', error.message);
  }
};

// Type guard for API errors
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as any).error.code === 'string'
  );
}

// React Error Boundary Component
import { Component, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error Boundary caught error:', error, errorInfo);
    
    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Integration with error tracking service would go here
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-200 rounded-md">
          <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
          <p className="text-sm text-red-500">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Backend Error Handling

```typescript
// lib/middleware/errorHandler.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Custom error classes
export class AppError extends Error {
  constructor(
    public code: string,
    public userMessage: string,
    public statusCode: number,
    public details?: Record<string, any>,
    public correlationId?: string
  ) {
    super(userMessage);
    this.name = this.constructor.name;
    this.correlationId = correlationId || uuidv4();
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fieldErrors: Record<string, string>, correlationId?: string) {
    super('VALIDATION_FAILED', message, 400, fieldErrors, correlationId);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string, correlationId?: string) {
    super('NOT_FOUND', `${resource} not found`, 404, { resource, id }, correlationId);
  }
}

export class PermissionError extends AppError {
  constructor(action: string, resource: string, correlationId?: string) {
    super('PERMISSION_DENIED', `Not authorized to ${action} ${resource}`, 403, { action, resource }, correlationId);
  }
}

// Centralized error handler middleware
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const correlationId = uuidv4();
    
    try {
      // Add correlation ID to request context if it's a NextRequest
      if (args[0] && typeof args[0] === 'object' && 'headers' in args[0]) {
        (args[0] as any).correlationId = correlationId;
      }
      
      return await handler(...args);
    } catch (error) {
      return handleError(error, correlationId);
    }
  };
}

function handleError(error: unknown, correlationId: string): NextResponse {
  if (error instanceof AppError) {
    // Log structured error with correlation ID
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      correlationId: error.correlationId || correlationId,
      errorCode: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: sanitizeErrorDetails(error.details),
      stack: error.stack,
    }));

    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.userMessage,
          details: error.details,
          timestamp: new Date().toISOString(),
          correlationId: error.correlationId || correlationId,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle unexpected errors
  console.error(JSON.stringify({
    level: 'ERROR',
    timestamp: new Date().toISOString(),
    correlationId,
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  }));

  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        correlationId,
      },
    },
    { status: 500 }
  );
}

function sanitizeErrorDetails(details: any): any {
  if (!details) return details;
  
  // Remove sensitive information from error details
  const sanitized = { ...details };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.secret;
  
  return sanitized;
}

// Example usage in API route
// app/api/members/route.ts
export const POST = withErrorHandler(async (request: NextRequest) => {
  const correlationId = (request as any).correlationId;
  
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = memberSchema.parse(body);
    
    // Business logic
    const member = await memberModule.createMember(validatedData, correlationId);
    
    return NextResponse.json({ data: member }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Invalid member data',
        error.flatten().fieldErrors,
        correlationId
      );
    }
    throw error;
  }
});
```

### Enhanced Error Handling Practices

#### Logging Standards
- **Library:** Built-in Node.js console with JSON structured logging for Vercel integration
- **Format:** JSON structured logs with consistent schema for machine parsing and correlation
- **Levels:** ERROR (unrecoverable failures), WARN (handled errors), INFO (request flows), DEBUG (detailed tracing for development)
- **Required Context:**
  - Correlation ID: UUID v4 format (e.g., `550e8400-e29b-41d4-a716-446655440000`) for cross-system tracing
  - Service Context: Module name, function name, and operation type for component identification
  - User Context: Sanitized user identifier (no PII) and session context with automatic PII redaction

```typescript
// Enhanced logging with correlation context
class Logger {
  constructor(private correlationId: string, private service: string) {}
  
  error(message: string, error?: Error, context?: object) {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      correlationId: this.correlationId,
      service: this.service,
      message,
      error: error?.message,
      stack: error?.stack,
      ...this.sanitizeContext(context)
    }));
  }
  
  private sanitizeContext(context: object): object {
    // Automatically redact PII fields (email, phone, etc.)
    return context; // Implementation details for PII redaction
  }
}
```

- **POC Approach:** Leverage Vercel's built-in log aggregation and dashboard for immediate development needs
- **Critical Rule:** All logs must automatically redact sensitive PII to ensure privacy compliance (never store user emails, phone numbers, etc., in plain text logs)

#### Error Handling Patterns

**Centralized Middleware at Backend:**
The `withErrorHandler` wrapper (shown above) provides centralized error catching and formatting into standard `ApiError` JSON responses for consistent frontend-backend communication.

**Recovery Strategy:**
Within modules, `try/catch` blocks handle recoverable errors (like retries) internally without exposing them to users, following the principle of graceful degradation.

**External API Errors:**
- **Retry Policy:** Exponential backoff with 3 attempts for 5xx errors, no retry for 4xx client errors
- **Circuit Breaker:** Not implemented for POC (defer to post-POC phase due to minimal external API dependencies)
- **Timeout Configuration:** 30-second timeout for all external HTTP requests with graceful degradation
- **Error Translation:** Map external API errors to internal error codes (e.g., external 401 → internal `EXTERNAL_AUTH_FAILED`)

**Business Logic Errors:**
- **Custom Exceptions:** Structured hierarchy with `ValidationError`, `NotFoundError`, `BusinessRuleError`, `PermissionError` extending base `AppError` class (implemented in Backend Error Handling section above)
- **User-Facing Errors:** All business errors include user-friendly messages suitable for direct display in UI notifications
- **Error Codes:** Hierarchical system with prefixes - `VALIDATION_*`, `NOT_FOUND_*`, `PERMISSION_*`, `BUSINESS_*` for consistent categorization

**Data Consistency:**
- **Transaction Strategy:** Database transactions for multi-table operations with automatic rollback on errors, using Prisma's transaction API
- **Compensation Logic:** Saga pattern for approval workflows - each step includes compensating actions for rollback scenarios
- **Idempotency:** All state-changing API endpoints support idempotency keys to prevent duplicate operations during retries

#### Implementation Flow

1. **Business Logic:** Modules throw specific custom errors with correlation context
2. **Centralized Middleware:** `withErrorHandler` catches all errors, logs with full context, formats to ApiError JSON
3. **Frontend Global Handler:** TanStack Query error handling with `globalErrorHandler` parses ApiError and displays user notifications
4. **Error Recovery:** Automatic retry for transient errors, manual retry options for user-recoverable errors
5. **Observability:** Correlation IDs enable instant request tracing from user error reports to server logs across multiple subsystems

-----

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** Vercel Analytics for Core Web Vitals, page performance, and user interactions (POC). Future: Prometheus + Grafana dashboards
- **Backend Monitoring:** Vercel Function logs with structured JSON logging and correlationId tracing (POC). Future: Prometheus metrics collection
- **Error Tracking:** Integrated with correlationId system for cross-system error tracing via Vercel logs (POC). Future: Grafana error rate dashboards
- **Performance Monitoring:** Vercel built-in performance metrics and real-time function monitoring (POC). Future: Custom Prometheus/Grafana observability stack

### Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP, FID, CLS)
- JavaScript errors with correlationId tracking
- API response times from TanStack Query
- User interactions and page navigation

**Backend Metrics:**
- Request rate per API endpoint
- Error rate by error code and correlationId
- Response time (P95/P99) for API routes
- Database query performance via Prisma

**POC Note:** Currently leveraging Vercel's built-in analytics and monitoring. Post-POC expansion includes migration to Prometheus/Grafana stack for advanced observability, custom dashboards, and comprehensive alert management.

-----

## Security and Performance

This section defines security and performance considerations for the fullstack application, establishing MANDATORY requirements for AI and human developers with implementation-specific rules that directly impact code generation and development patterns.

### Security Requirements

#### Frontend Security

- **CSP Headers:** Content Security Policy with strict directives: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'`
- **XSS Prevention:** React's built-in XSS protection, sanitization of user inputs with DOMPurify, Content Security Policy enforcement, and strict TypeScript typing to prevent injection attacks
- **Secure Storage:** 
  - Sensitive data stored in HTTP-only, secure, same-site cookies
  - Non-sensitive UI state in sessionStorage/localStorage with encryption for PII
  - JWT tokens stored in HTTP-only cookies, never localStorage
  - Client-side encryption for any cached sensitive data using Web Crypto API

#### Backend Security

- **Input Validation:** Zod schema validation at API boundary before any business logic processing, whitelist approach preferred over blacklist, custom error messages for validation failures
- **Rate Limiting:** Per-user/IP rate limiting (100 requests/minute for authenticated users, 20 requests/minute for anonymous), exponential backoff for abuse detection, separate limits for different endpoint categories
- **CORS Policy:** Strict CORS configuration allowing only official frontend domain origins (`emma-companionship.vercel.app` for production, `localhost:3000` for development), credentials support enabled, preflight caching configured

#### Authentication Security

- **Token Storage:** JWT tokens in HTTP-only, secure, same-site cookies with configurable expiration, automatic token refresh with sliding expiration
- **Session Management:** Auth.js (NextAuth) session management with secure session cookies, session invalidation on logout, concurrent session limits per user
- **Password Policy:** Minimum 8 characters with complexity requirements, Argon2 hashing algorithm for password storage, password rotation recommendations, account lockout after failed attempts

#### Enhanced Security Measures

**Secrets Management:**
- Development: Environment variables in `.env.local` files (never committed to version control)
- Production: Vercel environment variables with encrypted storage
- Access via type-safe configuration service only, no secrets in logs or error messages

**Data Protection:**
- Encryption at Rest: Database encryption using Vercel Postgres built-in encryption
- Encryption in Transit: TLS 1.3 for all API communications, encrypted database connections
- PII Handling: Minimal PII collection, data anonymization for non-production environments

**Security Testing & Monitoring:**
- SAST: ESLint security rules and SonarJS for static analysis
- DAST: Playwright security tests for authentication flows and input validation
- Dependency Security: npm audit and Dependabot for vulnerability scanning
- Penetration Testing: Annual third-party security assessment for production system

### Performance Optimization

#### Frontend Performance

- **Bundle Size Target:** Main bundle under 250KB gzipped, lazy-loaded route chunks under 100KB each, total initial page load under 500KB
- **Loading Strategy:** 
  - Next.js App Router Server Components by default to minimize client-side JavaScript
  - Progressive loading with React.lazy() for heavy components
  - Critical resource prioritization with Next.js built-in optimizations
- **Caching Strategy:** 
  - TanStack Query for intelligent client-side caching with 5-minute stale time for static data
  - Browser caching with proper ETags and cache headers
  - Service Worker caching for offline-first experience (future enhancement)

#### Backend Performance

- **Response Time Target:** P95 (95th percentile) API response time under 200ms for typical read operations, P99 under 500ms for complex queries
- **Database Optimization:** 
  - Indexes on all foreign key columns and frequently queried fields
  - Query optimization with proper JOIN strategies and result pagination
  - Connection pooling with Prisma for efficient concurrent request handling
- **Caching Strategy:** 
  - Multi-layer caching: CDN (Vercel Edge), application-level (Redis future), database query caching
  - Cache invalidation strategies for real-time data updates
  - Edge computing with Vercel Edge Functions for geographically distributed computation

#### Infrastructure Performance Enhancements

- **CDN Optimization:** Static assets served from Vercel's global Content Delivery Network with optimized caching headers
- **Monitoring & Alerting:** Performance monitoring with Core Web Vitals tracking, automated alerting for performance degradation
- **Graph-Specific Optimizations:** Progressive loading and virtualization for large relationship graphs, debounced filtering, client-side optimization for interactive visualizations

-----
