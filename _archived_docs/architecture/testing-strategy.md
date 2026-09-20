# Testing Strategy

This section defines a comprehensive testing approach for the fullstack application, providing detailed guidance for AI agents and development teams. All testing practices align with Test-Driven Development (TDD) methodology and architectural decisions.

POC Note: End-to-end (E2E) tests with Playwright are planned for a later phase. The POC focuses on unit and integration tests.

## Testing Pyramid

```text
           E2E Tests
          /         \
     Integration Tests
    /                 \
Frontend Unit    Backend Unit
```

**Distribution Strategy:**
- **70% Unit Tests:** Fast, isolated tests for business logic and components
- **20% Integration Tests:** Module interactions, database operations, API endpoints
- **10% E2E Tests:** Critical user journeys and complete workflow validation

**Philosophy:**
- Test-Driven Development (TDD) - Write tests before implementation code
- Coverage Goals: 90% business logic modules, 80% overall project, 100% critical constraints
- Follow Red-Green-Refactor cycle for all new features

## Test Organization

### Frontend Tests

```text
apps/web/src/
├── components/
│   ├── MemberForm/
│   │   ├── MemberForm.tsx
│   │   ├── MemberForm.test.tsx
│   │   └── __tests__/
│   │       └── fixtures/
│   │           └── memberFormData.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useAuth.test.ts
│   └── __tests__/
│       └── fixtures/
│           └── authData.ts
├── lib/
│   ├── api/
│   │   ├── memberService.ts
│   │   └── memberService.test.ts
│   └── utils/
│       ├── validation.ts
│       └── validation.test.ts
└── stores/
    ├── authStore.ts
    └── authStore.test.ts
```

**Frontend Test Categories:**
- **Component Tests:** React Testing Library for UI components, user interactions
- **Hook Tests:** Custom hooks with React Testing Library's renderHook
- **Service Tests:** API client functions with MSW for HTTP mocking
- **UI State Tests:** React Context/Reducer tests with isolated state scenarios (Zustand planned later)
- **Utility Tests:** Pure functions for validation, formatting, business logic

### Backend Tests

```text
apps/web/src/
├── app/api/
│   ├── members/
│   │   ├── route.ts
│   │   ├── route.test.ts
│   │   └── __tests__/
│   │       └── fixtures/
│   │           └── memberApiData.ts
├── lib/modules/
│   ├── authModule/
│   │   ├── authModule.ts
│   │   ├── authModule.test.ts
│   │   └── __tests__/
│   │       └── fixtures/
│   │           └── authTestData.ts
│   ├── memberModule/
│   │   ├── memberModule.ts
│   │   ├── memberModule.test.ts
│   │   └── __tests__/
│   │       └── fixtures/
│   │           └── memberTestData.ts
└── tests/integration/
    ├── api/
    │   ├── members.integration.test.ts
    │   └── auth.integration.test.ts
    └── modules/
        ├── memberModule.integration.test.ts
        └── authModule.integration.test.ts
```

**Backend Test Categories:**
- **API Route Tests:** Next.js API handlers with request/response validation
- **Module Tests:** Business logic modules with database mocking
- **Integration Tests:** Module interactions with Testcontainers PostgreSQL
- **Database Tests:** Prisma operations with transaction rollback
- **Middleware Tests:** Authentication, authorization, error handling

### E2E Tests (Planned)

```text
tests/e2e/
├── specs/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── registration.spec.ts
│   ├── members/
│   │   ├── member-creation.spec.ts
│   │   └── member-management.spec.ts
│   ├── companionships/
│   │   ├── assignment-workflow.spec.ts
│   │   └── health-monitoring.spec.ts
│   └── graph/
│       └── relationship-visualization.spec.ts
├── fixtures/
│   ├── users.ts
│   ├── members.ts
│   └── companionships.ts
├── pages/
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   └── MemberPage.ts
└── playwright.config.ts
```

**E2E Test Categories:**
- **User Authentication:** Login, logout, session management, role-based access
- **Member Management:** CRUD operations, import/export, validation workflows
- **Companionship Assignment:** End-to-end assignment workflow, constraint validation
- **Graph Visualization:** Interactive relationship graphs, filtering, performance
- **Data Import:** CSV/Excel import workflows with error handling

## Test Examples

### Frontend Component Test

```typescript
// apps/web/src/components/MemberForm/MemberForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemberForm } from './MemberForm';
import { memberService } from '@/lib/api/memberService';

// Mock the service
jest.mock('@/lib/api/memberService');
const mockMemberService = memberService as jest.Mocked<typeof memberService>;

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('MemberForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create member with valid data', async () => {
    // Arrange
    const mockMember = { id: '1', name: 'John Doe', email: 'john@example.com' };
    mockMemberService.createMember.mockResolvedValue(mockMember);
    
    const onSuccess = jest.fn();
    renderWithProviders(<MemberForm onSuccess={onSuccess} />);

    // Act
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Assert
    await waitFor(() => {
      expect(mockMemberService.createMember).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      });
      expect(onSuccess).toHaveBeenCalledWith(mockMember);
    });
  });

  it('should display validation errors for invalid input', async () => {
    // Arrange
    renderWithProviders(<MemberForm />);

    // Act
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });
});
```

