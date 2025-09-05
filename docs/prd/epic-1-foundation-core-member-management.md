# Epic 1: Foundation & Core Member Management

**Expanded Goal**: The goal of this epic is to establish the complete, deployable foundation of the application. By the end of this epic, we will have a secure, running web application with a database, user authentication for Delegates, and the core functionality to add, view, and edit community members, setting the stage for all future relationship features.

## Story 1.1: Project Scaffolding & CI/CD Setup
**As a** Product Owner,
**I want** the project monorepo and a basic CI/CD pipeline to be set up,
**so that** we have a stable, automated foundation for development and deployment from day one.

**Acceptance Criteria**:
1.  A monorepo is created and initialized with a basic folder structure for the backend and frontend applications.
2.  A "Health Check" endpoint exists on the backend that returns a 200 OK status.
3.  A basic CI pipeline runs on every commit, installing dependencies and running linters.
4.  The CI pipeline automatically deploys the backend and a placeholder frontend to a development environment.

## Story 1.2: User Authentication & Role Management
**As a** Delegate,
**I want** to securely log in to the application,
**so that** I can access the confidential data and tools required for my role.

**Acceptance Criteria**:
1.  A user can register and log in via an email and password.
2.  API endpoints are protected and require a valid authentication token.
3.  The system supports at least two user roles: "Delegate" and "Admin".
4.  A logged-in user's session is securely managed.

## Story 1.3: Create and View Community Members
**As a** Delegate,
**I want** to view a list of all community members in my province,
**so that** I have a central place to see the people I am responsible for.

**Acceptance Criteria**:
1.  A logged-in Delegate is presented with a paginated list of community members from their assigned province.
2.  The list displays key member attributes such as name, marital status, and community engagement status.
3.  The system includes a basic form for an Admin or Delegate to create a new community member entity with all required attributes.

## Story 1.4: Edit Community Member Details
**As a** Delegate,
**I want** to edit the details of an existing community member,
**so that** I can keep the system's data accurate and up-to-date.

**Acceptance Criteria**:
1.  From the member list, a Delegate can select a member to view their full profile.
2.  A Delegate can open an edit form for a member within their province.
3.  All member attributes (e.g., status, roles, languages) can be updated.
4.  The form includes validation to prevent incorrect data entry.

---