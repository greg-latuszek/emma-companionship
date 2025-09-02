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

Based on our Modular Monolith architecture and Hexagonal patterns, the backend is organized into four distinct modules with clear boundaries and interfaces.

### Auth Module

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
- bcrypt/Argon2 for password hashing
- TypeScript strict mode for type safety

### Geographic Module

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

### Member Management Module

**Responsibility:** Manages business logic for `Member` and `Couple` entities, handles `RoleAssignment` records, and provides member search and filtering capabilities while enforcing community rules.

**Key Interfaces:**
- `getMemberById(id)` - Retrieve individual member details
- `listMembersByUnit(unitId, filters)` - Search members within geographic scope
- `createMember(memberData)` - Add new community members
- `updateMember(id, changes)` - Modify member information
- `assignRoleToMember(memberId, roleId, scopeId)` - Grant roles with geographic scope
- `getMemberRoles(memberId)` - Retrieve all roles for a member
- `validateMemberConstraints(member)` - Enforce business rules
- `analyzeSpreadsheet(file)` - Parse spreadsheet and detect column headers for import mapping
- `executeImport(file, mappings)` - Bulk import members from spreadsheet with field mappings

**Dependencies:** 
- Auth Module (for permission validation)
- Geographic Module (for scope validation and hierarchy queries)

**Technology Stack:**
- Prisma ORM with complex relational queries
- PostgreSQL with indexes on foreign keys and search fields
- TypeScript strict interfaces for member data
- Zod schemas for comprehensive input validation
- Business rule engine patterns for constraint validation

### Relationship Module

**Responsibility:** Manages the complete lifecycle of `Companionship` relationships, orchestrates the multi-step `ApprovalProcess` workflow, and provides graph data for visualization while enforcing complex community relationship rules.

**Key Interfaces:**
- `proposeCompanionship(companionData)` - Initiate new companionship proposals
- `getApprovalProcess(companionshipId)` - Retrieve approval workflow status
- `advanceApprovalStep(processId, decision)` - Process approval/rejection decisions
- `getGraphDataForUnit(unitId)` - Generate visualization data for frontend
- `evaluateMatchingConstraints(companionId, accompaniedId)` - Validate relationship rules
- `getCompanionshipHealth(companionshipId)` - Assess relationship status

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

### Component Diagrams

#### High-Level Module Dependencies (C4 Container View)

```mermaid
graph TD
    subgraph "Application Backend (Modular Monolith)"
        A["Auth Module<br/>Authentication & Authorization"]
        G["Geographic Module<br/>Organizational Hierarchy"]
        M["Member Management Module<br/>Members, Couples & Roles"]
        R["Relationship Module<br/>Companionships & Approvals"]
        
        R --> M
        R --> A
        M --> A
        M --> G
    end
    
    subgraph "External Systems"
        DB["PostgreSQL Database"]
        UI["Next.js Frontend"]
    end
    
    A --> DB
    G --> DB
    M --> DB
    R --> DB
    
    UI --> A
    UI --> G
    UI --> M
    UI --> R
```

#### Detailed Component Internal Structure

```mermaid
graph TD
    subgraph "Relationship Module (Hexagonal Architecture)"
        RC["Relationship Core<br/>Business Logic"]
        AC["Approval Core<br/>Workflow Engine"]
        
        subgraph "Ports (Interfaces)"
            RP["Relationship Port"]
            AP["Approval Port"]
            GP["Graph Port"]
        end
        
        subgraph "Adapters"
            DA["Database Adapter"]
            AA["Auth Adapter"]
            MA["Member Adapter"]
        end
        
        RC --> RP
        AC --> AP
        RC --> GP
        
        RP --> DA
        AP --> DA
        RP --> MA
        AC --> AA
    end
```

#### Complex Interaction Flow (Approval Process)