### Backend API Test

```typescript
// apps/web/src/app/api/members/route.test.ts
import { POST } from './route';
import { memberModule } from '@/lib/modules/memberModule';
import { NextRequest } from 'next/server';

// Mock the member module
jest.mock('@/lib/modules/memberModule');
const mockMemberModule = memberModule as jest.Mocked<typeof memberModule>;

// Mock NextAuth for authentication
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}));

describe('/api/members POST', () => {
  const mockSession = {
    user: { id: '1', email: 'admin@example.com' },
    permissions: ['member:create']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (require('next-auth/next').getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  it('should create member with valid data', async () => {
    // Arrange
    const memberData = { name: 'John Doe', email: 'john@example.com' };
    const createdMember = { id: '1', ...memberData };
    mockMemberModule.createMember.mockResolvedValue(createdMember);

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
      headers: { 'Content-Type': 'application/json' }
    });

    // Act
    const response = await POST(request);
    const responseData = await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(responseData.data).toEqual(createdMember);
    expect(mockMemberModule.createMember).toHaveBeenCalledWith(memberData, mockSession.user);
  });

  it('should return 400 for validation errors', async () => {
    // Arrange
    const invalidData = { name: '', email: 'invalid-email' };
    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: { 'Content-Type': 'application/json' }
    });

    // Act
    const response = await POST(request);
    const responseData = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(responseData.error.code).toBe('VALIDATION_FAILED');
    expect(responseData.error.details).toHaveProperty('name');
    expect(responseData.error.details).toHaveProperty('email');
  });

  it('should return 401 for unauthorized access', async () => {
    // Arrange
    (require('next-auth/next').getServerSession as jest.Mock).mockResolvedValue(null);
    
    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      body: JSON.stringify({ name: 'John', email: 'john@example.com' }),
      headers: { 'Content-Type': 'application/json' }
    });

    // Act
    const response = await POST(request);
    const responseData = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(responseData.error.code).toBe('UNAUTHORIZED');
  });
});
```

### E2E Test

```typescript
// tests/e2e/specs/members/member-creation.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { MemberPage } from '../../pages/MemberPage';

test.describe('Member Creation Workflow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let memberPage: MemberPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    memberPage = new MemberPage(page);

    // Login as Community Delegate
    await loginPage.navigate();
    await loginPage.login('cd@example.com', 'password123');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create new member successfully', async ({ page }) => {
    // Navigate to member creation
    await dashboardPage.navigateToMembers();
    await memberPage.clickCreateMember();

    // Fill member form
    await memberPage.fillMemberForm({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567890',
      geographicUnit: 'Province East',
      role: 'Member'
    });

    // Submit form
    await memberPage.submitForm();

    // Verify success
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(
      'Member created successfully'
    );
    await expect(page).toHaveURL(/\/members\/\d+/);
    
    // Verify member details
    await expect(page.locator('[data-testid="member-name"]')).toContainText('Jane Smith');
    await expect(page.locator('[data-testid="member-email"]')).toContainText('jane.smith@example.com');
  });

  test('should show validation errors for invalid data', async () => {
    // Navigate to member creation
    await dashboardPage.navigateToMembers();
    await memberPage.clickCreateMember();

    // Submit empty form
    await memberPage.submitForm();

    // Verify validation errors
    await expect(page.locator('[data-testid="name-error"]')).toContainText('Name is required');
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required');
    
    // Fill invalid email
    await memberPage.fillEmail('invalid-email');
    await memberPage.submitForm();
    
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format');
  });

  test('should enforce permission-based access', async ({ page }) => {
    // Logout and login as regular member (no create permissions)
    await dashboardPage.logout();
    await loginPage.login('member@example.com', 'password123');
    
    // Try to access member creation
    await dashboardPage.navigateToMembers();
    
    // Verify create button is not visible
    await expect(page.locator('[data-testid="create-member-btn"]')).not.toBeVisible();
    
    // Try direct navigation to create URL
    await page.goto('/members/create');
    await expect(page.locator('[data-testid="access-denied"]')).toContainText(
      'You do not have permission to create members'
    );
  });
});
```

## Enhanced Testing Practices

### Test Data Management
- **Factory Pattern:** Realistic but anonymized test data generation with Faker.js
- **Fixtures:** Static test data in `tests/fixtures/` organized by domain
- **Cleanup:** Transaction rollback for unit tests, full database reset for integration tests

### Continuous Testing Integration
- **Pre-commit:** Unit tests and linting with husky hooks
- **Pull Request:** Full test suite (unit + integration + E2E) with coverage reports
- **Main Branch:** Complete test suite + performance regression tests + security validation

### AI Agent Testing Requirements
- Generate tests using TDD approach for all public methods
- Cover edge cases, constraint violations, and boundary conditions
- Follow AAA pattern (Arrange, Act, Assert) consistently
- Mock external dependencies (database, APIs, file system)
- Test companionship constraint validation exhaustively
- Generate property-based tests for complex business rules

-----
