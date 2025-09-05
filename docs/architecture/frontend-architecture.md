# Frontend Architecture

This section defines frontend-specific architecture details for our Next.js application, including component organization, state management, routing patterns, and service layer integration.

## Component Architecture

Our component architecture follows Next.js App Router conventions with clear separation between Server and Client Components, organized by feature domain and complexity levels for maximum maintainability and developer experience.

### Component Organization

```
apps/web/src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout (Server Component)
│   ├── page.tsx                 # Home page (Server Component)
│   ├── (auth)/                  # Route groups for auth pages
│   │   ├── login/page.tsx       # Login page (Client Component)
│   │   └── layout.tsx           # Auth layout (Server Component)
│   ├── dashboard/
│   │   ├── page.tsx             # Dashboard (Server Component)
│   │   └── loading.tsx          # Loading UI (Server Component)
│   ├── members/
│   │   ├── page.tsx             # Member list (Server Component)
│   │   ├── [id]/page.tsx        # Member detail (Server Component)
│   │   ├── [id]/edit/page.tsx   # Member edit (Client Component)
│   │   └── create/page.tsx      # Member creation (Client Component)
│   └── graph/
│       ├── page.tsx             # Graph view (Client Component)
│       └── error.tsx            # Error boundary (Client Component)
│
├── components/                   # Reusable components
│   ├── ui/                      # Basic UI primitives (shadcn/ui)
│   │   ├── button.tsx           # Base Button component
│   │   ├── input.tsx            # Base Input component
│   │   ├── card.tsx             # Base Card component
│   │   ├── dialog.tsx           # Modal dialog component
│   │   ├── toast.tsx            # Toast notification component
│   │   └── index.ts             # Barrel exports
│   │
│   ├── forms/                   # Complex form components
│   │   ├── MemberForm.tsx       # Member CRUD form (Client Component)
│   │   ├── CompanionshipForm.tsx # Companionship form (Client Component)
│   │   ├── RoleAssignmentForm.tsx # Role assignment (Client Component)
│   │   └── ImportWizard.tsx     # Data import wizard (Client Component)
│   │
│   ├── graph/                   # Graph visualization components
│   │   ├── GraphContainer.tsx   # Main graph wrapper (Client Component)
│   │   ├── NodeRenderer.tsx     # Custom node components
│   │   ├── EdgeRenderer.tsx     # Custom edge components
│   │   ├── FilterPanel.tsx      # Graph filtering UI
│   │   ├── GraphMinimap.tsx     # Navigation minimap
│   │   └── ExportButton.tsx     # Graph export functionality
│   │
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── MemberOverview.tsx   # Member statistics card
│   │   ├── HealthStatusCards.tsx # Health status overview
│   │   ├── QuickActions.tsx     # Common action buttons
│   │   ├── RecentActivity.tsx   # Activity feed
│   │   └── SearchBar.tsx        # Global search component
│   │
│   ├── layout/                  # Layout components
│   │   ├── Navigation.tsx       # Main navigation (Client Component)
│   │   ├── Sidebar.tsx          # Collapsible sidebar
│   │   ├── Header.tsx           # Page header with user menu
│   │   ├── Footer.tsx           # Application footer
│   │   └── BreadcrumbNav.tsx    # Breadcrumb navigation
│   │
│   └── providers/               # Context providers
│       ├── AuthProvider.tsx     # Authentication context
│       ├── ThemeProvider.tsx    # Dark/light theme context
│       ├── QueryProvider.tsx    # TanStack Query provider
│       ├── ToastProvider.tsx    # Toast notification provider
│       └── PermissionProvider.tsx # Role-based access control
```

**Organization Principles:**

1. **Server-First Approach:** Default to Server Components for better performance and SEO
2. **Client Boundaries:** Mark Client Components only when interactivity is required
3. **Feature-Based Grouping:** Organize components by business domain
4. **Complexity Separation:** Basic UI → Complex Forms → Feature-Specific
5. **Composition Over Inheritance:** Small, composable components

