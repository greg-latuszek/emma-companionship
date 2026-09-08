# Epic 2: Relationship Modeling & Visualization

**Expanded Goal**: The goal of this epic is to model and visualize the two distinct types of relationships. We will enable delegates to manually create voluntary `companionship` relationships, while the system will automatically manage hierarchical `supervision` relationships. The epic will culminate in a view-only graph that displays both relationship types, giving delegates a comprehensive initial view of their province's structure.

## Story 2.1: System Support for Relationship Data
**As a** System,
**I want** the ability to store, retrieve, and manage the data for companionship and supervision relationships,
**so that** the application has a persistent record of the connections between community members.

**Acceptance Criteria**:
1.  The system can persist all required data attributes for a `companionship` relationship.
2.  The system can persist all required data attributes for a `supervision` relationship.
3.  The system provides a stable internal interface for the application logic to create, retrieve, update, and archive these relationships.

## Story 2.2: Manually Create and Manage Companionship Relationships
**As a** Delegate,
**I want** to create and manage companionship relationships between members, with a simplified process for couples,
**so that** I can efficiently and accurately maintain the companionship network.

**Acceptance Criteria**:
1.  From a member's profile or a dedicated workflow, a Delegate can create a `companionship` relationship.
2.  If the relationship is between two individuals, a single relationship record is created.
3.  If the relationship is between two couples, the UI must allow the Delegate to select the two couples as single entities.
4.  When a couple-to-couple relationship is confirmed, the system must automatically create the underlying individual relationships (husband-to-husband, wife-to-wife) under the hood.
5.  All business rule constraints (gender, power separation, etc.) are enforced on the backend for all created relationships.
6.  A Delegate can end an existing relationship. If a couple-to-couple relationship is ended, all its underlying individual relationships are also ended (archived).

## Story 2.3: Automate Supervision Relationship Management
**As a** System,
**I want** to automatically create and maintain `supervision` relationships based on a member's role and location in the hierarchy,
**so that** the leadership structure is always accurately reflected without manual data entry.

**Acceptance Criteria**:
1.  When a member is assigned a leadership role (e.g., Sector Head, Province Head), `supervision` relationships are automatically created for all members within their defined scope.
2.  If a member's role or location changes, their `supervision` relationships are automatically updated.
3.  The automation correctly implements the logic defined in the "Hierarchy of leadership".

## Story 2.4: V1 Graph View for All Relationships
**As a** Delegate,
**I want** to see a visual graph of all relationship types,
**so that** I can understand the complete structure of our network.

**Acceptance Criteria**:
1. The graph renders both `companionship` and `supervision` relationships; 
2. The two types are visually distinguishable; 
3.  The graph remains view-only in this version.

---