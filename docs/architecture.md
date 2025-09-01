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

**4. Bullet Train (Ruby/Rails)**
- ✅ **Matches**: Modular architecture concepts
- ❌ **Missing**: Completely different technology stack (Ruby vs TypeScript)
- **Assessment**: Architectural inspiration only, not usable

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

-----

## High Level Architecture

### Technical Summary

The `emmaCompanionship` system employs a **Modular Monolith** architecture style, delivering a unified full-stack TypeScript application via **Next.js** that combines React frontend components with serverless API routes in a single deployment unit. The core components include four distinct business modules (Auth, Geographic, Member Management, and Relationship) that interact through well-defined interfaces, with **PostgreSQL** serving as the centralized data layer and **React Flow** powering the interactive relationship graph visualization. Primary technology choices center on the **TypeScript/Next.js/Vercel** stack for rapid development and deployment, while **Hexagonal Architecture** patterns within each module ensure clean separation of business logic from external concerns. This architecture directly supports the PRD goals of improving Delegate operational efficiency by providing a scalable, maintainable foundation for the complex relationship management workflows, automated constraint enforcement, and visual dashboards that replace manual spreadsheet-based processes.

### High Level Overview

Based on the PRD's Technical Assumptions, the system adopts a **Modular Monolith** architectural style that balances development simplicity with future scalability needs. The **Monorepo** structure decision enables unified TypeScript type sharing across frontend and backend while maintaining clear module boundaries through Turborepo's workspace management. The service architecture follows a **single-deployment, multi-module** approach where business logic is organized into distinct modules (Auth, Geographic, Member, Relationship) that communicate through well-defined interfaces, preventing code entanglement while avoiding the operational complexity of microservices for the MVP. The primary user interaction flow centers on Delegates accessing a React-based dashboard to visualize relationship graphs, execute guided workflows (assignment wizard, data import), and perform direct manipulations (drag-and-drop reassignments) that trigger backend API calls to update the PostgreSQL database through the appropriate business module. 

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

#### Platform and Infrastructure Choice

  * **Platform**: The application is a self-contained, full-stack Next.js application. For the initial POC, it will be hosted on **Vercel's Hobby tier**.
  * **Database**: We will use **Vercel Postgres**, also on the Hobby tier.
  * **Deployment Regions**: A single region will be sufficient for the POC (Europe Central/Frankfurt, optimized for Poland). 
  * **Key Features**: This provides a no-cost, scalable, and secure environment with automated backups (Point-in-Time Recovery) and custom domain support.

### Repository Structure

  * **Structure**: **Monorepo**, managed with a tool like Turborepo. This structure simplifies dependency management and allows for easy code and type sharing between the frontend, backend, and any other packages.

### High Level Project Diagram

```mermaid
graph TD
    subgraph Browser
        A[User] --> B["Next.js Frontend <br> (React Components)"]
    end

    subgraph "Hosting Platform (e.g., Vercel)"
        B -- HTTPS --> C{"Next.js Backend <br> (API Routes)"}
        C -- invokes --> D["Business Logic <br> (Hexagonal Modules)"]
    end

    subgraph "Database Provider"
        D -- uses adapter for --> E["Vercel Postgres"]
    end

    style B fill:#405E61
    style C fill:#405E61
    style D fill:#395E39
```

### Architectural and Design Patterns

  * **Modular Monolith**: The backend, while deployed as a single unit, will be internally organized into distinct modules (e.g., "Members", "Relationships").
  * **Hexagonal Architecture (Ports & Adapters)**: Each module's core business logic is isolated from external concerns (the database, frameworks), making it reusable and independently testable.
  * **Serverless API**: The Next.js backend API will be deployed as serverless functions, providing excellent scalability and cost-efficiency.

-----

## Tech Stack

### Cloud Infrastructure