### Component Template

```typescript
// Example: Complex form component with full patterns
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateMemberRequest, CreateMemberRequestSchema } from '@/packages/shared-types';
import { memberService } from '@/lib/api/memberService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';

interface MemberFormProps {
  initialData?: Partial<CreateMemberRequest>;
  onSuccess?: (member: Member) => void;
  onCancel?: () => void;
}

export function MemberForm({ initialData, onSuccess, onCancel }: MemberFormProps) {
  const queryClient = useQueryClient();
  
  // Form state management with validation
  const form = useForm<CreateMemberRequest>({
    resolver: zodResolver(CreateMemberRequestSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'male',
      ...initialData,
    },
  });

  // Server state mutation with optimistic updates
  const createMember = useMutation({
    mutationFn: memberService.createMember,
    onMutate: async (newMember) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['members'] });
      
      // Optimistic update
      const previousMembers = queryClient.getQueryData(['members']);
      queryClient.setQueryData(['members'], (old: Member[] = []) => [
        ...old,
        { ...newMember, id: 'temp-' + Date.now() }
      ]);
      
      return { previousMembers };
    },
    onError: (err, newMember, context) => {
      // Rollback optimistic update
      queryClient.setQueryData(['members'], context?.previousMembers);
      toast.error('Failed to create member: ' + err.message);
    },
    onSuccess: (member) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member created successfully');
      onSuccess?.(member);
      form.reset();
    },
  });

  // Form submission handler
  const onSubmit = (data: CreateMemberRequest) => {
    createMember.mutate(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Form fields with validation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                {...form.register('firstName')}
                placeholder="First Name"
                aria-invalid={!!form.formState.errors.firstName}
                aria-describedby={form.formState.errors.firstName ? 'firstName-error' : undefined}
              />
              {form.formState.errors.firstName && (
                <p id="firstName-error" className="text-red-500 text-sm mt-1">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            
            <div>
              <Input
                {...form.register('lastName')}
                placeholder="Last Name"
                aria-invalid={!!form.formState.errors.lastName}
                aria-describedby={form.formState.errors.lastName ? 'lastName-error' : undefined}
              />
              {form.formState.errors.lastName && (
                <p id="lastName-error" className="text-red-500 text-sm mt-1">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={createMember.isPending}
              aria-describedby="submit-status"
            >
              {createMember.isPending ? 'Creating...' : 'Create Member'}
            </Button>
          </div>
          
          {/* Screen reader status */}
          <div id="submit-status" className="sr-only">
            {createMember.isPending && 'Creating member, please wait'}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Export with display name for debugging
MemberForm.displayName = 'MemberForm';
```

**Component Pattern Features:**

1. **TypeScript Integration:** Full type safety with shared interfaces
2. **Form Management:** React Hook Form with Zod validation
3. **Server State:** TanStack Query with optimistic updates
4. **Error Handling:** User-friendly error messages and rollback
5. **Accessibility:** ARIA labels, screen reader support, keyboard navigation
6. **Performance:** Proper re-render optimization and loading states

## State Management Architecture

Our state management architecture follows a clear separation of concerns between server state and UI state, leveraging modern React patterns for optimal performance and developer experience.

### State Structure

