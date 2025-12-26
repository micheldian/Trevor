'use client';

import { Briefcase, Download, Filter, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { TableCard } from '@/components/admin/TableCard';
import { Badge } from '@/components/admin/Badge';
import { Button } from '@/components/admin/Button';

/**
 * Jobs Page
 *
 * Manage all jobs with:
 * - Job listings
 * - Status management
 * - Filter by status, culture, date
 */
export default function JobsPage() {
  // Mock data
  const jobs = [
    {
      id: '1',
      title: 'Grape Harvest',
      employer: 'Domaine Dupont',
      culture: 'Grapes',
      workers: 5,
      date: '2024-09-15',
      status: 'published',
      budget: '€1,200',
      matches: 12,
    },
    {
      id: '2',
      title: 'Corn Planting',
      employer: 'Ferme Martin',
      culture: 'Corn',
      workers: 8,
      date: '2024-04-10',
      status: 'in_progress',
      budget: '€2,500',
      matches: 8,
    },
    {
      id: '3',
      title: 'Wheat Harvest',
      employer: 'Exploitation Bernard',
      culture: 'Wheat',
      workers: 10,
      date: '2024-07-20',
      status: 'completed',
      budget: '€3,000',
      matches: 10,
    },
    {
      id: '4',
      title: 'Irrigation Setup',
      employer: 'Agri Services',
      culture: 'Vegetables',
      workers: 3,
      date: '2024-05-05',
      status: 'cancelled',
      budget: '€800',
      matches: 4,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="info">Published</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">Draft</Badge>;
    }
  };

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="Manage all job postings on the platform"
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
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="all">All Cultures</option>
          <option value="grapes">Grapes</option>
          <option value="wheat">Wheat</option>
          <option value="corn">Corn</option>
          <option value="vegetables">Vegetables</option>
        </select>

        <input
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Jobs Table */}
      <TableCard title={`${jobs.length} Jobs`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Job
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Employer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Workers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Matches
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
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {job.title}
                  </div>
                  <div className="text-xs text-gray-500">{job.culture}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {job.employer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {job.workers}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(job.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {job.budget}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {job.matches}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(job.status)}
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
