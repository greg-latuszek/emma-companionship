import Link from 'next/link';

import { APP_CONSTANTS } from '@emma/config';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Welcome to {APP_CONSTANTS.APP_NAME}
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Community relationship modeling and management platform
        </p>

        {/* Authentication Status */}
        <div className="mx-auto mb-6 max-w-md rounded-lg border border-green-200 bg-green-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-green-900">
            👤 Authentication Status
          </h2>
          {session?.user ? (
            <div className="text-green-700">
              <p className="font-medium">
                Signed in as: {session.user.name || session.user.email}
              </p>
              <p className="mt-1 text-sm">Welcome back!</p>
            </div>
          ) : (
            <div className="text-green-700">
              <p>Not authenticated</p>
              <p className="mt-1 text-sm">Sign in to access all features</p>
            </div>
          )}
        </div>

        {/* Application Status */}
        <div className="mx-auto max-w-md rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-blue-900">
            🚀 Application Status
          </h2>
          <p className="text-blue-700">
            Application successfully initialized and running!
          </p>
          <p className="mt-2 text-sm text-blue-600">
            Version: {APP_CONSTANTS.VERSION}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <div className="flex justify-center space-x-4">
            <a
              href="/api/health"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Check Health Status
            </a>

            {session?.user ? (
              <Link
                href="/api/auth/signout"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign Out
              </Link>
            ) : (
              <a
                href="/auth/signin"
                className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