```mermaid
sequenceDiagram
    participant UI as "Frontend"
    participant R as "Relationship Module"
    participant M as "Member Module"
    participant A as "Auth Module"
    participant DB as "Database"
    
    UI->>+R: "proposeCompanionship(data)"
    R->>+M: "validateMemberRoles(companionId, accompaniedId)"
    M->>+A: "checkPermissions(userId, 'propose')"
    A-->>-M: "authorized"
    M-->>-R: "validation passed"
    
    R->>+R: "createApprovalWorkflow()"
    R->>+DB: "INSERT Companionship, ApprovalProcess"
    DB-->>-R: "records created"
    
    loop For each approval step
        R->>+M: "findApproversByRole(requiredRole, scope)"
        M-->>-R: "approver list"
        R->>UI: "notifyApprovers(approvers)"
    end
    
    R-->>-UI: "proposal submitted with workflow ID"
```

-----

## External APIs

For the MVP, there are no required integrations with external third-party APIs for core business logic.

-----

## Core Workflows

This section illustrates key system workflows using sequence diagrams, showing component interactions, error handling paths, and async operations for critical user journeys identified in the PRD.

### User Authentication and Authorization Workflow
**PRD Reference:** Story 1.2 - User Authentication & Role Management

This workflow shows how Delegates securely access the system and obtain proper permissions.

```mermaid
sequenceDiagram
    actor User as Delegate
    participant FE as "Frontend (Next.js)"
    participant API as "Backend API (Next.js)"
    participant Auth as "Auth Module"
    participant Member as "Member Module"
    participant DB as "PostgreSQL Database"

    User->>FE: "1. Enters credentials and submits login"
    FE->>API: "2. POST /api/auth/login (credentials)"
    API->>Auth: "3. loginUser(credentials)"
    
    Auth->>DB: "4. Query user credentials"
    DB-->>Auth: "User record or null"
    
    alt Valid credentials
        Auth->>Auth: "5. Generate JWT token"
        Auth-->>API: "Token with user ID"
        API->>Member: "6. getMemberRoles(userId)"
        Member->>DB: "7. Query role assignments"
        DB-->>Member: "Role data"
        Member-->>API: "User roles and permissions"
        API-->>FE: "200 OK with token and roles"
        FE-->>User: "Redirect to dashboard"
    else Invalid credentials
        Auth-->>API: "Authentication failed"
        API-->>FE: "401 Unauthorized"
        FE-->>User: "Display error message"
    end
```

### Member Creation and Management Workflow
**PRD Reference:** Stories 1.3, 1.4 - Create and Edit Community Members

This workflow demonstrates member lifecycle management with validation and geographic assignment.

