# Planned changes to Architecture

## Genric Context
Start of implementation phase with current Architecture caused many issues.
Especially it has triggered risk docs/qa/assessments/1.1-risk-20241219.md [TECH-001]: Monorepo Setup Complexity
Making configuration operable and stable took much more time than expected and finally failed.

Reasons:
- (R.1) Initial plan was overengineered: intention was to quickly build POC but 
        plan for development environment was prepared as production grade one 
        with too many elements that could be added later on
- (R.2) we haven't started from well established template that is production proven to be well configured
- (R.3) we have generated too many code at once - coded all tasks and subtasks of docs/stories/1.1.project-scaffolding-cicd-setup.md
- (R.4) there were no intermediate checkpoints or test runs to verify if new code really works (I mean external tests in local dev env, not only tests run by AI)
- (R.5) we have not prioritized tasks properly - we should have started from simplest possible setup and then gradually added more complexity

Thus, I want to step back and rebuild the plan from Architecture level (PRD is ok).
Especially I want to split docs/stories/1.1.project-scaffolding-cicd-setup.md into smaller pieces and implement them one by one, 
verifying each step in local dev env.

## Step back Research
Before modifying Architecture I want to do deeper research on following areas:
- technology stack migration path towards Microsoft SharePoint
   - There is Community decision to build future IT solutions on top of Microsoft SharePoint.
   - Training materials & meting notes related to Companionship are already at Microsoft SharePoint.
   - I want to research how SharePoint can be extended with dedicated application, how such app should be coded, what technology stack is needed.
   - I want to research how current technology stack can be migrated to SharePoint in the future.
   - I want to identify potential blockers and risks.
   - I want to identify what parts of current technology stack can be reused in SharePoint and what needs to be replaced.
   - I want to identify what are the best practices for such migration.

- technology stack
   - shadcn/ui - what it is and what alternatives we have, can we skip it for POC and use something Next.js provides out of the box?
   - Zustand - what it is, why we need it and what alternatives we have, can we skip it for POC and use something Next.js provides out of the box?
   - TanStack Query - same as above
   - React Flow - same as above
   - Auth.js/NextAuth - same as above
   - React Testing Library - same as above
   - Supertest - same as above
   - Playwright - same as above
   - Turborepo - same as above, especially compare with Nx from our POC view - seems Nx is easier since it has many elements preconfigured (no burden to integrate tooling myself with turborepo)
   - GitHub Actions - how it relates to Nx Cloud, can we use Nx Cloud instead of GitHub Actions for CI/CD?
   - generic question - what (from Technology Stack Categories) might be skipped for POC and added later on?

### Migration towards SharePoint re-research

Of course. It's a wise decision to step back and re-evaluate after hitting an implementation roadblock. The initial architecture was designed with a potential SharePoint pivot in mind, and this is the perfect time to do a deeper analysis to ensure that path is clear before you simplify and restart the implementation.

Based on your documents, the core strategy revolves around the decisions in **ADR-003 (Modular Monolith with Hexagonal Architecture)** and **ADR-004 (PostgreSQL Database)**. Let's dive deep into how these decisions directly enable the future SharePoint integration.

---
#### How to Extend SharePoint: The SPFx Model

Microsoft's modern platform for building applications that live *inside* SharePoint is the **SharePoint Framework (SPFx)**. Understanding its model is key.

* **It's a Client-Side Framework**: An SPFx application is, fundamentally, a **TypeScript and React application** that runs entirely in the user's browser within the SharePoint page context. It is *not* a server-side application.
* **The "Backend" is an API**: Since the SPFx app itself has no backend, any data persistence or complex server-side logic must be handled by calling external APIs. In the Microsoft ecosystem, the standard choice for this is **Azure Functions**.
* **Authentication is Handled**: SPFx automatically provides the context of the logged-in SharePoint user, simplifying authentication and authorization against your backend API.

So, a native SharePoint version of your application would consist of two main parts:
1.  A **React/TypeScript frontend** built with SPFx tooling.
2.  An **API backend** built with Azure Functions that communicates with a database.

---
#### The Migration Path: From Next.js POC to SPFx

