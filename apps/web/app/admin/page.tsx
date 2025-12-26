'use client';

import { Users, Briefcase, GitMerge, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatsCard } from '@/components/admin/StatsCard';
import { TableCard } from '@/components/admin/TableCard';
import { Badge } from '@/components/admin/Badge';

/**
 * Admin Dashboard
 *
 * Overview page with:
 * - Platform statistics
 * - Recent activity
 * - Quick actions
 */
export default function AdminDashboard() {
  // Mock data - replace with real API calls
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: { value: '+12.5% this month', trend: 'up' as const },
      icon: Users,
    },
    {
      title: 'Active Jobs',
      value: '342',
      change: { value: '+8.2% this week', trend: 'up' as const },
      icon: Briefcase,
    },
    {
      title: 'Matches Today',
      value: '89',
      change: { value: '-3.1% vs yesterday', trend: 'down' as const },
      icon: GitMerge,
    },
    {
      title: 'Avg Rating',
      value: '4.7',
      change: { value: '+0.2 this month', trend: 'up' as const },
      icon: Star,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: 'Jean Dupont',
      action: 'Created new job',
      job: 'Harvest - Grapes',
      time: '5 min ago',
      status: 'success',
    },
    {
      id: 2,
      user: 'Marie Martin',
      action: 'Match confirmed',
      job: 'Planting - Corn',
      time: '12 min ago',
      status: 'success',
    },
    {
      id: 3,
      user: 'Pierre Dubois',
      action: 'Review submitted',
      job: 'Harvest - Wheat',
      time: '28 min ago',
      status: 'info',
    },
    {
      id: 4,
      user: 'Sophie Bernard',
      action: 'Job cancelled',
      job: 'Irrigation - Vegetables',
      time: '1 hour ago',
      status: 'warning',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome to Trevor admin console. Here's what's happening on your platform."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Table */}
        <TableCard
          title="Recent Activity"
          description="Latest actions on the platform"
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {activity.user}
                      </div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{activity.action}</div>
                    <div className="text-xs text-gray-500">{activity.job}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={
                        activity.status === 'success'
                          ? 'success'
                          : activity.status === 'warning'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {activity.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        {/* Quick Stats */}
        <TableCard title="Platform Health" description="System metrics">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Server Status</p>
                <p className="text-xs text-gray-500">All systems operational</p>
              </div>
              <Badge variant="success">Online</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Database</p>
                <p className="text-xs text-gray-500">Response time: 45ms</p>
              </div>
              <Badge variant="success">Healthy</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API</p>
                <p className="text-xs text-gray-500">Uptime: 99.9%</p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Background Jobs</p>
                <p className="text-xs text-gray-500">12 pending</p>
              </div>
              <Badge variant="info">Processing</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage</p>
                <p className="text-xs text-gray-500">45% used (2.3 GB)</p>
              </div>
              <Badge variant="success">OK</Badge>
            </div>
          </div>
        </TableCard>
      </div>
    </div>
  );
}
