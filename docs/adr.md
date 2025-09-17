
---
### **ADR-001: Unified Technology Stack**

* **Status**: Accepted
* **Context**: The project requires a web frontend and a backend API that must also support a future mobile application. The initial discussion considered a mixed-language stack (Python/FastAPI and TypeScript/Next.js), which would introduce tooling and development complexity.
* **Decision**: We will use a single language, **TypeScript**, for the entire stack. The **Next.js** framework will be used for both the React-based frontend and the server-side API via its built-in API Routes.
* **Consequences**: This decision enables seamless code and type sharing between the frontend and backend, significantly reducing the risk of integration bugs. It simplifies the developer environment, tooling, and repository structure. It also creates a clear path toward a future React Native mobile app with a high potential for code reuse.

---
### **ADR-002: Repository Structure**

* **Status**: Accepted
* **Context**: Given the full-stack nature of the application and the decision to use a unified TypeScript stack, we needed to choose between managing the code in separate repositories (Polyrepo) or a single one (Monorepo).
* **Decision**: We will use a **Monorepo** to house the Next.js application (frontend and backend) and any shared packages.
* **Consequences**: This approach greatly simplifies dependency management and allows for atomic commits across the entire application. It makes sharing code and types between the frontend and backend trivial, which is a major advantage of our chosen tech stack.

---
### **ADR-003: Application and Module Architecture**

* **Status**: Accepted
* **Context**: A simple monolithic backend risks becoming entangled ("spaghetti code") over time. Furthermore, a key strategic goal is to enable a potential, low-effort pivot to a client-side SharePoint Framework (SPFx) application in the future, which requires portable business logic.
* **Decision**: The backend will be built as a **Modular Monolith**. While deployed as a single unit, it will be internally organized into distinct modules with clear boundaries. Crucially, each module will be designed using the **Hexagonal Architecture (Ports and Adapters)** pattern.
* **Consequences**: This hybrid approach provides the deployment simplicity of a monolith for our POC while enforcing the internal discipline needed for long-term maintainability. The Hexagonal design isolates the core business logic from external frameworks and data sources, making it **highly reusable and portable**. This is the key technical enabler for a future pivot to SPFx.

---
### **ADR-004: Database Technology**

* **Status**: Accepted
* **Context**: We needed a database for the standalone Next.js POC that aligns with a future migration to the Azure/SharePoint ecosystem. We considered graph, file-based, and relational databases, analyzing the trade-offs for performance, complexity, and future portability.
* **Decision**: We will use **PostgreSQL** for the initial standalone application. The planned target for a future SPFx-integrated deployment will be **Azure Database for PostgreSQL**.
* **Consequences**: This provides an extremely smooth migration path. PostgreSQL is a robust, industry-standard choice that is well-supported by our TypeScript tooling (e.g., Prisma) and can easily model our graph-like data. Our Hexagonal architecture makes this a low-risk decision, as the data "adapter" can be easily swapped in the future.

---

### **ADR-005: POC Hosting and Database Platform**

* **Status**: Accepted
* **Context**: For the Proof of Concept (POC) phase, we require a publicly accessible hosting solution for our standalone Next.js application. The primary requirements were rapid deployment, minimal to no cost, a strong security and privacy posture for sensitive data, and a straightforward developer experience. We needed to select a platform for both the application and its PostgreSQL database.
* **Decision**: We will use the **Vercel** platform for hosting our Next.js application and **Vercel Postgres** for our database. For the duration of the POC, we will utilize the **free Hobby tier** for both services. We will secure access by using a custom domain.
* **Consequences**:
    * **Positive**:
        * **Cost**: The total infrastructure cost for the POC is projected to be **$0**.
        * **Speed & Simplicity**: Vercel is highly optimized for Next.js, providing a near-instantaneous "push-to-deploy" workflow, which is ideal for rapid iteration during the POC.
        * **Security Baseline**: The platform provides a robust security foundation out of the box, including HTTPS, encryption at rest for the database, automated backups with Point-in-Time Recovery, and a legally binding **Data Processing Agreement (DPA)** that governs data privacy.
    * **Negative**:
        * This decision is for the **POC only**. The chosen platform is not intended as the final production environment without further review.
        * We are relying on the platform's standard security measures and the legal protection of the DPA. We have explicitly decided to **defer more complex Application-Level Encryption** until a potential post-POC production phase.

---
### **ADR-006: Graph Visualization Technology**