Your initial architectural decisions, particularly using **Hexagonal Architecture**, create a clear and efficient migration path. The strategy isn't to "migrate" the Next.js app but to **re-platform the pieces around your portable business logic**.

Here’s the step-by-step breakdown:

##### Step 1: Leverage Your Core Business Logic (100% Reusable)
This is the central pillar of the strategy. As established in **ADR-003**, your Hexagonal Architecture isolates the core domain logic from the framework.

* **What it is**: The pure TypeScript code inside your modules (`Auth`, `Geographic`, `Member`, `Relationship`) that handles business rules, data structures, and workflows.
* **How it migrates**: This code is completely independent of Next.js. You can lift this logic and drop it directly into an Azure Function project without changing a single line. This is the most valuable asset for reuse. 
##### Step 2: Re-platform the "Adapters"
The "adapters" are the pieces that connect your core logic to the outside world. This is where the main changes happen.

* **The API Adapter**:
    * **In Next.js POC**: This is your `app/api/` directory (your API Routes).
    * **In SPFx Future**: You will create new **Azure Functions** that serve the same purpose. The code inside these functions will be very simple: receive an HTTP request, call the corresponding function in your core business logic, and return the result.
* **The Database Adapter**:
    * **In Next.js POC**: This is your Prisma implementation that talks to **PostgreSQL** on Vercel.
    * **In SPFx Future**: This adapter moves *with* the core logic into the Azure Function. It will still be a Prisma implementation, but it will be configured to connect to **Azure Database for PostgreSQL** (as per **ADR-004**). The code change here is minimal—likely just a connection string.

##### Step 3: Build the New SPFx Frontend
This is the only significant "new build" part of the process, but even here, you get massive code reuse.

* **What is Replaced**: The Next.js routing and page structure (`app/` directory) is replaced by the SPFx web part structure.
* **What is Reused**:
    * **UI Components**: All your `shadcn/ui` components from `/packages/ui` are just React components and can be used directly in SPFx.
    * **Client-Side State Management**: Your state management strategy (**ADR-007**) with **Zustand** (for UI state) and **TanStack Query** (for server state) is perfectly portable to the new SPFx frontend.
    * **Data Fetching Logic**: The key change for TanStack Query will be updating the API base URL from `/api/...` to the new Azure Function URLs. The queries themselves remain the same.
    * **Shared Types**: The entire `/packages/shared-types` package will be reused, ensuring continued type safety.

---
#### Reusability Summary

| Component | Next.js POC Implementation | Future SPFx Implementation | Reusability |
| :--- | :--- | :--- | :--- |
| **Core Business Logic** | TypeScript (Hexagonal Core) | TypeScript (Hexagonal Core) | **~100%** ✅ |
| **Shared Types** | TypeScript package | TypeScript package | **~100%** ✅ |
| **UI Components** | React (`shadcn/ui`) | React (`shadcn/ui`) | **~95%** ✅ |
| **Client State** | Zustand & TanStack Query | Zustand & TanStack Query | **~95%** ✅ |
| **API Layer** | Next.js API Routes | **Azure Functions** | **~20%** (Concept only) 🔄 |
| **Database** | Vercel Postgres | **Azure DB for PostgreSQL** | **~95%** (Prisma code) ✅ |
| **Hosting** | Vercel | **SharePoint + Azure** | **0%** (Replaced) ❌ |
| **Authentication** | Auth.js (Manual) | **SPFx User Context** | **0%** (Replaced) ❌ |

---
#### Potential Blockers, Risks, and Best Practices

* **Risk: Leaky Abstractions**. The biggest risk is developers accidentally letting Next.js-specific or Vercel-specific code "leak" into the core business logic.
    * **Best Practice**: Be extremely disciplined. The core logic modules should have **zero** dependencies on `next`, `react`, or any framework-specific libraries. Enforce this with ESLint rules.
* **Risk: Environment Mismatch**. Azure Functions have a slightly different execution environment than Vercel Functions.
    * **Best Practice**: Design all business logic to be **stateless**. This is a requirement for serverless functions on any platform and ensures portability.
* **Risk: Unplanned Costs**. The Vercel Hobby tier is free (**ADR-005**), but Azure services will have costs associated with them.
    * **Best Practice**: Plan for a small Azure budget when the time comes for the pivot. Azure Functions and Azure DB for PostgreSQL both have cost-effective tiers suitable for this application's scale.