```mermaid
sequenceDiagram
    actor User as Delegate
    participant FE as "Frontend (Next.js)"
    participant API as "Backend API (Next.js)"
    participant Auth as "Auth Module"
    participant Member as "Member Module"
    participant Geo as "Geographic Module"
    participant DB as "PostgreSQL Database"

    User->>FE: "1. Fills member form and submits"
    FE->>API: "2. POST /api/members (member data)"
    API->>Auth: "3. hasPermission(userId, 'create_member', scopeId)"
    Auth-->>API: "Permission granted"
    
    API->>Member: "4. validateMemberConstraints(memberData)"
    Member->>Geo: "5. validateUnitScope(memberData.geographicUnitId)"
    Geo-->>Member: "Valid geographic unit"
    Member-->>API: "Validation passed"
    
    API->>Member: "6. createMember(memberData)"
    Member->>DB: "7. INSERT member record"
    
    alt Success
        DB-->>Member: "Member created with ID"
        Member-->>API: "Member object"
        API-->>FE: "201 Created"
        FE-->>User: "Success notification"
    else Validation error
        DB-->>Member: "Constraint violation"
        Member-->>API: "Validation error details"
        API-->>FE: "400 Bad Request"
        FE-->>User: "Display validation errors"
    end
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
    FE->>API: "4. POST /api/members/import/analyze (file data)"
    API->>Member: "5. analyzeSpreadsheet(file)"
    Member-->>API: "Detected column headers"
    API-->>FE: "200 OK with column mappings"
    FE-->>User: "6. Display field mapping interface"

    User->>FE: "7. Defines mappings and clicks 'Import'"
    FE->>API: "8. POST /api/members/import/execute (file + mappings)"
    API->>Member: "9. executeImport(file, mappings)"
    
    Note over Member, DB: "Async processing:<br/>Validate each row,<br/>Build bulk transaction,<br/>Log errors"
    
    Member->>DB: "10. BEGIN TRANSACTION"
    Member->>DB: "11. Bulk INSERT valid members"
    
    alt All valid
        DB-->>Member: "All records inserted"
        Member-->>API: "Success summary"
        API-->>FE: "200 OK with results"
        FE-->>User: "Success message"
    else Partial success
        DB-->>Member: "Some records failed"
        Member-->>API: "Partial success with error details"
        API-->>FE: "207 Multi-Status"
        FE-->>User: "Summary with error report"
    else Complete failure
        Member->>DB: "ROLLBACK"
        Member-->>API: "Import failed"
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

This workflow demonstrates the dynamic graph filtering system for focused relationship viewing.

```mermaid
sequenceDiagram
    actor User as Delegate
    participant FE as "Frontend (Next.js)"
    participant API as "Backend API (Next.js)"
    participant Relationship as "Relationship Module"
    participant Member as "Member Module"
    participant Geo as "Geographic Module"
    participant DB as "PostgreSQL Database"

    User->>FE: "1. Opens graph view and applies filters"
    FE->>API: "2. GET /api/graph/{unitId}?filters=healthStatus,memberType,roleType"
    API->>Relationship: "3. getGraphDataForUnit(unitId, filterCriteria)"
    
    par Fetch relationship data
        Relationship->>DB: "4a. Query companionships with health filters"
        DB-->>Relationship: "Filtered companionships"
    and Fetch member data
        Relationship->>Member: "4b. listMembersByUnit(unitId, memberFilters)"
        Member->>DB: "5b. Query members with type/role filters"
        DB-->>Member: "Filtered members"
        Member-->>Relationship: "Member subset"
    and Fetch geographic scope
        Relationship->>Geo: "4c. getDescendantUnits(unitId)"
        Geo->>DB: "5c. Query geographic hierarchy"
        DB-->>Geo: "Unit tree"
        Geo-->>Relationship: "Scope boundaries"
    end
    
    Note over Relationship: "Async aggregation:<br/>Build graph JSON with nodes,<br/>edges, positions, and metadata"
    
    Relationship-->>API: "Graph data with applied filters"
    API-->>FE: "200 OK with graph JSON"
    FE->>FE: "6. Render filtered graph visualization"
    FE-->>User: "Updated graph view"
    
    User->>FE: "7. Changes filter criteria"
    FE->>FE: "8. Debounced filter update"
    Note over FE: "Client-side optimization:<br/>Cache full dataset,<br/>apply filters locally for<br/>immediate visual feedback"
    
    alt Significant filter change
        FE->>API: "9. New API request with updated filters"
        Note over API, DB: "Repeat data fetch process"
        API-->>FE: "Fresh filtered data"
        FE-->>User: "Re-rendered graph"
    else Minor filter change
        FE->>FE: "9. Apply filters to cached data"
        FE-->>User: "Instantly updated view"
    end
