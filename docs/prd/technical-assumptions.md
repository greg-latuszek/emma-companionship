# Technical Assumptions

## Repository Structure: Monorepo
The project will be managed in a single monorepo. This will contain the frontend web application, the backend service, and any shared code (like data types), simplifying dependency management and ensuring consistency.

## Service Architecture: Modular Monolith
The backend will be built as a **Modular Monolith**. While it will be deployed as a single service for the MVP, it **must be internally structured into distinct, independent modules** (e.g., 'Members', 'Relationships', 'Auth') with clear, explicit APIs between them. This architectural pattern is mandatory to prevent code entanglement and provide a straightforward path to extracting modules into microservices in the future, if needed.

## Testing Requirements: A Strategy for the Modular Monolith
Our testing strategy must leverage the boundaries defined by our Modular Monolith architecture. The goal is to maximize confidence while maintaining fast feedback loops for developers. We will employ a multi-layered approach:

* **1. Unit Tests**: To test the internal logic of a single class or function within a module in complete isolation.
* **2. Module-Level Integration Tests**: To test a module as a black box, completely isolated from other modules, verifying its public API and internal components.
* **3. Contract Tests**: To ensure that modules can evolve safely without breaking each other's public API contracts.
* **4. Assembly Tests**: A small suite of end-to-end tests to verify that the modules in the fully assembled monolith are wired together correctly.

## Additional Technical Assumptions and Requests
* **Open Source**: The project must be developed with the intention of being open-source.
* **API Reusability**: The backend API must be designed to be consumed by both the initial web application and a future mobile application.

---