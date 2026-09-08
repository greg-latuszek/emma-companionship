# Security and Performance

This section defines security and performance considerations for the fullstack application, establishing MANDATORY requirements for AI and human developers with implementation-specific rules that directly impact code generation and development patterns.

## Security Requirements

### Frontend Security

- **CSP Headers:** Content Security Policy with strict directives: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'`
- **XSS Prevention:** React's built-in XSS protection, sanitization of user inputs with DOMPurify, Content Security Policy enforcement, and strict TypeScript typing to prevent injection attacks
- **Secure Storage:** 
  - Sensitive data stored in HTTP-only, secure, same-site cookies
  - Non-sensitive UI state in sessionStorage/localStorage with encryption for PII
  - JWT tokens stored in HTTP-only cookies, never localStorage
  - Client-side encryption for any cached sensitive data using Web Crypto API

### Backend Security

- **Input Validation:** Zod schema validation at API boundary before any business logic processing, whitelist approach preferred over blacklist, custom error messages for validation failures
- **Rate Limiting:** Per-user/IP rate limiting (100 requests/minute for authenticated users, 20 requests/minute for anonymous), exponential backoff for abuse detection, separate limits for different endpoint categories
- **CORS Policy:** Strict CORS configuration allowing only official frontend domain origins (`emma-companionship.vercel.app` for production, `localhost:3000` for development), credentials support enabled, preflight caching configured

### Authentication Security

- **Token Storage:** JWT tokens in HTTP-only, secure, same-site cookies with configurable expiration, automatic token refresh with sliding expiration
- **Session Management:** Auth.js (NextAuth) session management with secure session cookies, session invalidation on logout, concurrent session limits per user
- **Password Policy:** Minimum 8 characters with complexity requirements, Argon2 hashing algorithm for password storage, password rotation recommendations, account lockout after failed attempts

### Enhanced Security Measures

**Secrets Management:**
- Development: Environment variables in `.env.local` files (never committed to version control)
- Production: Vercel environment variables with encrypted storage
- Access via type-safe configuration service only, no secrets in logs or error messages

**Data Protection:**
- Encryption at Rest: Database encryption using Vercel Postgres built-in encryption
- Encryption in Transit: TLS 1.3 for all API communications, encrypted database connections
- PII Handling: Minimal PII collection, data anonymization for non-production environments

**Security Testing & Monitoring:**
- SAST: ESLint security rules and SonarJS for static analysis
- DAST: Playwright security tests for authentication flows and input validation
- Dependency Security: npm audit and Dependabot for vulnerability scanning
- Penetration Testing: Annual third-party security assessment for production system

## Performance Optimization

### Frontend Performance

- **Bundle Size Target:** Main bundle under 250KB gzipped, lazy-loaded route chunks under 100KB each, total initial page load under 500KB
- **Loading Strategy:** 
  - Next.js App Router Server Components by default to minimize client-side JavaScript
  - Progressive loading with React.lazy() for heavy components
  - Critical resource prioritization with Next.js built-in optimizations
- **Caching Strategy:** 
  - TanStack Query for intelligent client-side caching with 5-minute stale time for static data
  - Browser caching with proper ETags and cache headers
  - Service Worker caching for offline-first experience (future enhancement)

### Backend Performance

- **Response Time Target:** P95 (95th percentile) API response time under 200ms for typical read operations, P99 under 500ms for complex queries
- **Database Optimization:** 
  - Indexes on all foreign key columns and frequently queried fields
  - Query optimization with proper JOIN strategies and result pagination
  - Connection pooling with Prisma for efficient concurrent request handling
- **Caching Strategy:** 
  - Multi-layer caching: CDN (Vercel Edge), application-level (Redis future), database query caching
  - Cache invalidation strategies for real-time data updates
  - Edge computing with Vercel Edge Functions for geographically distributed computation

### Infrastructure Performance Enhancements

- **CDN Optimization:** Static assets served from Vercel's global Content Delivery Network with optimized caching headers
- **Monitoring & Alerting:** Performance monitoring with Core Web Vitals tracking, automated alerting for performance degradation
- **Graph-Specific Optimizations:** Progressive loading and virtualization for large relationship graphs, debounced filtering, client-side optimization for interactive visualizations

-----
