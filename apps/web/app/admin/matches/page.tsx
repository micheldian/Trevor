'use client';

import { GitMerge, Download, Filter, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { TableCard } from '@/components/admin/TableCard';
import { Badge } from '@/components/admin/Badge';
import { Button } from '@/components/admin/Button';

/**
 * Matches Page
 *
 * Manage all matches with:
 * - Match listings
 * - Status tracking
 * - Confirmation management
 */
export default function MatchesPage() {
  // Mock data
  const matches = [
    {
      id: '1',
      job: 'Grape Harvest',
      worker: 'Jean Dupont',
      employer: 'Domaine Dupont',
      date: '2024-09-15',
      status: 'confirmed',
      matchScore: 95,
      createdAt: '2024-09-01',
    },
    {
      id: '2',
      job: 'Corn Planting',
      worker: 'Équipe Martin (8)',
      employer: 'Ferme Martin',
      date: '2024-04-10',
      status: 'pending',
      matchScore: 87,
      createdAt: '2024-04-01',
    },
    {
      id: '3',
      job: 'Wheat Harvest',
      worker: 'Pierre Bernard',
      employer: 'Exploitation Bernard',
      date: '2024-07-20',
      status: 'completed',
      matchScore: 92,
      createdAt: '2024-07-10',
    },
    {
      id: '4',
      job: 'Irrigation Setup',
      worker: 'Sophie Martin',
      employer: 'Agri Services',
      date: '2024-05-05',
      status: 'cancelled',
      matchScore: 78,
      createdAt: '2024-05-01',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="info">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div>
      <PageHeader
        title="Matches"
        description="Manage all job-worker matches"
        actions={
          <Button variant="secondary" icon={Download}>
            Export
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <input
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Start date"
        />
      </div>

      {/* Matches Table */}
      <TableCard title={`${matches.length} Matches`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Job
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Worker
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Employer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Match Score
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
            {matches.map((match) => (
              <tr key={match.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {match.job}
                  </div>
                  <div className="text-xs text-gray-500">
                    Created {new Date(match.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {match.worker}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {match.employer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(match.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`text-sm font-semibold ${getScoreColor(match.matchScore)}`}
                  >
                    {match.matchScore}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(match.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
