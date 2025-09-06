#!/bin/bash

# Emma Companionship Deployment Script
# This script handles local deployment testing and validation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_APP_DIR="$PROJECT_ROOT/apps/web"

echo -e "${GREEN}🚀 Emma Companionship Deployment Script${NC}"
echo "================================================="

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
    print_error "Must be run from the project root directory"
    exit 1
fi

print_status "Starting deployment preparation..."

# 1. Install dependencies
print_status "Installing dependencies..."
pnpm install --frozen-lockfile

# 2. Run linting and formatting
print_status "Running code quality checks..."
pnpm lint || {
    print_error "Linting failed. Please fix linting errors before deployment."
    exit 1
}

pnpm format:check || {
    print_warning "Code formatting issues detected. Running auto-fix..."
    pnpm format
}

# 3. Type checking
print_status "Running type checks..."
pnpm type-check || {
    print_error "Type checking failed. Please fix TypeScript errors before deployment."
    exit 1
}

# 4. Run tests
print_status "Running tests..."
pnpm test || {
    print_error "Tests failed. Please fix test failures before deployment."
    exit 1
}

# 5. Build the application
print_status "Building application..."
pnpm build || {
    print_error "Build failed. Please fix build errors before deployment."
    exit 1
}

# 6. Database checks (optional - only if DATABASE_URL is set)
if [[ -n "${DATABASE_URL}" ]]; then
    print_status "Checking database connectivity..."
    pnpm db:generate
    print_status "Database schema validated"
fi

# 7. Health check (if running locally)
if command -v curl &> /dev/null; then
    print_status "Starting application for health check..."
    pnpm dev &
    APP_PID=$!
    
    # Wait for the app to start
    sleep 10
    
    # Health check
    if curl -f http://localhost:3000/api/health; then
        print_status "Health check passed"
    else
        print_error "Health check failed"
        kill $APP_PID 2>/dev/null
        exit 1
    fi
    
    # Clean up
    kill $APP_PID 2>/dev/null
    sleep 2
fi

print_status "All deployment checks passed!"
echo ""
echo -e "${GREEN}🎉 Ready for deployment!${NC}"
echo ""
echo "Next steps:"
echo "- Push to main branch for production deployment"
echo "- Create PR for preview deployment"
echo "- Monitor deployment in GitHub Actions"

# Optional: Show deployment commands
echo ""
echo "Manual deployment commands:"
echo "  Production: vercel --prod"
echo "  Preview:    vercel"
