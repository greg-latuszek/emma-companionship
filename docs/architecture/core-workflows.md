# Core Workflows

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

## User Authentication and Authorization Workflow
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

## Member Creation and Management Workflow
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

## Data Import Workflow
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

## Guided Companionship Assignment Workflow
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

## Manual Companionship Creation Workflow
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

## Supervision Role Assignment Workflow
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

## Initial Graph View Implementation Workflow

POC Note: This workflow is planned for a later phase (React Flow deferred).
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

## Health Status Tracking Workflow
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

## Drag-and-Drop Reassignment Workflow

POC Note: This workflow is planned for a later phase (React Flow deferred).
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

## Graph Filtering and Visualization Workflow

POC Note: This advanced visualization is planned for a later phase (React Flow deferred).
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