* **Best Practice: Package for Portability**. The best way to enforce the separation of concerns is to put your reusable code into dedicated packages within the monorepo (e.g., `@your-org/core-logic`, `@your-org/shared-types`, `@your-org/ui-components`). This makes them truly portable.

---
#### Excel for POC

That's an understandable line of thought, aiming for simplicity and future compatibility. However, using Excel for the POC's persistence layer would introduce critical technical problems that would ultimately make the project fail. It's a path I must strongly advise against.

Let's break down why this approach, while seeming straightforward, is not viable for this application.

---
#### The Core Problem: A File is Not a Database

Using an Excel file stored in SharePoint as a backend is fundamentally different from using a database, especially for an application that requires multiple users to read and write data simultaneously. Here are the major issues you would encounter:

##### 1. **Concurrency and File Locking (The Showstopper)**
This is the most significant and immediate blocker.
* **How it works**: When a user (or an application acting on their behalf) opens an Excel file from SharePoint to make a change, SharePoint places a lock on that file to prevent others from overwriting it.
* **What it means for your app**: Imagine Delegate A starts an action to create a new companionship. The Next.js API would need to "open" the Excel file to write a new row. While it's open, if Delegate B tries to update a member's status, their request will either fail completely or be forced to wait. Your application would effectively become a **single-user system for any write operations**, which defeats the purpose of the PRD. Managing these locks from stateless serverless functions is a classic distributed systems problem that is notoriously difficult to solve correctly.

##### 2. **Data Integrity and Transactions**
Databases guarantee that a series of related changes either all succeed or all fail together (a "transaction").
* **Example**: When a new companionship is proposed, you need to create both the `Companionship` record and the `ApprovalProcess` records.
* **In Excel**: You would write to one sheet, then another. If the server function crashes after writing to the first sheet but before writing to the second, your data is now in a corrupt, inconsistent state. There is no way to guarantee transactional integrity with an Excel file.

##### 3. **Performance and Scalability**
Your application will become unusably slow.
* **Every small update** (like changing a health status) would require the server to download the entire Excel file, find the right row, modify it, and upload the entire file again.
* **Complex queries** (like finding eligible companions based on multiple rules) would require downloading the *entire member list*, loading it into memory, and then filtering it with code. A database does this in milliseconds.
* This approach **will not scale** beyond a tiny handful of users and a few dozen records before performance grinds to a halt.

##### 4. **Data Relationships and Querying**
Relational databases like PostgreSQL are specifically designed to handle the complex relationships in your data model (members to units, roles to members, companionships between members). Querying these relationships is fast and efficient with SQL. In Excel, you would have to manually build this logic in your application code, which would be slow, error-prone, and complex.

#### The Strategic Path Forward Remains the Same

The key insight from our previous analysis holds true: **no matter what you use for the POC, a future SPFx application will need to talk to it via an API.**

Your decision to use **Hexagonal Architecture (ADR-003)** was made for precisely this reason. It makes the database for the POC a **low-risk, swappable component**.

Therefore, the most pragmatic and technically sound recommendation remains:
1.  **Use a real database (PostgreSQL)** for the Next.js POC. This allows you to build and validate your core business logic against a robust, reliable, and performant backend that correctly handles all the complexities like concurrency and transactions.
2.  **Trust the Architecture**. When you pivot to SPFx, you will keep your core logic and simply write a new "data adapter" that points to Azure services.

Using Excel would force you to spend the entire POC solving fundamental computer science problems that databases solved decades ago, instead of focusing on building and validating the business features your community needs. Let's stick with the robust architectural plan we've already defined.

---
#### Conclusion and Recommendation

Your initial architecture is **absolutely correct and sound** for a future pivot to SharePoint. The implementation failure was due to setup complexity, not a flawed architectural strategy. The combination of a **Modular Monolith** and **Hexagonal Architecture** is the industry-best-practice approach for exactly this kind of scenario.

My recommendation is to **stay the course with your current architectural ADRs**. The next step should be to simplify the *implementation plan* for the POC, not to change the architecture itself. Start with the simplest possible Turborepo template and incrementally add your modules and hexagonal patterns one by one, ensuring each step works before moving to the next. This will mitigate the setup risk you encountered while building on an architecture that is perfectly positioned for the future.

