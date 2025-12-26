'use client';

import { useState } from 'react';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

/**
 * Admin Header
 *
 * Top header for admin pages with:
 * - Search bar
 * - Notifications
 * - User menu with logout
 */
export function AdminHeader() {
  const { user, logout } = useAdminAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userInitial = user?.email?.[0]?.toUpperCase() ||
                      user?.phone?.[0] ||
                      'A';

  const userDisplay = user?.email || user?.phone || 'Admin';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="px-4 lg:px-8 h-16 flex items-center justify-between">
        {/* Left side - Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4 ml-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-green-700">
                  {userInitial}
                </span>
              </div>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-green-700">
                          {userInitial}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {userDisplay}
                        </p>
                        <p className="text-xs text-gray-500">Admin</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={logout}
                      className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