```typescript
// ===============================
// Server State (TanStack Query)
// ===============================

// Query key factory for consistent caching
export const queryKeys = {
  // Member queries
  members: {
    all: ['members'] as const,
    lists: () => [...queryKeys.members.all, 'list'] as const,
    list: (filters: MemberFilters) => [...queryKeys.members.lists(), filters] as const,
    details: () => [...queryKeys.members.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.members.details(), id] as const,
    roles: (id: string) => [...queryKeys.members.detail(id), 'roles'] as const,
  },
  
  // Companionship queries
  companionships: {
    all: ['companionships'] as const,
    lists: () => [...queryKeys.companionships.all, 'list'] as const,
    list: (unitId: string) => [...queryKeys.companionships.lists(), unitId] as const,
    details: () => [...queryKeys.companionships.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.companionships.details(), id] as const,
    health: (id: string) => [...queryKeys.companionships.detail(id), 'health'] as const,
  },
  
  // Graph queries
  graph: {
    all: ['graph'] as const,
    data: (unitId: string, filters: GraphFilters) => 
      [...queryKeys.graph.all, 'data', unitId, filters] as const,
    layout: (unitId: string) => [...queryKeys.graph.all, 'layout', unitId] as const,
  },
  
  // Geographic queries
  geographic: {
    all: ['geographic'] as const,
    units: () => [...queryKeys.geographic.all, 'units'] as const,
    tree: () => [...queryKeys.geographic.units(), 'tree'] as const,
    descendants: (unitId: string) => [...queryKeys.geographic.units(), 'descendants', unitId] as const,
  },
  
  // Auth queries
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    permissions: (userId: string) => [...queryKeys.auth.all, 'permissions', userId] as const,
  },
} as const;

// ===============================
// UI State (Zustand Stores)
// ===============================

// Theme and UI preferences
interface UIState {
  // Theme management
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Layout state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Modal/dialog state
  modals: {
    memberForm: { open: boolean; mode: 'create' | 'edit'; memberId?: string };
    companionshipWizard: { open: boolean; accompaniedId?: string };
    roleAssignment: { open: boolean; memberId?: string };
    dataImport: { open: boolean; step: 'upload' | 'mapping' | 'preview' | 'results' };
  };
  openModal: (modal: keyof UIState['modals'], data?: any) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  
  // Toast notifications
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    duration?: number;
  }>;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
}

// Graph-specific UI state
interface GraphState {
  // View state
  selectedNodes: string[];
  selectedEdges: string[];
  hoveredNode: string | null;
  
  // Filter state
  filters: {
    healthStatus: HealthStatus[];
    memberTypes: MemberType[];
    roleTypes: RoleType[];
    showSupervision: boolean;
    showCompanionships: boolean;
  };
  
  // Layout state
  layout: {
    algorithm: 'force' | 'hierarchical' | 'circular';
    nodeSpacing: number;
    edgeLength: number;
  };
  
  // Interaction state
  isSelecting: boolean;
  isDragging: boolean;
  panPosition: { x: number; y: number };
  zoomLevel: number;
  
  // Actions
  setSelectedNodes: (nodeIds: string[]) => void;
  setFilters: (filters: Partial<GraphState['filters']>) => void;
  setLayout: (layout: Partial<GraphState['layout']>) => void;
  resetView: () => void;
}

// Form state for complex multi-step workflows
interface FormState {
  // Data import wizard state
  importWizard: {
    currentStep: number;
    uploadedFile: File | null;
    detectedColumns: string[];
    fieldMappings: Record<string, string>;
    validationResults: {
      validRows: number;
      invalidRows: number;
      errors: Array<{ row: number; field: string; message: string }>;
    };
    importProgress: {
      isImporting: boolean;
      progress: number;
      processedRows: number;
      totalRows: number;
    };
  };
  
  // Companionship wizard state
  companionshipWizard: {
    step: 'select-accompanied' | 'find-companions' | 'review-proposal';
    accompaniedMember: Member | null;
    eligibleCompanions: {
      perfectMatches: Member[];
      softViolations: Array<{ member: Member; violations: string[] }>;
    };
    selectedCompanion: Member | null;
    justification: string;
  };
  
  // Actions for form workflows
  setImportWizardStep: (step: number) => void;
  setFieldMappings: (mappings: Record<string, string>) => void;
  setCompanionshipWizardStep: (step: FormState['companionshipWizard']['step']) => void;
  resetFormState: () => void;
}

// ===============================
// Authentication State (Context + Query)
// ===============================

interface AuthContextType {
  // Session data (from TanStack Query)
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Permissions (cached via TanStack Query)
  permissions: UserPermissions | null;
  hasPermission: (action: string, scope?: string) => boolean;
  
  // Auth actions
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
```

