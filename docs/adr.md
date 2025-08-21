
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
* **Context**: Modern React applications require a clear strategy for managing state, which can be broadly categorized into "Client State" (UI state, e.g., if a modal is open) and "Server State" (cached backend data from an API). Our initial tech stack included **Zustand**, a simple client state library. A "Hindsight Reflection" revealed a future risk where developers might misuse this simple store to also manage complex server data, leading to bugs and maintenance issues as the application grows.
* **Decision**: We will adopt a disciplined, dual-library strategy for state management:
    1.  **Zustand** will be used exclusively for managing pure, global **Client State**.
    2.  **TanStack Query** will be added to the tech stack and used exclusively for managing all **Server State**. This includes fetching, caching, synchronizing, and updating data from our backend API.
* **Consequences**:
    * **Positive**: This separation of concerns is a modern best practice that will significantly improve the reliability and maintainability of our frontend. TanStack Query provides powerful, built-in features for caching and automatic data refetching that will improve performance and reduce the amount of custom code we need to write.
    * **Negative**: We are adding one more library to our tech stack. However, the benefits in code quality and long-term developer experience far outweigh this minor cost.

---
### **ADR-008: `ApprovalProcess` Logic Placement**

* **Status**: Accepted
* **Context**: The `Relationship` module is responsible for managing both the state of a `Companionship` and the complex, multi-step `ApprovalProcess` required to create one. This creates a risk of the module becoming overly complex and violating the Single Responsibility Principle. We considered creating a separate, top-level `Approval Workflow` module to better separate these concerns.
* **Decision**: For the MVP, the `ApprovalProcess` logic will be implemented **within the `Relationship` module**. However, it is a **mandatory architectural requirement** that this logic be built as a **distinct, internally isolated sub-component**. It must be designed with the explicit goal of being easily extracted into its own top-level module in a future release without a major rewrite.
* **Consequences**:
    * **Positive**: This approach simplifies the top-level architecture for the MVP, as the `ApprovalProcess` is currently only used by `Companionship` relationships. It provides a clear and straightforward path for future refactoring, preventing long-term technical debt.
    * **Negative**: This is a pragmatic compromise on architectural purity; the `Relationship` module temporarily holds more than one core responsibility. The reusability of the approval logic for other domains is deferred.

---