- **Provider:** Vercel
- **Key Services:** Next.js hosting (Edge Network + Serverless Functions), Vercel Postgres, Domain management, Analytics
- **Deployment Regions:** Europe Central/Frankfurt (primary, optimized for Poland), with global edge distribution for static assets

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Language** | TypeScript | ~5.x | Primary language for entire stack | Ensures type safety across frontend and backend, reducing bugs. |
| **Framework** | Next.js | ~14.x | Full-stack framework for UI and API | Provides a unified, high-performance environment for both client and server. |
| **UI Library** | Tailwind CSS + shadcn/ui | Latest | Styling and UI components | A highly customizable and developer-friendly approach over rigid component libraries. |
| **State Mgt** | Zustand | ~4.x | **UI-only** client-side state management | A simple, lightweight solution for global UI state. |
| **Data Fetching**| **TanStack Query** | **~5.x** | **Server state** management & caching | The industry standard for managing server data, preventing bugs. |
| **API Style** | REST | N/A | API communication standard | Natively supported by Next.js API Routes and universally understood. |
| **Database** | PostgreSQL | 16.x | Primary data storage | A robust, reliable, and scalable open-source relational database. |
| **ORM** | Prisma | ~5.x | Database client and schema mgt | Provides excellent type safety between our database and application code. |
| **Authentication**| Auth.js (NextAuth) | ~5.x | User authentication and session mgt | The de-facto standard for Next.js, providing a secure and simple solution. |
| **Graph Viz** | React Flow | ~11.x | Interactive graph rendering | Modern, feature-rich library for our core drag-and-drop UI. |
| **Testing** | Jest + Playwright | Latest | Unit, integration, and E2E testing | Jest is the standard for JS unit tests; Playwright is a modern E2E testing tool. |
| **Monorepo Tool**| Turborepo | ~1.x | High-performance build system | Optimized for JS/TS monorepos and integrates perfectly with Vercel. |
| **CI/CD** | GitHub Actions | N/A | Continuous integration & deployment | Tightly integrated with GitHub, powerful, and easy to configure. |

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
- ApprovalStep.decisionDate: Decision timestamp - When approval/rejection occurred

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
  decisionDate?: Date;
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

-----

## Components

Our backend will be composed of the following core modules.

###  Component Interaction Diagram

```mermaid
graph TD
    subgraph "Application Backend"
        Relationship["Relationship Module"] --> Member["Member Management Module"]
        Relationship --> Auth["Auth Module"]
        
        Member --> Auth
        Member --> Geo["Geographic Module"]
    end
```

### 1. Auth Module

  * **Responsibility**: User registration, login, session management, and decoding access tokens to provide user identity.
  * **Key Interfaces**: `registerUser()`, `loginUser()`, `getCurrentUser()`, `decodeToken()`.
  * **Dependencies**: None.

### 2. Geographic Module

  * **Responsibility**: Manages the `GeographicUnit` organizational tree.
  * **Key Interfaces**: `getUnitById(id)`, `getUnitTree()`, `getDescendantUnits(unitId)`.
  * **Dependencies**: None.

### 3. Member Management Module

  * **Responsibility**: Manages the business logic for `Member` and `Couple` entities, and manages `RoleAssignment` records to grant members roles like Supervisor or Delegate.
  * **Key Interfaces**: `getMemberById(id)`, `listMembersByUnit(unitId)`, `createMember(data)`, `updateMember(id, data)`, `assignRoleToMember(memberId, roleId, scopeId)`, `getMemberRoles(memberId)`.
  * **Dependencies**: Depends on `Auth` (for permissions) and `Geographic` (to validate scope).

### 4. Relationship Module

  * **Responsibility**: Manages the entire lifecycle of `Companionship` relationships and the `ApprovalProcess` workflow.
  * **Key Interfaces**: `proposeCompanionship(data)`, `getApprovalProcess(companionshipId)`, `advanceApprovalStep(processId, decision)`, `getGraphDataForUnit(unitId)`.
  * **Dependencies**: Depends on `Auth` and `Member Management` (which contains role info) to perform its complex rule validations.
  * **Design Constraint**: For the MVP, the `ApprovalProcess` logic will be built as a distinct, isolated sub-component *within* this module, designed for easy extraction in the future if needed.

