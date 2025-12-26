'use client';

import { Shield, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { TableCard } from '@/components/admin/TableCard';
import { Badge } from '@/components/admin/Badge';
import { Button } from '@/components/admin/Button';

/**
 * Security Page
 *
 * Manage security settings with:
 * - Locked IP addresses
 * - Failed login attempts
 * - IP statistics
 * - Manual unlock
 */
export default function SecurityPage() {
  // Mock data
  const lockedIps = [
    {
      ip: '192.168.1.105',
      failedAttempts: 5,
      lockedAt: '2024-09-25 14:30:00',
      unlockAt: '2024-09-25 15:00:00',
      remainingMinutes: 15,
    },
    {
      ip: '10.0.0.42',
      failedAttempts: 7,
      lockedAt: '2024-09-25 13:45:00',
      unlockAt: '2024-09-25 14:15:00',
      remainingMinutes: 0,
    },
  ];

  const recentAttempts = [
    {
      id: '1',
      ip: '192.168.1.105',
      attempts: 3,
      lastAttempt: '2024-09-25 14:28:00',
      status: 'monitoring',
    },
    {
      id: '2',
      ip: '172.16.0.10',
      attempts: 2,
      lastAttempt: '2024-09-25 14:15:00',
      status: 'normal',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Security"
        description="Monitor and manage platform security"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Locked IPs</p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {lockedIps.length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Failed Attempts (24h)
              </p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">12</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Score</p>
              <p className="mt-2 text-3xl font-bold text-green-600">98%</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Locked IPs */}
      <div className="mb-8">
        <TableCard
          title="Locked IP Addresses"
          description="IP addresses currently blocked due to suspicious activity"
        >
          {lockedIps.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Failed Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Locked At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time Remaining
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lockedIps.map((ip) => (
                  <tr key={ip.ip} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {ip.ip}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="error">{ip.failedAttempts} attempts</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ip.lockedAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ip.remainingMinutes > 0
                        ? `${ip.remainingMinutes} minutes`
                        : 'Unlocking...'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button variant="ghost" size="sm" icon={Unlock}>
                        Unlock
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Lock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No locked IP addresses</p>
            </div>
          )}
        </TableCard>
      </div>

      {/* Recent Failed Attempts */}
      <TableCard
        title="Recent Failed Attempts"
        description="IPs with failed login attempts in the last 24 hours"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Attempts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Last Attempt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentAttempts.map((attempt) => (
              <tr key={attempt.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono font-medium text-gray-900">
                    {attempt.ip}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {attempt.attempts}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {attempt.lastAttempt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {attempt.status === 'monitoring' ? (
                    <Badge variant="warning">Monitoring</Badge>
                  ) : (
                    <Badge variant="success">Normal</Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
