# emmaCompanionship Product Requirements Document (PRD)

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-08-17 | 1.0 | Initial draft based on Project Brief and collaborative refinement. | John, PM |

## Goals and Background Context

### Goals

* [cite_start]Improve the operational efficiency of Companionship Delegates. [cite: 447]
* Increase the percentage of "healthy" companionship relationships within the community.
* Ensure all eligible community members are assigned a Companion.
* Reduce the administrative burden and risk of burnout for Companions.

### Background Context

[cite_start]Companionship Delegates are responsible for managing a complex network of interpersonal relationships governed by strict constraints. [cite: 448] [cite_start]The current manual process, often relying on spreadsheets, is inefficient and prone to error. [cite: 448] [cite_start]This makes it difficult to track relationship health, find eligible companions, and prevent companion burnout. [cite: 448]

[cite_start]This PRD will define a web application that models these relationships visually, providing delegates with dashboards and structured workflows. [cite: 445] The goal is to create a tool that enforces the community's rules automatically and allows for efficient, effective management of the entire companionship system.

---

## Requirements

### MVP Functional Requirements

1.  **FR1**: The system must allow authorized users (Delegates) to add, view, and edit community members and their attributes (e.g., name, status, roles, languages).
2.  **FR2**: The system must model and manage both `accompanying` and `supervising` relationships between members, ensuring a person cannot be both a Supervisor and a Companion to the same individual.
3.  **FR3**: The system must enforce all companionship constraints during assignment, including gender matching, experience levels, separation of power, language compatibility, and Companion from Fraternity preference.
4.  **FR4**: The system must provide visual dashboards (graphs/lists) for a Delegate's province, including views for "missing companionship," "overwhelmed" companions, and relationship "health."
5.  **FR5**: The system must support a workflow for assigning a new Companion to an Accompanied member, including gaining consent.
6.  **FR7**: The system must provide a mechanism for importing initial member data from CSV or Microsoft Excel files, including a validation and error-correction step.
7.  **FR8**: The system must implement role-based access control, restricting data visibility and editing capabilities based on the user's role and geographical hierarchy.
8.  **FR10 (Modified)**: Delegates will have a view for relationship health and will manually update the status (e.g., Green, Yellow, Red) for the MVP.
9.  **FR13**: The system must allow Delegates to reassign an Accompanied member between Companions via a direct drag-and-drop action on the graph view, serving as a 'quick record' for an offline agreement.

### Non-Functional Requirements

1.  [cite_start]**NFR1**: **Confidentiality:** The system must not store the content of any user dialogues and must protect all personal data with role-based access. [cite: 523]
2.  [cite_start]**NFR2**: **Open Source:** The application's source code must be open-source to ensure transparency and build trust. [cite: 523]
3.  [cite_start]**NFR3**: **Usability:** The user interface must be intuitive for non-technical users, particularly for adding new members and managing companionship relations. [cite: 523]
4.  [cite_start]**NFR4**: **Scalability:** The system must handle views for higher-level delegates (Zone, International) by providing aggregated statistics or paginated lists, rather than attempting to render potentially massive graphs. [cite: 523]
5.  [cite_start]**NFR5**: **Extensibility:** The backend architecture must be designed to be reused by a future mobile application. [cite: 523]
6.  [cite_start]**NFR6**: **Configurability:** Key business rules (e.g., max companionship duration, "overwhelmed" threshold, health status timeframes) must be configurable by an administrator. [cite: 523]
7.  **NFR7**: **Data Archiving:** When a companionship relation ends, its records must be archived for historical purposes rather than being deleted, without cluttering the active user interface.

---

## User Interface Design Goals

### Overall UX Vision
The user experience should be clean, professional, and trustworthy, prioritizing clarity and efficiency for non-technical users. The interface must feel like a secure and reliable tool for managing sensitive information.

### Key Interaction Paradigms
The primary interaction model is "view then act." Users will view data on dashboards (lists and graphs) and then launch structured, wizard-style forms to perform actions. Graphs are for visualization and launching workflows, but also support "quick record" drag-and-drop for efficiency.

