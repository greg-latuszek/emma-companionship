# Project Risk Register

This document tracks the key technical and architectural risks for the emmaCompanionship project.

## Technical Risks

### 1. Performance of On-the-Fly Supervision Calculation
* **Risk**: A UI view that displays a large list of members could trigger many inefficient database lookups to derive each member's supervisor, leading to slow API performance.
* **Mitigation**: The implementation must include an optimized data-loading strategy. This could be a single, complex SQL query (e.g., using recursive CTEs) or a dedicated caching layer for the hierarchy. This is a known performance consideration for the development team.
* **Related Decision**: ADR-009

### 2. 'Shared' Package Coupling
* **Risk**: The monorepo's `shared` package could be overused, becoming a point of high coupling that negates the benefits of our modular architecture. A change to the `shared` package could trigger a cascade of changes across the entire application.
* **Mitigation**: A strict governance policy will be enforced via code reviews and automated linting: the `shared` package is for truly universal, stable code only. Module-specific logic and types must remain within their respective modules.
* **Related Decisions**: ADR-002, ADR-003

### 3. Violation of Module Boundaries
* **Risk**: Developers or AI agents might be tempted to bypass a module's public interface and import internal components directly, which would erode our clean architecture over time.
* **Mitigation**: As decided, we will implement an automated linting script as a foundational task in Epic 1 to programmatically forbid "deep" imports that cross module boundaries. This will be enforced in our CI pipeline.
* **Related Decision**: ADR-003
