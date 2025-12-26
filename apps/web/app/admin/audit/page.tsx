'use client';

import { FileText, Download, Filter, Search } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { TableCard } from '@/components/admin/TableCard';
import { Badge } from '@/components/admin/Badge';
import { Button } from '@/components/admin/Button';

/**
 * Audit Logs Page
 *
 * View and filter audit logs with:
 * - Action history
 * - Actor tracking
 * - Entity changes
 * - IP and user agent info
 */
export default function AuditLogsPage() {
  // Mock data
  const logs = [
    {
      id: '1',
      actor: 'Admin User',
      action: 'user.suspended',
      entity: 'User: Jean Dupont',
      ip: '192.168.1.100',
      timestamp: '2024-09-25 14:32:15',
      status: 'success',
      details: 'Suspended for 7 days - reason: violation',
    },
    {
      id: '2',
      actor: 'Admin User',
      action: 'user.role_changed',
      entity: 'User: Marie Martin',
      ip: '192.168.1.100',
      timestamp: '2024-09-25 13:15:42',
      status: 'success',
      details: 'Changed role from worker to team_lead',
    },
    {
      id: '3',
      actor: 'Admin User',
      action: 'review.deleted',
      entity: 'Review: #12345',
      ip: '192.168.1.100',
      timestamp: '2024-09-25 11:20:33',
      status: 'success',
      details: 'Deleted flagged review - spam content',
    },
    {
      id: '4',
      actor: 'Admin User',
      action: 'job.cancelled',
      entity: 'Job: Grape Harvest',
      ip: '192.168.1.100',
      timestamp: '2024-09-25 10:05:12',
      status: 'success',
      details: 'Cancelled by admin request',
    },
    {
      id: '5',
      actor: 'System',
      action: 'match.auto_confirmed',
      entity: 'Match: #789',
      ip: 'system',
      timestamp: '2024-09-25 09:00:00',
      status: 'success',
      details: 'Auto-confirmed after 24h',
    },
  ];

  const getActionBadge = (action: string) => {
    if (action.includes('deleted') || action.includes('suspended')) {
      return <Badge variant="error">{action}</Badge>;
    }
    if (action.includes('created') || action.includes('confirmed')) {
      return <Badge variant="success">{action}</Badge>;
    }
    if (action.includes('changed') || action.includes('updated')) {
      return <Badge variant="warning">{action}</Badge>;
    }
    return <Badge variant="info">{action}</Badge>;
  };

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Track all administrative actions and system events"
        actions={
          <Button variant="secondary" icon={Download}>
            Export Logs
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="all">All Actions</option>
          <option value="user">User Actions</option>
          <option value="job">Job Actions</option>
          <option value="review">Review Actions</option>
          <option value="match">Match Actions</option>
        </select>

        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="all">All Actors</option>
          <option value="admin">Admin Only</option>
          <option value="system">System Only</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <TableCard title={`${logs.length} Log Entries`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Entity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                IP Address
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.timestamp}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-green-700">
                        {log.actor.charAt(0)}
                      </span>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {log.actor}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getActionBadge(log.action)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.entity}
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <p className="text-sm text-gray-500 truncate">{log.details}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                  {log.ip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
