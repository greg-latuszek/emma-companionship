import { APP_CONSTANTS } from '@emma/config';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to {APP_CONSTANTS.APP_NAME}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Community relationship modeling and management platform
        </p>
        
        {/* Authentication Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-2">
            👤 Authentication Status
          </h2>
          {session?.user ? (
            <div className="text-green-700">
              <p className="font-medium">Signed in as: {session.user.name || session.user.email}</p>
              <p className="text-sm mt-1">Welcome back!</p>
            </div>
          ) : (
            <div className="text-green-700">
              <p>Not authenticated</p>
              <p className="text-sm mt-1">Sign in to access all features</p>
            </div>
          )}
        </div>
        
        {/* Application Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            🚀 Application Status
          </h2>
          <p className="text-blue-700">
            Application successfully initialized and running!
          </p>
          <p className="text-sm text-blue-600 mt-2">
            Version: {APP_CONSTANTS.VERSION}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <div className="flex justify-center space-x-4">
            <a
              href="/api/health"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Check Health Status
            </a>
            
            {session?.user ? (
              <a
                href="/api/auth/signout"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </a>
            ) : (
              <a
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