```

-----

## REST API Spec

This OpenAPI 3.0 specification defines all REST endpoints for the emmaCompanionship application, including authentication, member management, companionship workflows, and graph visualization.

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

  /members/import/analyze:
    post:
      tags:
        - Members
      summary: Analyze spreadsheet for import mapping
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
          description: Detected column headers for mapping
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

  /members/import/execute:
    post:
      tags:
        - Members
      summary: Execute bulk member import with field mappings
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
          description: Import completed successfully
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
    decision_date TIMESTAMP WITH TIME ZONE,
    decided_by UUID REFERENCES members(id),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique step order per process
    CONSTRAINT unique_process_step_order UNIQUE(approval_process_id, step_order)
);

CREATE INDEX idx_approval_steps_process_id ON approval_steps(approval_process_id);
CREATE INDEX idx_approval_steps_status ON approval_steps(status);
CREATE INDEX idx_approval_steps_approver_role ON approval_steps(approver_role);
CREATE INDEX idx_approval_steps_decided_by ON approval_steps(decided_by);

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

This section defines our deployment architecture and practices using Infrastructure as Code principles with Vercel and GitHub Actions for optimal CI/CD automation.

### Infrastructure as Code

- **Tool:** Vercel CLI v33.0+ and GitHub Actions
- **Location:** `.github/workflows/` and `vercel.json`
- **Approach:** Declarative configuration using Vercel's platform-as-a-service model with GitHub Actions for CI/CD orchestration

### Deployment Strategy

- **Strategy:** Git-based continuous deployment with Feature Branch Workflow
- **CI/CD Platform:** GitHub Actions
- **Pipeline Configuration:** `.github/workflows/deploy.yml`

#### Application Deployment Process

We leverage Vercel's native Next.js integration for seamless deployment:

1. **Frontend & API Deployment**: When code is pushed to GitHub, Vercel automatically builds the application, deploying the frontend to its global Edge Network and backend API routes as Serverless Functions.

2. **Database Migration Strategy**: Database schema changes (migrations) are handled separately from application deployment:
   - Pull requests with Prisma migrations require explicit approval
   - Migration scripts run against the production database **after** successful application deployment
   - Zero-downtime migrations are ensured through backward-compatible schema changes

3. **Git Workflow Implementation**:
   - Main branch represents stable, production-ready code
   - Direct pushes to main branch are disabled via branch protection rules
   - Feature development follows: `main` → `feature/story-x.x-description` → Pull Request → `main`
   - All changes require code review and automated testing before merge

### Environments

- **Production:** Live application for end users - Triggered by merge/push to `main` branch - Custom domain with production database
- **Preview:** Isolated testing environment for each feature - Triggered by Pull Request to `main` - Unique `*.vercel.app` URL with staging database
- **Development:** Local development environment - `localhost:3000` - Local PostgreSQL instance with seeded test data

#### Preview Environment Database Strategy

- **Isolation**: All Preview Deployments connect to a dedicated staging database to prevent production data exposure
- **Data Seeding**: Staging database populated with realistic but anonymized test data using automated seeding scripts
- **Data Privacy**: No production data is used in non-production environments to ensure user privacy compliance

A Preview Deployment is like a temporary, isolated Staging environment for a single feature.
- When you first open a Pull Request, Vercel automatically builds and deploys the code from your feature branch.
- If you then push new commits to that same branch, Vercel detects the push and automatically triggers a new build and deployment, updating the existing preview environment with your latest changes.

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

## Error Handling Strategy

This section defines our comprehensive error handling approach, guiding both AI and human developers in consistent error management across the entire application stack.

### General Approach

- **Error Model:** Centralized error middleware with standardized ApiError JSON contract for consistent frontend-backend communication
- **Exception Hierarchy:** Three-tier hierarchy: System Errors (500), Business Logic Errors (400-series), and External API Errors (502/503/504) with custom exception classes inheriting from base Error types
- **Error Propagation:** Errors bubble up from business logic modules → centralized middleware → formatted API responses → frontend global error handlers → user notifications

#### Standardized Error Contract

All errors returned from our backend API adhere to this consistent JSON structure:

```typescript
interface ApiError {
  error: {
    code: string; // Machine-readable error code, e.g., 'VALIDATION_FAILED'
    message: string; // User-friendly message for display
    details?: Record<string, any>; // Additional context, e.g., invalid form fields
    timestamp: string; // ISO 8601 timestamp of the error
    correlationId: string; // Unique ID for tracing this request through logs
  };
}
```

#### End-to-End Error Flow

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

### Logging Standards

- **Library:** Built-in Node.js console with JSON structured logging for Vercel integration
- **Format:** JSON structured logs with consistent schema for machine parsing and correlation
- **Levels:** ERROR (unrecoverable failures), WARN (handled errors), INFO (request flows), DEBUG (detailed tracing for development)
- **Required Context:**
  - Correlation ID: UUID v4 format (e.g., `550e8400-e29b-41d4-a716-446655440000`) for request tracing
  - Service Context: Module name, function name, and operation type for component identification
  - User Context: Sanitized user identifier (no PII) and session context with automatic PII redaction

#### Logging Implementation Strategy

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

- **POC Approach**: Leverage Vercel's built-in log aggregation and dashboard for immediate development needs
- **Critical Rule**: All logs must automatically redact sensitive PII to ensure privacy compliance (never store user emails, phone numbers, etc., in plain text logs.)

### Error Handling Patterns

#### Centralized Middleware at Backend

We will use a centralized middleware in the backend to catch specific, thrown errors and format them into a standard `ApiError` JSON response for the frontend. 

#### Recover whenever possible

Within our modules, `try/catch` blocks will be used to handle recoverable errors (like retries) internally without exposing them to the user.

#### External API Errors

- **Retry Policy:** Exponential backoff with 3 attempts for 5xx errors, no retry for 4xx client errors
- **Circuit Breaker:** Not implemented for POC (defer to post-POC phase due to minimal external API dependencies)
- **Timeout Configuration:** 30-second timeout for all external HTTP requests with graceful degradation
- **Error Translation:** Map external API errors to internal error codes (e.g., external 401 → internal `EXTERNAL_AUTH_FAILED`)

#### Business Logic Errors

- **Custom Exceptions:** Structured hierarchy with `ValidationError`, `NotFoundError`, `BusinessRuleError`, `PermissionError` extending base `AppError` class
- **User-Facing Errors:** All business errors include user-friendly messages suitable for direct display in UI notifications
- **Error Codes:** Hierarchical system with prefixes - `VALIDATION_*`, `NOT_FOUND_*`, `PERMISSION_*`, `BUSINESS_*` for consistent categorization

```typescript
// Example custom exception hierarchy
class AppError extends Error {
  constructor(
    public code: string,
    public userMessage: string,
    public statusCode: number,
    public details?: object
  ) {
    super(userMessage);
  }
}

