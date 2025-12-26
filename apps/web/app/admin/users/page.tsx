'use client';

import { useState } from 'react';
import { UserPlus, Download, Filter, MoreVertical, Shield } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { TableCard } from '@/components/admin/TableCard';
import { Badge } from '@/components/admin/Badge';
import { Button } from '@/components/admin/Button';

/**
 * Users Page
 *
 * Manage platform users with:
 * - User list with filters
 * - Role management
 * - Account status
 * - Actions (suspend, verify, etc.)
 */
export default function UsersPage() {
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Mock data - replace with real API calls
  const users = [
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33 6 12 34 56 78',
      role: 'worker',
      status: 'active',
      verified: true,
      createdAt: '2024-01-15',
      missions: 23,
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie.martin@email.com',
      phone: '+33 6 23 45 67 89',
      role: 'employer',
      status: 'active',
      verified: true,
      createdAt: '2024-02-20',
      missions: 12,
    },
    {
      id: '3',
      name: 'Pierre Dubois',
      email: 'pierre.dubois@email.com',
      phone: '+33 6 34 56 78 90',
      role: 'team_lead',
      status: 'active',
      verified: false,
      createdAt: '2024-03-10',
      missions: 8,
    },
    {
      id: '4',
      name: 'Sophie Bernard',
      email: 'sophie.bernard@email.com',
      phone: '+33 6 45 67 89 01',
      role: 'worker',
      status: 'suspended',
      verified: true,
      createdAt: '2024-01-05',
      missions: 15,
    },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="error">{role}</Badge>;
      case 'employer':
        return <Badge variant="info">{role}</Badge>;
      case 'team_lead':
        return <Badge variant="warning">{role}</Badge>;
      default:
        return <Badge variant="neutral">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="success">Active</Badge>
    ) : (
      <Badge variant="error">Suspended</Badge>
    );
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage all platform users and their roles"
        actions={
          <>
            <Button variant="secondary" icon={Download}>
              Export
            </Button>
            <Button variant="primary" icon={UserPlus}>
              Add User
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Roles</option>
            <option value="worker">Worker</option>
            <option value="team_lead">Team Lead</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>

        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="all">All Verification</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {/* Users Table */}
      <TableCard title={`${users.length} Users`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Missions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-green-700">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      {user.verified && (
                        <div className="text-xs text-green-600 flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-xs text-gray-500">{user.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.missions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
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