-----

## External APIs

For the MVP, there are no required integrations with external third-party APIs for core business logic.

-----

## Core Workflows

This section visualizes how our components and modules interact to accomplish key user journeys from the PRD. These diagrams are a **guide, not a rigid contract**. Their purpose is to be directionally correct and to validate our component design. The development team should use them to understand the architectural intent, but they are empowered to make implementation improvements as long as the core architectural principles are respected.

### Guided Companionship Assignment

This diagram illustrates the sequence of interactions when a Delegate uses the wizard to propose a new companionship.

```mermaid
sequenceDiagram
    actor User as Delegate
    participant FE as Frontend (Next.js)
    participant API as Backend API (Next.js)
    participant RM as Relationship Module
    participant MM as Member Module
    participant DB as PostgreSQL Database

    User->>+FE: 1. Clicks 'Assign Companion' for a Member
    FE->>+API: 2. GET /api/members/{id}/eligible-companions
    API->>+RM: 3. getEligibleCompanions(memberId)
    RM->>+MM: 4. listMembersByUnit(unitId)
    MM->>+DB: 5. Query for members with constraints
    DB-->>-MM: Member data
    MM-->>-RM: Filtered member list
    RM-->>-API: Eligible candidates
    API-->>-FE: 200 OK with candidate list
    FE-->>-User: Displays assignment wizard with candidates

    User->>+FE: 6. Selects candidate and submits proposal
    FE->>+API: 7. POST /api/companionships (proposal data)
    API->>+RM: 8. proposeCompanionship(data)
    Note over RM, DB: Creates Companionship (status: 'proposed')<br/>and an associated ApprovalProcess
    RM->>+DB: 9. INSERT Companionship & ApprovalProcess
    DB-->>-RM: Confirms creation
    RM-->>-API: Success
    API-->>-FE: 201 Created
    FE-->>-User: Shows "Proposal Sent for Approval"
```

#### Architectural Note on "Hard" and "Soft" Constraints

As documented in **ADR-010**, Step 5 of the above diagram ("Query for members with constraints") represents a sophisticated filtering logic. The API will not return a single list. It will first filter out all candidates violating **Hard Constraints** (e.g., gender, language) and then partition the rest into two lists: `perfectMatches` and `softConstraintViolations` (e.g., power separation, overwhelmed). This allows the UI to present a nuanced choice to the Delegate.

### Data Import Workflow

This diagram illustrates the stateless workflow when a Delegate uploads a spreadsheet to bulk-create new members. We explicitly chose this simpler, stateless approach for the MVP to reduce code complexity.

```mermaid
sequenceDiagram
    actor User as Delegate
    participant FE as Frontend (Next.js)
    participant API as Backend API (Next.js)
    participant MM as Member Module
    participant DB as PostgreSQL Database

    User->>+FE: 1. Selects spreadsheet file in UI
    FE-->>-User: 2. UI shows file is ready for analysis

    User->>+FE: 3. Clicks 'Analyze'
    FE->>+API: 4. POST /api/members/import/analyze (file data)
    API->>+MM: 5. analyzeSpreadsheet(file)
    MM-->>-API: Returns detected column headers
    API-->>-FE: 200 OK with column headers
    FE-->>-User: 6. Displays mapping UI (e.g., "Map 'Email Address' to 'email'")

    User->>+FE: 7. Defines mappings and clicks 'Import'
    FE->>+API: 8. POST /api/members/import/execute (file data + mappings)
    API->>+MM: 9. executeImport(file, mappings)
    Note over MM, DB: Module validates each row,<br/>builds a bulk insert transaction,<br/>and logs any errors.
    MM->>+DB: 10. Bulk INSERT INTO members
    DB-->>-MM: Confirms successful inserts
    MM-->>-API: 11. Returns summary (e.g., "50 created, 5 errors")
    API-->>-FE: 200 OK with import summary
    FE-->>-User: 12. Displays success message and error report
```

