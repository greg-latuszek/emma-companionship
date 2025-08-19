
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