### State Management Patterns

**Server State Management (TanStack Query):**

- **Centralized Query Keys:** Hierarchical key structure for precise cache invalidation
- **Optimistic Updates:** Immediate UI updates with rollback on failure
- **Background Refetching:** Automatic data freshness with configurable stale times
- **Infinite Queries:** Pagination support for large member lists
- **Parallel Queries:** Simultaneous data fetching for dashboard views
- **Dependent Queries:** Conditional queries based on user permissions
- **Cache Persistence:** LocalStorage persistence for offline functionality

**UI State Management (Zustand):**

- **Slice Pattern:** Separate stores for different UI concerns
- **Immer Integration:** Immutable updates with simple mutation syntax
- **DevTools Support:** Redux DevTools integration for debugging
- **Persistence Middleware:** LocalStorage sync for user preferences
- **Computed Values:** Derived state with automatic dependency tracking
- **Action Creators:** Consistent action patterns across stores

**State Synchronization Patterns:**

- **Server-UI Bridge:** TanStack Query mutations trigger UI state updates
- **Optimistic UI:** Immediate feedback with server state reconciliation
- **Error Recovery:** Automatic rollback of optimistic updates on failure
- **Cache Invalidation:** Smart invalidation based on data relationships
- **Background Sync:** Periodic data synchronization for long-running sessions

**Performance Optimization Patterns:**

- **Selective Subscriptions:** Components subscribe only to needed state slices
- **Memoization:** React.memo and useMemo for expensive computations
- **Virtual Scrolling:** Efficient rendering of large member lists
- **Debounced Updates:** Prevent excessive API calls from user interactions
- **Code Splitting:** Lazy loading of heavy state management code

## Routing Architecture

Our routing architecture leverages Next.js App Router with file-based routing, implementing modern patterns for authentication, authorization, and user experience optimization.

### Route Organization