-----

## Source Tree

This layout, using the standard `apps` and `packages` directories, is optimized for our chosen tool, Turborepo. The backend structure within `apps/web/src/lib/modules` provides a clear, physical representation of our Modular Monolith and Hexagonal Architecture decisions, making it intuitive for developers to follow our patterns.

```plaintext
/emma-companionship/
|
├── apps/
|   └── web/                      # The Next.js full-stack application
|       ├── src/
|       |   ├── app/              # Next.js App Router: pages, layouts, etc.
|       |   ├── components/       # Frontend: React components specific to this app
|       |   └── lib/
|       |       ├── api/          # Frontend: Logic for calling the backend API (using TanStack Query)
|       |       └── modules/      # Backend: Our Modular Monolith lives here
|       |           ├── auth/     # Auth Module
|       |           ├── geo/      # Geographic Module
|       |           ├── member/   # Member Management Module
|       |           └── relationship/ # Relationship Module
|       └── package.json
|
├── packages/
|   ├── ui/                       # Shared, headless UI components (e.g., Button, Card)
|   |   └── package.json
|   ├── shared-types/             # Our shared TypeScript interfaces (Member, Couple, etc.)
|   |   └── package.json
|   └── config/                   # Shared configurations (ESLint, TypeScript, etc.)
|       ├── eslint-preset.js
|       └── tsconfig.base.json
|
├── docs/                         # Project documentation
|   ├── prd.md
|   ├── architecture.md
|   └── risks.md
|
├── .gitignore
├── package.json                  # Root package.json for the monorepo
└── turbo.json                    # Turborepo configuration
```

-----

## Development Workflow

This section outlines the specific commands and steps for a developer to set up and run the project locally. By using pnpm for package management and Docker for the database, we create a consistent and isolated development environment that works on any machine.

### Local Development Setup

#### Prerequisites

Before starting, a developer must have the following tools installed:

  * **Node.js** (\~20.x LTS)
  * **pnpm** (for package management in the monorepo)
  * **Docker** and **Docker Compose** (to run the local PostgreSQL database)
  * **Git**

#### Initial One-Time Setup

To set up the project for the first time, a developer will run these commands:

```bash
# 1. Clone the repository
git clone <repository_url> emma-companionship
cd emma-companionship

# 2. Install all dependencies for the monorepo
pnpm install

# 3. Create a local environment file from the template
cp .env.example .env

# 4. Start the local PostgreSQL database in a Docker container
pnpm db:start

# 5. Apply the database schema
pnpm db:migrate
```

#### Daily Development Commands

```bash
# Start the Next.js development server (with Turborepo)
pnpm dev

# Run all tests across the monorepo
pnpm test

# Run the linter to check for code quality and style
pnpm lint
```

#### Git Hooks & Code Quality Automation

To automate code quality, we will use **Husky** to manage a `pre-commit` Git hook. This hook will trigger **lint-staged**, which will automatically run **Prettier** (for code formatting) and **ESLint** (for code analysis) on all staged files. This ensures that no code that violates our formatting or quality rules can be committed to the repository.

### Environment Configuration

The `.env` file will contain the following required variables for the application to run locally.

```bash
# .env - Local Environment Variables

# PostgreSQL connection string for Prisma
DATABASE_URL="postgresql://user:password@localhost:5432/emma_db?schema=public"

# Auth.js secret and URL
NEXTAUTH_SECRET="a_secure_random_string_for_development"
NEXTAUTH_URL="http://localhost:3000"
```

-----

## Infrastructure and Deployment

This outlines our strategy for automatically deploying the application to Vercel using a Git-flow model.

### Deployment Strategy

  * **Application Deployment**: We will leverage Vercel's native Next.js integration. When code is pushed to our GitHub repository, Vercel will automatically build the application, deploying the frontend to its global Edge Network and the backend API routes as Serverless Functions.
  * **Database Deployment**: Database schema changes (migrations) are critical. Any pull request that includes a new Prisma migration will require the migration script to be run against the production database as an explicit step in the CI/CD pipeline **after** the application code has been successfully deployed.

