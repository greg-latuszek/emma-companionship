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
   - There is Community decission to build future IT solutions on top of Microsoft SharePoint.
   - Training materials & meting notes related to Companionship are already at Microsoft SharePoint.
   - I want to research how SharePoint can be extended with dedicated application, how such app should be coded, what technology stack is needed.
   - I want to research how current technology stack can be migrated to SharePoint in future.
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

# Changes to apply
## Technology Stack