```
apps/web/src/app/
├── layout.tsx                    # Root layout with providers
├── page.tsx                      # Home page (public)
├── loading.tsx                   # Global loading UI
├── error.tsx                     # Global error boundary
├── not-found.tsx                 # 404 page
│
├── (auth)/                       # Route group for authentication
│   ├── layout.tsx               # Auth layout (minimal, no navigation)
│   ├── login/
│   │   ├── page.tsx             # Login form
│   │   └── loading.tsx          # Login loading state
│   ├── register/
│   │   └── page.tsx             # Registration (if enabled)
│   └── forgot-password/
│       └── page.tsx             # Password reset
│
├── (dashboard)/                  # Route group for authenticated app
│   ├── layout.tsx               # Dashboard layout with navigation
│   ├── dashboard/
│   │   ├── page.tsx             # Main dashboard
│   │   ├── loading.tsx          # Dashboard loading skeleton
│   │   └── error.tsx            # Dashboard error boundary
│   │
│   ├── members/                 # Member management routes
│   │   ├── page.tsx             # Member list with filters/search
│   │   ├── loading.tsx          # Member list loading state
│   │   ├── create/
│   │   │   └── page.tsx         # Member creation form
│   │   └── [id]/                # Dynamic member routes
│   │       ├── page.tsx         # Member detail view
│   │       ├── edit/
│   │       │   └── page.tsx     # Member edit form
│   │       ├── roles/
│   │       │   └── page.tsx     # Role assignment for member
│   │       └── companionships/
│   │           └── page.tsx     # Member's companionship history
│   │
│   ├── companionships/          # Companionship management
│   │   ├── page.tsx             # Companionship list
│   │   ├── create/
│   │   │   └── page.tsx         # Manual companionship creation
│   │   ├── wizard/
│   │   │   └── page.tsx         # Guided assignment wizard
│   │   └── [id]/
│   │       ├── page.tsx         # Companionship detail
│   │       ├── edit/
│   │       │   └── page.tsx     # Edit companionship
│   │       └── approval/
│   │           └── page.tsx     # Approval workflow interface
│   │
│   ├── graph/                   # Graph visualization
│   │   ├── page.tsx             # Interactive graph view
│   │   ├── loading.tsx          # Graph loading with skeleton
│   │   └── error.tsx            # Graph-specific error handling
│   │
│   ├── import/                  # Data import workflows
│   │   ├── page.tsx             # Import dashboard
│   │   ├── upload/
│   │   │   └── page.tsx         # File upload step
│   │   ├── mapping/
│   │   │   └── page.tsx         # Field mapping step
│   │   ├── preview/
│   │   │   └── page.tsx         # Data preview and validation
│   │   └── results/
│   │       └── page.tsx         # Import results and errors
│   │
│   ├── reports/                 # Reporting and analytics
│   │   ├── page.tsx             # Report dashboard
│   │   ├── health/
│   │   │   └── page.tsx         # Relationship health reports
│   │   ├── coverage/
│   │   │   └── page.tsx         # Companionship coverage analysis
│   │   └── export/
│   │       └── page.tsx         # Data export utilities
│   │
│   └── settings/                # Application settings
│       ├── page.tsx             # User preferences
│       ├── profile/
│       │   └── page.tsx         # User profile management
│       ├── permissions/
│       │   └── page.tsx         # Role and permission management
│       └── system/
│           └── page.tsx         # System configuration (admin only)
│
└── api/                         # API routes (separate from pages)
    ├── auth/
    │   └── [...nextauth]/
    │       └── route.ts         # Auth.js configuration
    ├── members/
    │   ├── route.ts             # Member CRUD operations
    │   └── [id]/
    │       ├── route.ts         # Individual member operations
    │       └── roles/
    │           └── route.ts     # Member role management
    ├── companionships/
    │   ├── route.ts             # Companionship operations
    │   ├── [id]/
    │   │   └── route.ts         # Individual companionship operations
    │   └── wizard/
    │       └── route.ts         # Guided assignment API
    ├── graph/
    │   └── [unitId]/
    │       ├── route.ts         # Graph data API
    │       └── layout/
    │           └── route.ts     # Graph layout persistence
    └── import/
        ├── analyze/
        │   └── route.ts         # File analysis API
        └── execute/
            └── route.ts         # Import execution API
```

**Routing Principles:**

1. **File-Based Routing:** Leverage Next.js conventions for intuitive navigation
2. **Route Groups:** Organize related routes without affecting URL structure
3. **Nested Layouts:** Provide appropriate context and navigation for each section
4. **Loading States:** Implement skeleton UIs for better perceived performance
5. **Error Boundaries:** Graceful error handling at appropriate route levels
6. **SEO Optimization:** Server-side rendering for public pages

### Protected Route Pattern

