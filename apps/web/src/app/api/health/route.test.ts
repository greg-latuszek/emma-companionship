import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock the @emma/config module
jest.mock('@emma/config', () => ({
  getConfig: () => ({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    NEXTAUTH_SECRET: 'test-secret',
    NEXTAUTH_URL: 'http://localhost:3000',
  }),
}));

describe('/api/health', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    // Mock NextRequest
    mockRequest = {
      method: 'GET',
      url: 'http://localhost:3000/api/health',
    } as NextRequest;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with health status', async () => {
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      status: 'ok',
      environment: 'test',
      database: 'configured',
      version: '1.0.0',
      services: expect.objectContaining({
        api: 'healthy',
        auth: 'not_configured',
      }),
    });
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should include proper no-cache headers', async () => {
    const response = await GET(mockRequest);
    
    expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
    expect(response.headers.get('Pragma')).toBe('no-cache');
    expect(response.headers.get('Expires')).toBe('0');
  });

  it('should handle errors gracefully', async () => {
    // Mock an error in the config function
    jest.doMock('@emma/config', () => ({
      getConfig: () => {
        throw new Error('Config error');
      },
    }));

    // Import the module again to get the mocked version
    const { GET: errorGET } = await import('./route');
    const response = await errorGET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toMatchObject({
      status: 'error',
      error: 'Internal server error during health check',
    });
    expect(data.timestamp).toBeDefined();
  });
});