class ValidationError extends AppError {
  constructor(message: string, fieldErrors: object) {
    super('VALIDATION_FAILED', message, 400, fieldErrors);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} not found`, 404, { resource, id });
  }
}
```

#### Data Consistency

- **Transaction Strategy:** Database transactions for multi-table operations with automatic rollback on errors, using Prisma's transaction API
- **Compensation Logic:** Saga pattern for approval workflows - each step includes compensating actions for rollback scenarios
- **Idempotency:** All state-changing API endpoints support idempotency keys to prevent duplicate operations during retries

### Implementation Flow

1. **Business Logic**: Modules throw specific custom errors with correlation context
2. **Centralized Middleware**: Catches all errors, logs with full context, formats to ApiError JSON
3. **Frontend Global Handler**: TanStack Query error handling parses ApiError and displays user notifications
4. **Error Recovery**: Automatic retry for transient errors, manual retry options for user-recoverable errors
5. **Observability**: Correlation IDs enable instant request tracing from user error reports to server logs

### Monitoring & Observability

For the POC, we rely on Vercel's built-in analytics and monitoring capabilities. Post-POC expansion will include custom observability stack (Prometheus/Grafana) with detailed error rate tracking, response time monitoring, and alert management.

-----

## Coding Standards

This section establishes a minimal set of high-impact rules that are mandatory for all developers, including AI agents, to enforce our architectural decisions.

### Core Standards

- **Languages & Runtimes:** TypeScript (~5.x) with `strict` flag enabled. The `any` type is forbidden. Node.js (~20.x LTS).
- **Style & Linting:** Prettier for code formatting enforced by pre-commit hooks. ESLint with architectural rules enforcement.
- **Test Organization:** Test files use `.test.ts/.test.tsx` suffix, co-located with source files. Fixtures in `__tests__/fixtures/` directories.

### Naming Conventions

| Element | Convention | Example |
| :--- | :--- | :--- |
| Component Files | PascalCase.tsx | `UserProfile.tsx` |
| Hook Files | useCamelCase.ts | `useAuth.ts` |
| API Route Files | kebab-case/route.ts | `app/api/user-profile/route.ts`|
| Prisma Models | PascalCase | `model Member { ... }` |

### Critical Rules

- **Enforced Module Boundaries:** Direct cross-module imports of internal, non-public components are strictly forbidden. Modules may only interact through their public API interfaces. An automated linting script will enforce this.
- **State Management Discipline:** State management must be strictly separated. Use Zustand only for pure UI state. Use TanStack Query for all server state.
- **Type-Safe Environment Variables:** Never access `process.env` directly in application code. All environment variables must be exposed through a dedicated, type-safe configuration module.
- **Centralized API Error Handling:** All backend API handlers must use a centralized error handling middleware.

### Language-Specific Guidelines

#### TypeScript Specifics

- **Strict Type Safety:** All function parameters and return types must be explicitly typed. No implicit `any` allowed.
- **Module Declaration:** Use `export type` for type-only exports to enable proper tree-shaking.
- **Utility Types:** Prefer built-in utility types (`Pick`, `Omit`, `Partial`) over manual type construction where applicable.

-----

## Test Strategy and Standards

This section defines the comprehensive testing approach for the emmaCompanionship project, providing detailed guidance for QA agents and team reference. All testing practices must align with our TDD methodology and architectural decisions.

### Testing Philosophy

- **Approach:** Test-Driven Development (TDD) - Write tests before implementation code. Follow Red-Green-Refactor cycle for all new features.
- **Coverage Goals:** Minimum 90% code coverage for business logic modules, 80% overall project coverage, 100% coverage for critical companionship constraint validation.
- **Test Pyramid:** 70% Unit Tests, 20% Integration Tests, 10% End-to-End Tests - emphasizing fast, isolated unit tests with selective integration and E2E coverage.

### Test Types and Organization

#### Unit Tests

- **Framework:** Jest ~29.x with TypeScript support
- **File Convention:** `.test.ts` for logic, `.test.tsx` for components, co-located with source files
- **Location:** Adjacent to source files (e.g., `Member.ts` → `Member.test.ts`)
- **Mocking Library:** Jest built-in mocking with MSW for API mocking
- **Coverage Requirement:** 90% for business logic modules (auth, member, relationship, geo modules)

**AI Agent Requirements:**
- Generate tests for all public methods using TDD approach
- Cover edge cases and error conditions (constraint violations, boundary conditions)
- Follow AAA pattern (Arrange, Act, Assert) consistently
- Mock all external dependencies (database, APIs, file system)
- Test companionship constraint validation exhaustively
- Generate property-based tests for complex business rules

#### Integration Tests

- **Scope:** Module-to-module interactions, database operations, API endpoint integration
- **Location:** `tests/integration/` directory with module-specific subdirectories
- **Test Infrastructure:**
  - **Database:** Testcontainers PostgreSQL for realistic database testing
  - **File System:** Temporary directories for CSV/Excel import testing
  - **External APIs:** Mock Service Worker (MSW) for API stubbing
  - **Authentication:** Test user fixtures with role-based access scenarios

#### End-to-End Tests

- **Framework:** Playwright ~1.x with TypeScript
- **Scope:** Critical user journeys - companionship assignment workflow, data import, health monitoring dashboards
- **Environment:** Dedicated E2E test environment with staging database
- **Test Data:** Seeded test database with realistic community structure and relationships

### Test Data Management

- **Strategy:** Factory pattern with realistic but anonymized test data generation
- **Fixtures:** Static test data in `tests/fixtures/` organized by domain (members, relationships, geographic-units)
- **Factories:** Dynamic test data generation using libraries like Faker.js for member attributes, custom factories for relationship constraints
- **Cleanup:** Automatic database cleanup after each test using transaction rollback for unit tests, full database reset for integration tests

### Continuous Testing

- **CI Integration:** 
  - Pre-commit: Unit tests and linting
  - Pull Request: Full test suite (unit + integration + E2E)
  - Main branch: Full test suite + performance regression tests
- **Performance Tests:** Jest-based performance tests for constraint validation algorithms, graph rendering with large datasets
- **Security Tests:** Automated security testing for role-based access control, input validation, and data privacy compliance

-----

## Security

This section defines MANDATORY security requirements for AI and human developers, focusing on implementation-specific rules that directly impact code generation and development patterns.

### Input Validation

- **Validation Library:** Zod for TypeScript schema validation
- **Validation Location:** API boundary validation before any business logic processing
- **Required Rules:**
  - All external inputs MUST be validated using Zod schemas
  - Validation at API boundary before processing
  - Whitelist approach preferred over blacklist for input filtering
  - Custom error messages for validation failures

### Authentication & Authorization

- **Auth Method:** Auth.js (NextAuth) with JWT tokens and secure session management
- **Session Management:** Secure, HTTP-only, same-site cookies with configurable expiration
- **Required Patterns:**
  - Role-based access control (RBAC) with granular permissions for Province/Zone/International delegates
  - Protected API routes with middleware-based authentication checks
  - Automatic session refresh with sliding expiration
  - Secure password hashing using Argon2 algorithm

### Secrets Management

- **Development:** Environment variables in `.env.local` files (never committed to version control)
- **Production:** Vercel environment variables with encrypted storage
- **Code Requirements:**
  - NEVER hardcode secrets in source code
  - Access via type-safe configuration service only
  - No secrets in logs or error messages
  - Rotate secrets regularly (API keys, database credentials)

### API Security

- **Rate Limiting:** Implement rate limiting per user/IP for API endpoints to prevent abuse
- **CORS Policy:** Strict CORS configuration allowing only official frontend domain origins
- **Security Headers:** Content Security Policy (CSP), X-Frame-Options, X-Content-Type-Options
- **HTTPS Enforcement:** Force HTTPS in production with HSTS headers, reject HTTP connections

### Data Protection

- **Encryption at Rest:** Database encryption using Vercel Postgres built-in encryption
- **Encryption in Transit:** TLS 1.3 for all API communications, encrypted database connections
- **PII Handling:** Minimal PII collection, data anonymization for non-production environments
- **Logging Restrictions:** Never log passwords, session tokens, or sensitive member data in application logs

### Dependency Security

- **Scanning Tool:** npm audit and Dependabot for vulnerability scanning
- **Update Policy:** Security updates applied within 48 hours, regular dependency updates monthly
- **Approval Process:** All new dependencies require security review and approval before integration

### Security Testing

- **SAST Tool:** ESLint security rules and SonarJS for static analysis
- **DAST Tool:** Playwright security tests for authentication flows and input validation
- **Penetration Testing:** Annual third-party security assessment for production system

-----

## Performance

This section defines performance optimization requirements to ensure the application is fast and scalable for community users.

### Frontend Performance

- **Code Splitting:** Leverage Next.js automatic code splitting by page and dynamic imports for heavy components
- **Server Components:** Use Next.js App Router Server Components by default to minimize client-side JavaScript
- **Data Caching:** TanStack Query for intelligent client-side caching, avoiding redundant API calls
- **Graph Optimization:** Progressive loading and virtualization for large relationship graphs

### Backend Performance

- **Response Time Target:** P95 (95th percentile) API response time under 200ms for typical read operations
- **Database Optimization:** Indexes on all foreign key columns and frequently queried fields
- **Connection Pooling:** Efficient database connection management for concurrent requests
- **Query Optimization:** Optimized database queries with proper JOIN strategies and result pagination

### Infrastructure Performance

- **CDN:** Static assets served from Vercel's global Content Delivery Network
- **Edge Computing:** Utilize Vercel Edge Functions for geographically distributed computation
- **Caching Strategy:** Multi-layer caching (CDN, application-level, database query caching)
- **Monitoring:** Performance monitoring with Core Web Vitals tracking and alerting

-----