```typescript
// middleware.ts - Global route protection
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/forgot-password', '/'];
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users to login
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based route protection
    const adminRoutes = ['/settings/system', '/settings/permissions'];
    const delegateRoutes = ['/members', '/companionships', '/graph'];
    
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (!token.roles?.includes('admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    if (delegateRoutes.some(route => pathname.startsWith(route))) {
      if (!token.roles?.some(role => ['admin', 'delegate'].includes(role))) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

// Layout-level permission checking
// apps/web/src/app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Navigation } from '@/components/layout/Navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { PermissionProvider } from '@/components/providers/PermissionProvider';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Server-side authentication check
  if (!session?.user) {
    redirect('/login');
  }

  // Server-side permission check for dashboard access
  const hasMinimumAccess = session.user.roles?.some(role => 
    ['admin', 'delegate', 'supervisor'].includes(role)
  );

  if (!hasMinimumAccess) {
    redirect('/unauthorized');
  }

  return (
    <PermissionProvider session={session}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navigation />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </PermissionProvider>
  );
}

// Page-level permission component
// components/auth/ProtectedPage.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedPageProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackUrl?: string;
}

export function ProtectedPage({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackUrl = '/dashboard'
}: ProtectedPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.push('/login');
      return;
    }

    // Check role requirements
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role =>
        session.user.roles?.includes(role)
      );
      if (!hasRequiredRole) {
        router.push(fallbackUrl);
        return;
      }
    }

    // Check permission requirements
    if (requiredPermissions.length > 0) {
      const hasRequiredPermission = requiredPermissions.every(permission =>
        session.user.permissions?.includes(permission)
      );
      if (!hasRequiredPermission) {
        router.push(fallbackUrl);
        return;
      }
    }
  }, [session, status, router, requiredRoles, requiredPermissions, fallbackUrl]);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

// Usage in pages that need specific permissions
// app/(dashboard)/settings/system/page.tsx
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { SystemSettings } from '@/components/settings/SystemSettings';

export default function SystemSettingsPage() {
  return (
    <ProtectedPage 
      requiredRoles={['admin']}
      fallbackUrl="/dashboard"
    >
      <SystemSettings />
    </ProtectedPage>
  );
}

// Dynamic route with permission checking
// app/(dashboard)/members/[id]/edit/page.tsx
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { memberService } from '@/lib/api/memberService';
import { EditMemberForm } from '@/components/forms/EditMemberForm';

interface Props {
  params: { id: string };
}

export default async function EditMemberPage({ params }: Props) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  // Check if user can edit members
  const canEditMembers = session.user.permissions?.includes('edit_members') ||
                         session.user.roles?.includes('admin');
  
  if (!canEditMembers) {
    redirect('/members');
  }

  // Fetch member data server-side
  try {
    const member = await memberService.getMember(params.id);
    
    // Additional permission check: can user edit this specific member?
    const canEditThisMember = session.user.roles?.includes('admin') ||
                             member.geographicUnitId === session.user.geographicUnitId;
    
    if (!canEditThisMember) {
      redirect('/members');
    }

    return <EditMemberForm member={member} />;
  } catch (error) {
    notFound();
  }
}
```

**Routing Pattern Features:**

1. **Multi-Level Protection:** Middleware → Layout → Page → Component level security
2. **Role-Based Access:** Different routes for different user roles
3. **Permission Granularity:** Fine-grained permission checking at component level
4. **Server-Side Validation:** Authentication and authorization on the server
5. **Graceful Redirects:** Appropriate fallback URLs for unauthorized access
6. **SEO Friendly:** Server-side rendering with proper meta tags and redirects

## Frontend Services Layer

Our frontend services layer provides a clean abstraction between React components and backend APIs, implementing type-safe communication, error handling, caching strategies, and optimistic updates.

### API Client Setup

```typescript
// lib/api/client.ts - Base API client configuration
import { QueryClient } from '@tanstack/react-query';
import { ApiError, ApiResponse } from '@/packages/shared-types';

// Global query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error instanceof ApiError && error.status === 401) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

// Base API client with interceptors
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Default headers
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Merge headers
    const headers = {
      ...defaultHeaders,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for auth
      });

      // Handle non-JSON responses (like file downloads)
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        // Try to parse error response
        let errorData: ApiError;
        if (contentType?.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorData = {
            status: response.status,
            message: response.statusText,
            code: 'HTTP_ERROR',
          };
        }
        throw new ApiError(errorData.message, errorData.status, errorData.code);
      }

      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }

      // Parse JSON response
      if (contentType?.includes('application/json')) {
        const data: ApiResponse<T> = await response.json();
        return data.data || data as T;
      }

      // Return response as-is for non-JSON content
      return response as unknown as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        'Network error or server unavailable',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    
    return this.request<T>(url, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // File upload with progress tracking
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.data || response);
          } catch {
            resolve(xhr.responseText as T);
          }
        } else {
          reject(new ApiError(xhr.statusText, xhr.status, 'UPLOAD_ERROR'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new ApiError('Upload failed', 0, 'NETWORK_ERROR'));
      });

      xhr.open('POST', `${this.baseURL}${endpoint}`);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.withCredentials = true;
      xhr.send(formData);
    });
  }
}

export const apiClient = new ApiClient();

// Custom error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### Service Example

```typescript
// lib/api/memberService.ts - Complete member service implementation
import { apiClient } from './client';
import { queryKeys } from './queryKeys';
import {
  Member,
  CreateMemberRequest,
  UpdateMemberRequest,
  MemberFilters,
  PaginatedResponse,
  Role,
  RoleAssignment,
} from '@/packages/shared-types';

