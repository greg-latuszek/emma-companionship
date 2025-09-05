# Data Models

##  Architectural Note on Role Management

To provide clarity for the development team, this section details the reasoning behind our role-management data model.

Our initial, simpler models (with flags like `isDelegate` or direct links like `managesUnitId` on the `Member` record) failed to capture two critical business rules:

1.  A member's role (like Delegate or Supervisor) is always tied to a specific **scope** (e.g., a Province, a Zone).
2.  A member's physical location can be **different** from the scope of their role (e.g., a Zone Delegate for "Europe" might live in a specific province in Poland).

The chosen design solves this by creating a dedicated `RoleAssignment` model. This model acts as a link, explicitly connecting a **Member** to a **Role** for a specific **Scope** (`GeographicUnit`). This approach is highly flexible, accurately models the community's structure, and is the key to correctly implementing complex features like automated supervision and the "power separation" rule.

```typescript
// A branded type for UUIDs to enforce type-safety
export type UUID = string & { readonly __brand: 'UUID' };
```

##  GeographicUnit

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

##  Member

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

##  Couple

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

##  Role & RoleAssignment

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

##  Companionship, ApprovalProcess & ApprovalStep

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

##  Note on the `Supervision` Model
A dedicated `Supervision` model is not needed. This relationship is implicitly defined by Role, Geography and `Member.geographicUnitId`.
- Member is in some Geographical unit (e.g., Sector).
- Another Member has a Role (Sector Head) that is scoped to that Sector
- Another Member has a Role (Province Head) that is scoped to Province of that Sector
- Another Member has a Role (Country Head) that is scoped to Country of that Province
- and so on...

##  Note on the Companionship Delegates
As for Supervisors, Companionship Delegates responsibility (which Members they take care for) is implicitly defined by Role, Geography and `Member.geographicUnitId`.
- Member is in some Geographical unit (e.g., Province).
- Another Member has a Role Companionship Delegate that is scoped to that Geographical unit
- Another Member has a Role Zone Companionship Delegate that is scoped to Zone where mentioned Province belongs

## Shared TypeScript Interface Organization

The above conceptual models will be implemented as shared TypeScript interfaces organized in `/packages/shared-types/` to enable type-safe communication between frontend and backend components.

### Entity Types (`/packages/shared-types/src/entities/`)

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

### API Types (`/packages/shared-types/src/api/`)

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

### UI Component Types (`/packages/shared-types/src/ui/`)

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

### Validation Types (`/packages/shared-types/src/validation/`)

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

### Type Export Strategy (`/packages/shared-types/src/index.ts`)

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