* **Status**: Accepted
* **Context**: The application's core user experience, as defined in the PRD, revolves around an interactive graph for visualizing and managing relationships. Key required features include rendering custom nodes and edges, filtering, and drag-and-drop interactions to support the "quick record" feature. We needed to select a high-level TypeScript library compatible with our Next.js and React stack to implement this functionality efficiently without building it from a low-level tool like D3.js.
* **Decision**: We will use the **React Flow** library as our primary technology for all graph visualization and interaction features.
* **Consequences**:
    * **Positive**: React Flow is a modern library built specifically for React, ensuring seamless integration with our stack. It provides built-in, highly customizable support for the exact features we need, which will significantly accelerate the development of Epics 2 and 4. Its excellent documentation and strong community reduce development risk.
    * **Negative**: We are adding a significant third-party dependency that we are responsible for maintaining. While very flexible, we will be working within the architectural patterns provided by the React Flow library.

---
### **ADR-007: Client-Side State Management Strategy**

* **Status**: Accepted
* **Context**: Modern React applications require a clear strategy for managing state, which can be broadly categorized into "Client State" (UI state, e.g., if a modal is open) and "Server State" (cached backend data from an API). Our initial tech stack included **Zustand** for client state. A "Hindsight Reflection" revealed a risk where developers might misuse this simple store to also manage complex server data, leading to bugs and maintenance issues as the application grows. Additionally, to simplify the POC setup and reduce tooling overhead, we will defer introducing Zustand.
* **Decision**: We will adopt a phased, disciplined, dual-library strategy for state management:
    1.  **POC Phase**: Use built-in **React Context + useReducer** for managing pure, global/persistent **Client State**.
    2.  **All Phases**: Use **TanStack Query** exclusively for all **Server State** (fetching, caching, syncing, mutations).
    3.  **Post‑POC (Planned)**: Introduce **Zustand** for complex UI-only state once the application grows, keeping the strict separation from server state.
* **Consequences**:
    * **Positive**: Maintains best-practice separation between client and server state; reduces POC complexity by avoiding an additional library; preserves a clear migration path to Zustand without refactoring server-state logic. TanStack Query provides powerful, built-in features for caching and automatic data refetching that will improve performance and reduce the amount of custom code we need to write.
    * **Negative**: React Context may require more boilerplate than Zustand for some UI patterns during the POC; a later introduction of Zustand will add a small migration step for selected UI state slices.

---
### **ADR-008: `ApprovalProcess` Logic Placement**

* **Status**: Accepted
* **Context**: The `Relationship` module is responsible for managing both the state of a `Companionship` and the complex, multi-step `ApprovalProcess` required to create one. This creates a risk of the module becoming overly complex and violating the Single Responsibility Principle. We considered creating a separate, top-level `Approval Workflow` module to better separate these concerns.
* **Decision**: For the MVP, the `ApprovalProcess` logic will be implemented **within the `Relationship` module**. However, it is a **mandatory architectural requirement** that this logic be built as a **distinct, internally isolated sub-component**. It must be designed with the explicit goal of being easily extracted into its own top-level module in a future release without a major rewrite.
* **Consequences**:
    * **Positive**: This approach simplifies the top-level architecture for the MVP, as the `ApprovalProcess` is currently only used by `Companionship` relationships. It provides a clear and straightforward path for future refactoring, preventing long-term technical debt.
    * **Negative**: This is a pragmatic compromise on architectural purity; the `Relationship` module temporarily holds more than one core responsibility. The reusability of the approval logic for other domains is deferred.

---
### **ADR-009: Decoupled Role and Scope Management**

* **Status**: Accepted
* **Context**: The application must model complex, non-parallel hierarchies. A member's leadership role (`Supervisor`) is tied directly to the **geographical hierarchy**, while their `Companionship Delegate` role is not. [cite_start]For example, a Zone Delegate may live in one province but be responsible for an entire zone[cite: 1]. This creates a complex modeling challenge, further complicated by the "power separation" business rule. Our goal was to find a data model that could handle this flexibility.

    * **Past Approach 1: Simple Flags**: Our initial idea was to use simple boolean flags on the `Member` model (e.g., `isDelegate`). This was insufficient because it could not capture the **scope** of the role (i.e., *which* province or zone a person was a delegate for).

    * **Past Approach 2: Direct Links**: We then attempted to link roles directly to the `GeographicUnit` by adding fields like `managesUnitId` to the `Member` model. This approach failed because it assumed the delegate and leadership hierarchies were the same, and it introduced a problematic **circular dependency** between our `Member` and `Geographic` modules.