---
### Technology Stack re-research

---
#### shadcn/ui
* **What it is**: It's not a traditional component library like Material UI. Instead, it's a curated collection of reusable, unstyled components built on **Radix UI** (for accessibility) and styled with **Tailwind CSS**. You use a CLI to copy the component's source code directly into your project, giving you full control.
* **Why we chose it**: It's highly customizable, fully accessible, and aligns perfectly with our decision to use Tailwind CSS, preventing the need to learn a separate styling system (`architecture.md`).
* **Alternatives**:
    * **Full Libraries**: Material UI (MUI), Ant Design, Chakra UI. These are faster to start with but are more opinionated and harder to customize.
    * **Plain Tailwind CSS**: Building your own components from scratch using only Tailwind CSS.
* **Can we skip it for the POC?**: **Yes, absolutely.** To simplify the POC, you can build the initial UI with basic HTML elements (`<button>`, `<input>`, etc.) styled directly with Tailwind CSS. This will be faster and reduce initial setup. You can adopt shadcn/ui later when you need more complex, pre-built components like dialogs or data tables.

---
#### Zustand
* **What it is**: A very lightweight and simple library for managing **client-side state** (e.g., is a modal open, what is the current theme).
* **Why we chose it**: It was selected to handle UI-only state in a clean way, separating it from server data as per **ADR-007**. Its simple API is easy to learn (`architecture.md`).
* **Alternatives**:
    * **React Hooks**: Using `useState` and `useContext` is the built-in React way to manage state.
    * **Redux Toolkit**: A more powerful, but also more complex and boilerplate-heavy, state management solution.
* **Can we skip it for the POC?**: **Yes.** For the POC, you can rely entirely on React's built-in `useState` and `useContext` hooks. Only if you find yourself passing state down through many layers of components ("prop drilling") should you consider adding a simple store like Zustand.

---
#### TanStack Query
* **What it is**: A library for managing **server state**. It handles the complexities of fetching, caching, synchronizing, and updating data from your backend API.
* **Why we chose it**: It's the industry standard for managing server data in React. It eliminates complex and error-prone `useEffect` hooks for data fetching and provides essential features like caching, background refetching, and optimistic updates out of the box (**ADR-007**).
* **Alternatives**:
    * **Manual `useEffect`**: Writing `fetch` calls inside `useEffect` hooks. This is complex to manage correctly (handling loading, error, and success states) and quickly leads to bugs.
    * **SWR**: A similar library from Vercel. It's also excellent but TanStack Query is generally considered more feature-rich.
* **Can we skip it for the POC?**: **No, I strongly recommend keeping it.** Skipping this would actually *increase* the complexity and fragility of your POC. You would have to manually re-implement caching and state management for every API call. TanStack Query simplifies your code, makes it more robust, and is a major productivity booster.

---
#### React Flow
* **What it is**: A specialized library for rendering and interacting with node-based graphs.
* **Why we chose it**: It directly supports the core PRD requirement of an interactive graph for managing relationships, including custom nodes and drag-and-drop interactions (**ADR-006**).
* **Alternatives**: Building from scratch with a lower-level library like D3.js (extremely complex), or using other libraries like Cytoscape.js.
* **Can we skip it for the POC?**: **This depends on your POC's scope.**
    * If a key goal of the POC is to validate the interactive graph visualization, then **no**, you cannot skip it.
    * If the POC can be simplified to first validate the data management and business logic (e.g., managing members and companionships in simple tables and forms), then **yes**, you can defer the graph visualization to a later stage.

---
#### Auth.js (NextAuth)
* **What it is**: The standard, full-featured authentication solution for Next.js applications.
* **Why we chose it**: It's secure, well-integrated with Next.js, and supports various authentication strategies, including the phased approach we planned in **ADR-011**.
* **Alternatives**:
    * **Build Your Own**: Highly complex, time-consuming, and extremely risky from a security perspective. Not recommended.
    * **Third-party Services**: Clerk, Supabase Auth. These are excellent but introduce another external dependency and service to manage.
