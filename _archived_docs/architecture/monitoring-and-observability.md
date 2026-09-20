# Monitoring and Observability

## Monitoring Stack

- **Frontend Monitoring:** Vercel Analytics for Core Web Vitals, page performance, and user interactions (POC). Future: Prometheus + Grafana dashboards
- **Backend Monitoring:** Vercel Function logs with structured JSON logging and correlationId tracing (POC). Future: Prometheus metrics collection
- **Error Tracking:** Integrated with correlationId system for cross-system error tracing via Vercel logs (POC). Future: Grafana error rate dashboards
- **Performance Monitoring:** Vercel built-in performance metrics and real-time function monitoring (POC). Future: Custom Prometheus/Grafana observability stack

## Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP, FID, CLS)
- JavaScript errors with correlationId tracking
- API response times from TanStack Query
- User interactions and page navigation

**Backend Metrics:**
- Request rate per API endpoint
- Error rate by error code and correlationId
- Response time (P95/P99) for API routes
- Database query performance via Prisma

**POC Note:** Currently leveraging Vercel's built-in analytics and monitoring. Post-POC expansion includes migration to Prometheus/Grafana stack for advanced observability, custom dashboards, and comprehensive alert management.

-----
