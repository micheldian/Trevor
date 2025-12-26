'use client';

import { UsersRound, Download, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { TableCard } from '@/components/admin/TableCard';
import { Badge } from '@/components/admin/Badge';
import { Button } from '@/components/admin/Button';

/**
 * Teams Page
 *
 * Manage team profiles with:
 * - Team list
 * - Member counts
 * - Performance metrics
 */
export default function TeamsPage() {
  // Mock data - replace with real API calls
  const teams = [
    {
      id: '1',
      name: 'Équipe Dupont',
      leader: 'Jean Dupont',
      members: 8,
      missions: 45,
      rating: 4.8,
      status: 'active',
      specialties: ['Harvest', 'Planting'],
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Les Agriculteurs Réunis',
      leader: 'Marie Martin',
      members: 12,
      missions: 67,
      rating: 4.6,
      status: 'active',
      specialties: ['Irrigation', 'Maintenance'],
      createdAt: '2024-02-10',
    },
    {
      id: '3',
      name: 'Team Bernard',
      leader: 'Pierre Bernard',
      members: 5,
      missions: 23,
      rating: 4.9,
      status: 'active',
      specialties: ['Harvest'],
      createdAt: '2024-03-05',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Teams"
        description="Manage team profiles and their members"
        actions={
          <Button variant="secondary" icon={Download}>
            Export
          </Button>
        }
      />

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-50">
                <UsersRound className="w-8 h-8 text-green-600" />
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {team.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">Led by {team.leader}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Members</span>
                <span className="font-medium text-gray-900">{team.members}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Missions</span>
                <span className="font-medium text-gray-900">{team.missions}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Rating</span>
                <span className="font-medium text-gray-900">⭐ {team.rating}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {team.specialties.map((specialty) => (
                <Badge key={specialty} variant="info" size="sm">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Teams Table */}
      <TableCard title="All Teams" description="Detailed team information">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Leader
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Members
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Missions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rating
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
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {team.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {team.specialties.join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {team.leader}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {team.members}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {team.missions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ⭐ {team.rating}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="success">Active</Badge>
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