#### Git Workflow

We will follow Feature Branch Workflow:

- The main branch is considered our stable, production-ready code.
- Direct pushes to the main branch will be disabled.
- To work on a feature (e.g., a user story), a developer creates a new branch from main (e.g., `feature/story-4.1-health-status`).
- All work is done on that feature branch. When complete, the developer merges it back into main via a Pull Request.

#### Notes on Preview Deployment Database

A Preview Deployment is like a temporary, isolated Staging environment for a single feature.
- When you first open a Pull Request, Vercel automatically builds and deploys the code from your feature branch.
- If you then push new commits to that same branch, Vercel detects the push and automatically triggers a new build and deployment, updating the existing preview environment with your latest changes.
- Database Connection: By default, a Vercel preview would try to connect to whatever database URL is in its environment variables. Connecting it to the Production DB is dangerous and bad practice. Instead, we will configure all Preview Deployments to connect to a dedicated Staging Database.
- Populating the Staging DB: We should not use production data due to privacy. The best practice, which we will follow, is to use seeding scripts.
   - We will create scripts that generate realistic but anonymized or fake data that mirrors the structure of our production data.
   - When a developer needs to test a feature, they can run these scripts to populate the Staging DB with a fresh, clean, and safe set of data. This gives them a production-like environment without compromising any user privacy.

### CI/CD Pipeline (GitHub Actions)

We will use GitHub Actions for our CI/CD pipeline. The workflow, triggered on pushes and pull requests to the `main` branch, will lint, test, build, deploy to Vercel, and then run database migrations.

### Environments

| Environment | Trigger | URL | Purpose |
| :--- | :--- | :--- | :--- |
| **Production** | Merge/Push to `main` | `(custom domain)` | Live application for all users. |
| **Preview** | Pull Request to `main` | `*.vercel.app` (unique) | Isolate and test new features before merging. Will connect to a Staging DB populated with seeded/anonymized data. |
| **Development** | N/A | `localhost:3000` | Developer's local machine. |

-----

## Security and Performance

This section defines the specific, non-functional requirements that will ensure our application is safe, secure, and fast for our users.

### Security Requirements

  * **Authentication**: All sensitive data and actions will be protected behind our **Auth.js** implementation. Passwords will be securely hashed using a modern algorithm like Argon2.
  * **Input Validation**: All data received by the backend API from any client **must** be validated using a schema library (like Zod) to prevent injection and data corruption attacks.
  * **CORS Policy**: The Next.js backend will be configured with a strict Cross-Origin Resource Sharing (CORS) policy to only accept requests from our official frontend domain.
  * **Secure Cookies**: Auth.js will be configured to use secure, HTTP-only, and same-site cookies for session management, preventing Cross-Site Scripting (XSS) attacks from stealing session tokens.
  * **Content Security Policy (CSP)**: We will implement a strict CSP header to mitigate the risk of XSS attacks by defining which sources of content are permitted to be loaded.

### Performance Optimization

  * **Frontend Performance**:
      * **Code Splitting**: We will leverage Next.js's automatic code splitting by page.
      * **Server Components**: We will use Next.js App Router's Server Components by default to minimize the amount of JavaScript shipped to the client.
      * **Data Caching**: We will use **TanStack Query** to intelligently cache data on the client, avoiding redundant API calls.
  * **Backend Performance**:
      * **Response Time Target**: The P95 (95th percentile) API response time for typical read operations should be **under 200ms**.
      * **Database Optimization**: We will add database indexes to all foreign key columns and any other columns that are frequently used in query filters.
  * **Infrastructure**:
      * **CDN**: All static assets will be automatically served from Vercel's global Content Delivery Network (CDN).

-----

## Coding Standards

This section establishes a minimal set of high-impact rules that are mandatory for all developers, including AI agents, to enforce our architectural decisions.

