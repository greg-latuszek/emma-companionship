import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@emma/config';
import { checkDatabaseConnection, getDatabaseStats } from '@/lib/prisma';

/**
 * Health Check API Endpoint
 * Returns application health status and basic system information
 * 
 * @route GET /api/health
 * @returns {object} Health status object with timestamp, environment, and database status
 */
export async function GET(request: NextRequest) {
  try {
    const config = getConfig();
    const timestamp = new Date().toISOString();
    
    // Database connectivity check
    let databaseStatus = 'not_configured';
    let databaseStats = null;
    
    if (config.DATABASE_URL) {
      try {
        const isConnected = await checkDatabaseConnection();
        if (isConnected) {
          databaseStatus = 'connected';
          databaseStats = await getDatabaseStats();
        } else {
          databaseStatus = 'connection_failed';
        }
      } catch (error) {
        console.error('Database health check failed:', error);
        databaseStatus = 'error';
      }
    }
    
    const healthData = {
      status: 'ok',
      timestamp,
      environment: config.NODE_ENV,
      database: databaseStatus,
      version: '1.0.0',
      uptime: process.uptime(),
      services: {
        api: 'healthy',
        auth: 'configured', // Auth.js is now configured
        database: databaseStatus,
      },
      ...(databaseStats && { stats: databaseStats }),
    };
    
    return NextResponse.json(healthData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Health check endpoint error:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Internal server error during health check'
      },
      { status: 500 }
    );
  }
}