export const memberService = {
  // ===============================
  // Query Functions (for TanStack Query)
  // ===============================

  // Get paginated member list with filters
  getMembers: async (
    unitId: string,
    filters: MemberFilters = {},
    page = 1,
    limit = 50
  ): Promise<PaginatedResponse<Member>> => {
    return apiClient.get<PaginatedResponse<Member>>('/members', {
      unitId,
      page,
      limit,
      ...filters,
    });
  },

  // Get single member by ID
  getMember: async (id: string): Promise<Member> => {
    return apiClient.get<Member>(`/members/${id}`);
  },

  // Get member roles and permissions
  getMemberRoles: async (memberId: string): Promise<RoleAssignment[]> => {
    return apiClient.get<RoleAssignment[]>(`/members/${memberId}/roles`);
  },

  // Get eligible companions for a member
  getEligibleCompanions: async (memberId: string): Promise<{
    perfectMatches: Member[];
    softViolations: Array<{ member: Member; violations: string[] }>;
  }> => {
    return apiClient.get(`/members/${memberId}/eligible-companions`);
  },

  // Search members with full-text search
  searchMembers: async (
    query: string,
    unitId?: string,
    limit = 20
  ): Promise<Member[]> => {
    return apiClient.get<Member[]>('/members/search', {
      q: query,
      unitId,
      limit,
    });
  },

  // ===============================
  // Mutation Functions
  // ===============================

  // Create new member
  createMember: async (data: CreateMemberRequest): Promise<Member> => {
    return apiClient.post<Member>('/members', data);
  },

  // Update existing member
  updateMember: async (
    id: string,
    data: UpdateMemberRequest
  ): Promise<Member> => {
    return apiClient.put<Member>(`/members/${id}`, data);
  },

  // Delete member (soft delete)
  deleteMember: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/members/${id}`);
  },

  // Assign role to member
  assignRole: async (
    memberId: string,
    roleId: string,
    scopeId: string
  ): Promise<RoleAssignment> => {
    return apiClient.post<RoleAssignment>(`/members/${memberId}/roles`, {
      roleId,
      scopeId,
    });
  },

  // Remove role from member
  removeRole: async (
    memberId: string,
    roleAssignmentId: string
  ): Promise<void> => {
    return apiClient.delete<void>(
      `/members/${memberId}/roles/${roleAssignmentId}`
    );
  },

  // Bulk import members from file
  importMembers: async (
    file: File,
    mappings: Record<string, string>,
    onProgress?: (progress: number) => void
  ): Promise<{
    successCount: number;
    errorCount: number;
    errors: Array<{ row: number; message: string }>;
  }> => {
    return apiClient.uploadFile(
      '/members/import',
      file,
      { mappings: JSON.stringify(mappings) },
      onProgress
    );
  },

  // Export members to CSV
  exportMembers: async (
    unitId: string,
    filters: MemberFilters = {}
  ): Promise<Blob> => {
    const response = await fetch('/api/members/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ unitId, filters }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },
};

// ===============================
// React Hook Wrappers
// ===============================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';

// Hook for fetching members with automatic caching
export function useMembers(
  unitId: string,
  filters: MemberFilters = {},
  options?: {
    page?: number;
    limit?: number;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: queryKeys.members.list({ unitId, ...filters }),
    queryFn: () =>
      memberService.getMembers(
        unitId,
        filters,
        options?.page,
        options?.limit
      ),
    enabled: options?.enabled !== false,
    keepPreviousData: true, // For pagination
  });
}

// Hook for fetching single member
export function useMember(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.members.detail(id),
    queryFn: () => memberService.getMember(id),
    enabled: enabled && !!id,
  });
}

// Hook for member creation with optimistic updates
export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memberService.createMember,
    onMutate: async (newMember) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.members.lists() });

      // Snapshot the previous value
      const previousMembers = queryClient.getQueriesData({
        queryKey: queryKeys.members.lists(),
      });

      // Optimistically update member lists
      queryClient.setQueriesData<PaginatedResponse<Member>>(
        { queryKey: queryKeys.members.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: [{ ...newMember, id: `temp-${Date.now()}` } as Member, ...old.data],
            total: old.total + 1,
          };
        }
      );

      return { previousMembers };
    },
    onError: (err, newMember, context) => {
      // Rollback optimistic updates
      if (context?.previousMembers) {
        context.previousMembers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(`Failed to create member: ${err.message}`);
    },
    onSuccess: (member) => {
      // Invalidate and refetch member queries
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      toast.success('Member created successfully');
    },
  });
}

// Hook for member updates
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMemberRequest }) =>
      memberService.updateMember(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.members.detail(id) });

      const previousMember = queryClient.getQueryData(queryKeys.members.detail(id));

      // Optimistically update member
      queryClient.setQueryData(queryKeys.members.detail(id), (old: Member) => ({
        ...old,
        ...data,
      }));

      return { previousMember };
    },
    onError: (err, { id }, context) => {
      if (context?.previousMember) {
        queryClient.setQueryData(queryKeys.members.detail(id), context.previousMember);
      }
      toast.error(`Failed to update member: ${err.message}`);
    },
    onSuccess: (updatedMember, { id }) => {
      // Update the specific member in cache
      queryClient.setQueryData(queryKeys.members.detail(id), updatedMember);
      // Invalidate member lists to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.members.lists() });
      toast.success('Member updated successfully');
    },
  });
}

// Hook for role assignment
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      roleId,
      scopeId,
    }: {
      memberId: string;
      roleId: string;
      scopeId: string;
    }) => memberService.assignRole(memberId, roleId, scopeId),
    onSuccess: (roleAssignment, { memberId }) => {
      // Invalidate member roles
      queryClient.invalidateQueries({
        queryKey: queryKeys.members.roles(memberId),
      });
      // Invalidate member details to refresh permissions
      queryClient.invalidateQueries({
        queryKey: queryKeys.members.detail(memberId),
      });
      toast.success('Role assigned successfully');
    },
    onError: (err) => {
      toast.error(`Failed to assign role: ${err.message}`);
    },
  });
}

// Hook for member search with debouncing
export function useMemberSearch(query: string, unitId?: string) {
  return useQuery({
    queryKey: queryKeys.members.search(query, unitId),
    queryFn: () => memberService.searchMembers(query, unitId),
    enabled: query.length >= 2, // Only search with 2+ characters
    staleTime: 30 * 1000, // 30 seconds for search results
  });
}
```

**Service Layer Features:**

1. **Type-Safe Communication:** Full TypeScript integration with shared interfaces
2. **Error Handling:** Comprehensive error handling with user-friendly messages
3. **Optimistic Updates:** Immediate UI feedback with automatic rollback on failure
4. **File Upload Support:** Progress tracking and error handling for large files
5. **Caching Strategy:** Intelligent cache invalidation and background refetching
6. **Request Deduplication:** Automatic deduplication of identical requests
7. **Offline Support:** Cache persistence and retry mechanisms
8. **Performance Optimization:** Pagination, search debouncing, and selective updates

**Integration Patterns:**

- **React Hook Wrappers:** Custom hooks that encapsulate common query and mutation patterns
- **Cache Management:** Sophisticated cache invalidation strategies based on data relationships
- **State Synchronization:** Automatic UI updates when server state changes
- **Error Recovery:** Graceful handling of network failures and server errors
- **Background Sync:** Automatic data refetching and cache updates

-----