### Core Standards

  * **Language**: The entire project will be written in **TypeScript (\~5.x)** with the `strict` flag enabled. The `any` type is forbidden.
  * **Formatting**: We will use **Prettier** for all code formatting, enforced automatically by a pre-commit hook.
  * **Linting**: We will use **ESLint** to catch potential bugs and enforce key architectural rules.

### Critical Rules

1.  **Enforced Module Boundaries**: Direct cross-module imports of internal, non-public components are strictly forbidden. Modules may only interact through their public API interfaces. An automated linting script will enforce this.
2.  **State Management Discipline**: State management must be strictly separated. Use **Zustand** only for pure UI state. Use **TanStack Query** for all server state.
3.  **Type-Safe Environment Variables**: Never access `process.env` directly in application code. All environment variables must be exposed through a dedicated, type-safe configuration module.
4.  **Centralized API Error Handling**: All backend API handlers must use a centralized error handling middleware.

### Naming Conventions

| Element | Convention | Example |
| :--- | :--- | :--- |
| Component Files | PascalCase.tsx | `UserProfile.tsx` |
| Hook Files | useCamelCase.ts | `useAuth.ts` |
| API Route Files | kebab-case/route.ts | `app/api/user-profile/route.ts`|
| Prisma Models | PascalCase | `model Member { ... }` |

-----

## Error Handling Strategy

This section defines our unified strategy for creating a robust and maintainable application.

### Error Handling

We will use a centralized middleware in the backend to catch specific, thrown errors and format them into a standard `ApiError` JSON response for the frontend. 
Within our modules, `try/catch` blocks will be used to handle recoverable errors (like retries) internally without exposing them to the user.

#### API Error Contract
All errors returned from our backend API will adhere to a consistent JSON structure. This provides a predictable contract for the frontend.

```typescript
TypeScript Interface:
interface ApiError {
  error: {
    code: string; // A machine-readable error code, e.g., 'VALIDATION_FAILED'
    message: string; // A user-friendly message for display
    details?: Record<string, any>; // e.g., A list of invalid form fields
    timestamp: string; // The ISO 8601 timestamp of the error
    requestId: string; // A unique ID for tracing this request through logs
  };
}
```

#### Backend Error Handling
We will use a centralized error-handling middleware in our Next.js backend.

1. Our business logic in the modules will throw specific, custom errors (e.g., NotFoundError, ValidationError).
2. The middleware will catch these errors.
3. It will then format the error into the standard ApiError JSON structure and send the appropriate HTTP status code (e.g., 404, 400).
   This keeps our business logic clean and enforces the API contract.

#### Frontend Error Handling
Our frontend API client (using TanStack Query) will have a global error handler.

1. When an API call fails, this handler will parse the ApiError JSON from the response.
2. The error.message can be displayed directly to the user in a notification (e.g., a "toast").
3. The error.details can be used to provide more specific feedback, such as highlighting which form fields are invalid.

#### Error Flow Diagram

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

### Logging

Logging is intimately tied to error handling. It's the developer's side of the coin.

Our strategy will be:

- When our central error middleware catches an unrecoverable error, 
  it will log the full, detailed error (including the stack trace) on the server before sending the user-friendly ApiError to the client.
- Crucially, every log entry will include the unique requestId. 
  This allows us to connect a generic error message a user sees on their screen directly to the detailed technical log on our backend for instant troubleshooting.
- **We will add a critical rule:** The logger must be configured to automatically redact sensitive PII (Personally Identifiable Information) 
  to ensure we never store user emails, phone numbers, etc., in plain text logs.

For the POC, Vercel automatically collects and displays all server logs in its dashboard, which is sufficient for our initial needs.

### Monitoring & Observability

For the POC, we will rely on the powerful, built-in analytics and monitoring provided by Vercel. 
We will defer a custom observability stack (like Prometheus/Grafana) to a post-POC phase as a pragmatic choice to accelerate initial development.