* **Decision**: We will implement a dedicated and flexible role management system composed of two new models: **`Role`** and **`RoleAssignment`**.
    1. The `Role` model defines the types of roles available (e.g., 'Supervisor', 'Companionship Delegate').
    2. The `RoleAssignment` model links a `Member` to a `Role` for a specific `scopeId` (which points to a `GeographicUnit`).
    3. The `Member` model is simplified and contains no direct role information.

* **Consequences**:
    * **Positive**:
        * **Accurately Models Reality**: This design correctly models that a member's location (`geographicUnitId`) and their role's scope (`scopeId`) are separate concepts, solving the non-parallel hierarchy problem.
        * **Flexible & Extensible**: New roles or changes to the hierarchy can be implemented in the future with minimal to no database schema changes.
        * **Decoupled**: It removes the circular dependency between modules and creates a clean separation of concerns, making the system more maintainable and testable.
        * **Enables Core Logic**: This model makes it possible to correctly implement complex business rules like the "power separation" constraint.
    * **Negative**:
        * The data model is more abstract than the initial attempts and requires more database joins to determine a user's full set of permissions. This is a necessary trade-off to accurately reflect the complexity of the business domain.

-----

### **ADR-010: Candidate Search with Hard and Soft Constraints**

  * **Status**: Accepted
  * **Context**: The workflow for finding eligible companions requires filtering members against a complex set of business rules. An initial analysis treated all rules as equal, which does not reflect the real-world process where some rules are absolute ("hard constraints") and others can be exceptions under special circumstances ("soft constraints").
  * **Decision**: The candidate search logic and its corresponding API endpoint (`GET /api/members/{id}/eligible-companions`) will implement a hard and soft constraint model.
    1.  The backend will first filter out all candidates who violate any **Hard Constraints** (e.g., gender, language).
    2.  It will then partition the remaining candidates into two lists: `perfectMatches` and `softConstraintViolations`.
    3.  The API will return a structured response containing both lists. The TypeScript interface for this response will be:
        ```typescript
        interface EligibleCompanionsResponse {
          // Candidates who meet ALL constraints
          perfectMatches: Member[];
          
          // Candidates who violate soft constraints but are still options
          softConstraintViolations: {
            member: Member;
            violations: {
              constraint: 'power_separation' | 'experience' | 'overwhelmed';
              details: string; // e.g., "This person is a supervisor to the accompanied."
            }[];
          }[];
        }
        ```
  * **Consequences**:
      * **Positive**: This provides a much more intelligent API response, allowing the UI to present a nuanced choice to the Delegate and accurately modeling the business process.
      * **Negative**: This increases the complexity of both the backend business logic and the frontend component that must render the two distinct lists.

-----

### **ADR-011: Authentication Strategy - Phased Implementation**

* **Status**: Accepted
* **Context**: The application requires user authentication for community delegates to access the system. A complete email/password authentication system typically needs email verification during registration and password reset functionality for forgotten passwords, which would require integrating an external email service (Resend, SendGrid, etc.). We evaluated three approaches: (1) Full email/password with email service integration, (2) Simplified email/password with manual admin verification for POC, and (3) OAuth-first approach bypassing email infrastructure entirely. Given POC timeline constraints and the goal to minimize external dependencies, we needed to choose an approach that balances rapid development with a clear path to production-ready authentication.
* **Decision**: We will implement a **phased authentication strategy**:
    1. **POC Phase**: Simplified email/password authentication with **manual admin verification**. User accounts are created with unverified status and require admin approval/activation. No email verification or password reset functionality during POC.
    2. **Post-POC Phase 2**: Migration to **OAuth-first authentication** using Auth.js built-in OAuth providers (Google, Microsoft) to eliminate the need for email service integration while providing better security and user experience.
* **Consequences**:
    * **Positive**:
        * **POC Speed**: Eliminates email service integration complexity, allowing faster POC delivery and validation of core business logic.
        * **Zero External Dependencies**: No third-party email service costs or setup required during POC phase.
        * **Clear Migration Path**: Auth.js v5.x natively supports OAuth providers, making Phase 2 transition straightforward with minimal architecture changes.
        * **Better Long-term Security**: OAuth eliminates password storage risks and provides enterprise-grade authentication through established providers.
        * **User Experience**: Post-POC users authenticate with existing corporate/personal accounts they already trust.
    * **Negative**:
        * **POC Manual Overhead**: Admin manual verification creates operational burden during POC phase.
        * **Limited POC Usability**: Users cannot reset passwords independently, requiring admin intervention for account issues.
        * **Temporary Architecture**: POC authentication workflows will be replaced rather than evolved, requiring code changes during Phase 2 migration.

-----