* **Can we skip it for the POC?**: **No.** The application requires protected routes and user roles from the beginning. Auth.js is the most direct and secure way to achieve this within the Next.js ecosystem. Trying to build this yourself would significantly slow down the POC.

---
#### React Testing Library & Supertest
* **What they are**:
    * **React Testing Library (RTL)**: The standard for testing React components.
    * **Supertest**: The standard for testing backend API endpoints in a Node.js environment.
* **Why we chose them**: They are the established, recommended tools for testing in the React/Node.js ecosystem (`architecture.md`).
* **Alternatives**: Enzyme for components (older), custom fetch calls for APIs (more boilerplate).
* **Can we skip them for the POC?**: **No.** Skipping automated testing, even for a POC, is a false economy. You'll spend more time manually re-testing everything after each change than you would writing simple tests upfront. They are foundational for building reliable software.

---
#### Playwright
* **What it is**: A tool for **End-to-End (E2E) testing**. It automates a real browser to click through your application like a user would.
* **Why we chose it**: It's a modern, reliable, and powerful E2E testing framework (`architecture.md`).
* **Alternatives**: Cypress.
* **Can we skip it for the POC?**: **Yes, absolutely.** E2E tests are the most complex and slowest tests to run. For a POC, focusing on unit tests (RTL) and integration tests (Supertest) is more than sufficient. E2E testing is a perfect candidate to defer until the application is more mature.

---
#### Turborepo vs. Nx
* **What they are**: Build systems and tooling for managing monorepos.
* **Why we chose Turborepo**: It is lightweight, has excellent build performance, and is favored by Vercel (`architecture.md`).
* **Comparison**: Your intuition is correct. The `[TECH-001]` risk materialized because Turborepo is less opinionated, requiring more manual configuration to integrate tools like Jest, ESLint, etc.
    * **Nx** is more of a full-featured framework. It uses plugins to pre-configure tooling, generate code, and visualize the dependency graph. This can drastically simplify the initial setup at the cost of learning the "Nx way" of doing things.
* **Recommendation**: Given the setup failure, **I strongly recommend pivoting to an Nx-based Next.js starter template for your restart.** It directly addresses the root cause of the previous failure by providing a stable, pre-configured foundation for your monorepo.

---
#### GitHub Actions & Nx Cloud
* **What they are**:
    * **GitHub Actions**: A CI/CD platform for automating workflows (build, test, deploy) directly from your GitHub repository.
    * **Nx Cloud**: A service that dramatically speeds up your CI/CD pipeline by providing a distributed cache. It is *not* a replacement for GitHub Actions; it's a powerful add-on.
* **Relationship**: You would use GitHub Actions to *run* your commands (e.g., `nx test`, `nx build`). By connecting Nx Cloud, if a teammate has already run those same tests on the same code, the results are pulled from the cache instantly instead of re-running them.
* **Can we skip it for the POC?**: **Yes.** For the POC, you can rely on running tests locally and deploying manually to Vercel. Setting up a full CI/CD pipeline is a great practice but can be deferred to simplify the initial setup.

---
#### Summary: What to Skip for the POC

To address your goal of simplifying the POC, here is a clear summary of what can be deferred:

| Technology | Keep for POC? | Rationale |
|:---|:---:|:---|
| **Nx Monorepo** | ✅ | **Switch to Nx.** It directly solves the setup complexity you faced. |
| TanStack Query | ✅ | Essential. Skipping it would *increase* complexity and bugs. |
| Auth.js (NextAuth) | ✅ | Essential for security and user roles. Non-negotiable. |
| RTL & Supertest | ✅ | Foundational testing tools that speed up development. |
| **Playwright (E2E)** | ❌ | **Defer.** E2E testing is too complex for an initial POC. |
| **shadcn/ui** | ❌ | **Defer.** Start with plain Tailwind CSS for speed and simplicity. |
| **Zustand** | ❌ | **Defer.** Start with built-in React hooks (`useState`/`useContext`). |
| **React Flow** | ❓ | **Conditional.** Defer if the graph UI isn't a day-one POC requirement. |
| **GitHub Actions** | ❌ | **Defer.** You can deploy manually from your machine for the POC. |

# Changes to apply
## Technology Stack