### Core Screens and Views
* [cite_start]Login Screen [cite: 456]
* [cite_start]Main Dashboard (with links to key views) [cite: 456]
* Province Member List
* **Companionship Graph View**
    * This view should be a useful graphical tool that allows a Delegate to:
        * See the complete companionship graph for all members of their province.
        * Select a person from a dropdown list to focus the graph on that specific node.
        * Filter the view to show only members who have Companions from another province.
        * Filter the graph to see only the members Accompanied by a specific Companion.
        * Filter the graph to show relationships for a specified type of Accompanied member (e.g., couple, priest, seminarian).
* Missing Companionship List
* Overwhelmed Companions List
* Member Profile Page (View/Edit)
* Assign Companion Workflow (Multi-step form/wizard)

### Accessibility: WCAG AA
[cite_start]The application should meet WCAG 2.1 AA standards to be accessible to all users. [cite: 454]

### Branding
The visual design should align with the aesthetic and branding found on the main Emmanuel Community websites. Key references are:
* [https://emmanuel.info/en/](https://emmanuel.info/en/)
* [https://emmanuel.info/en/the-icone/](https://emmanuel.info/en/the-icone/)

### Target Device and Platforms: Web Responsive
[cite_start]The application must be a responsive web application, fully functional on both desktop and mobile browsers. [cite: 460]

---

## Technical Assumptions

### Repository Structure: Monorepo
[cite_start]The project will be managed in a single monorepo. [cite: 462] This will contain the frontend web application, the backend service, and any shared code (like data types), simplifying dependency management and ensuring consistency.

### Service Architecture: Modular Monolith
The backend will be built as a **Modular Monolith**. While it will be deployed as a single service for the MVP, it **must be internally structured into distinct, independent modules** (e.g., 'Members', 'Relationships', 'Auth') with clear, explicit APIs between them. This architectural pattern is mandatory to prevent code entanglement and provide a straightforward path to extracting modules into microservices in the future, if needed.

### Testing Requirements: A Strategy for the Modular Monolith
Our testing strategy must leverage the boundaries defined by our Modular Monolith architecture. The goal is to maximize confidence while maintaining fast feedback loops for developers. We will employ a multi-layered approach:

* **1. Unit Tests**: These will form the base of our testing pyramid. Their scope is to test the internal logic of a single class or function within a module in complete isolation.
* **2. Module-Level Integration Tests**: A module will be tested as a black box, completely isolated from other modules. We will test its public API to ensure all its internal components work together correctly.
* **3. Contract Tests**: To ensure that modules can evolve safely without breaking each other, we will introduce contract testing between modules.
* **4. Assembly Tests**: We will have a small, carefully selected suite of end-to-end tests that run against the fully assembled and running monolith to verify that the modules are wired together correctly.

### Additional Technical Assumptions and Requests
* **Open Source**: The project must be developed with the intention of being open-source.
* **API Reusability**: The backend API must be designed to be consumed by both the initial web application and a future mobile application.

---

## Epic List

1.  **Epic 1: Foundation & Core Member Management**
    * [cite_start]**Goal**: Establish the project's technical foundation, implement user authentication and role-based access for Delegates, and provide the core functionality for creating and managing community members. [cite: 475]

2.  **Epic 2: Basic Relationship Viewing**
    * **Goal**: Implement the ability to *manually create* and *view* relationships on a **non-interactive graph**. This delivers the core visualization and data structure early.

3.  **Epic 3: High-Value Workflows**
    * **Goal**: With the basic viewing in place, deliver the two most critical time-saving features: the **Data Import** tool and the guided **Assignment Wizard**.

4.  **Epic 4: Advanced Graph Interaction**
    * **Goal**: Now that the core product is usable, enhance the graph with the **"quick record" drag-and-drop** feature and **manual health status tracking**.

---

## Epic 1: Foundation & Core Member Management

**Expanded Goal**: The goal of this epic is to establish the complete, deployable foundation of the application. By the end of this epic, we will have a secure, running web application with a database, user authentication for Delegates, and the core functionality to add, view, and edit community members, setting the stage for all future relationship features.

### Story 1.1: Project Scaffolding & CI/CD Setup
**As a** Product Owner,
**I want** the project monorepo and a basic CI/CD pipeline to be set up,
**so that** we have a stable, automated foundation for development and deployment from day one.

**Acceptance Criteria**:
1.  A monorepo is created and initialized with a basic folder structure for the backend and frontend applications.
2.  A "Health Check" endpoint exists on the backend that returns a 200 OK status.
3.  A basic CI pipeline runs on every commit, installing dependencies and running linters.
4.  The CI pipeline automatically deploys the backend and a placeholder frontend to a development environment.

### Story 1.2: User Authentication & Role Management
**As a** Delegate,
**I want** to securely log in to the application,
**so that** I can access the confidential data and tools required for my role.

**Acceptance Criteria**:
1.  A user can register and log in via an email and password.
2.  API endpoints are protected and require a valid authentication token.
3.  The system supports at least two user roles: "Delegate" and "Admin".
4.  A logged-in user's session is securely managed.

### Story 1.3: Create and View Community Members
**As a** Delegate,
**I want** to view a list of all community members in my province,
**so that** I have a central place to see the people I am responsible for.

**Acceptance Criteria**:
1.  A logged-in Delegate is presented with a paginated list of community members from their assigned province.
2.  The list displays key member attributes such as name, marital status, and community engagement status.
3.  The system includes a basic form for an Admin or Delegate to create a new community member entity with all required attributes.

### Story 1.4: Edit Community Member Details
**As a** Delegate,
**I want** to edit the details of an existing community member,
**so that** I can keep the system's data accurate and up-to-date.

**Acceptance Criteria**:
1.  From the member list, a Delegate can select a member to view their full profile.
2.  A Delegate can open an edit form for a member within their province.
3.  All member attributes (e.g., status, roles, languages) can be updated.
4.  The form includes validation to prevent incorrect data entry.

---

## Epic 2: Relationship Modeling & Visualization (Revised)

**Expanded Goal**: The goal of this epic is to model and visualize the two distinct types of relationships. We will enable delegates to manually create voluntary `companionship` relationships, while the system will automatically manage hierarchical `supervision` relationships. The epic will culminate in a view-only graph that displays both relationship types, giving delegates a comprehensive initial view of their province's structure.

### Story 2.1: System Support for Relationship Data
**As a** System,
**I want** the ability to store, retrieve, and manage the data for companionship and supervision relationships,
**so that** the application has a persistent record of the connections between community members.

**Acceptance Criteria**:
1.  The system can persist all required data attributes for a `companionship` relationship.
2.  The system can persist all required data attributes for a `supervision` relationship.
3.  The system provides a stable internal interface for the application logic to create, retrieve, update, and archive these relationships.

### Story 2.2: Manually Create and Manage Companionship Relationships
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

### Story 2.3: Automate Supervision Relationship Management
**As a** System,
**I want** to automatically create and maintain `supervision` relationships based on a member's role and location in the hierarchy,
**so that** the leadership structure is always accurately reflected without manual data entry.

**Acceptance Criteria**:
1.  When a member is assigned a leadership role (e.g., Sector Head, Province Head), `supervision` relationships are automatically created for all members within their defined scope.
2.  If a member's role or location changes, their `supervision` relationships are automatically updated.
3.  The automation correctly implements the logic defined in the "Hierarchy of leadership".

### Story 2.4: V1 Graph View for All Relationships
**As a** Delegate,
**I want** to see a visual graph of all relationship types in my province,
**so that** I can understand the complete structure of our network.

**Acceptance Criteria**:
1.  The graph view renders both `companionship` relationships and automated `supervision` relationships.
2.  The two relationship types are visually distinguishable from each other (e.g., using different colors or line styles).
3.  The graph remains view-only in this version.
