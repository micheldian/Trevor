'use client';

import { Star, Download, Filter, MoreVertical, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { TableCard } from '@/components/admin/TableCard';
import { Badge } from '@/components/admin/Badge';
import { Button } from '@/components/admin/Button';

/**
 * Reviews Page
 *
 * Manage all reviews with:
 * - Review listings
 * - Rating distribution
 * - Moderation tools
 */
export default function ReviewsPage() {
  // Mock data
  const reviews = [
    {
      id: '1',
      reviewer: 'Jean Dupont',
      reviewee: 'Domaine Martin',
      rating: 5,
      comment: 'Excellent employer, fair pay and good working conditions.',
      job: 'Grape Harvest',
      date: '2024-09-20',
      status: 'published',
      helpful: 12,
    },
    {
      id: '2',
      reviewer: 'Ferme Bernard',
      reviewee: 'Équipe Dupont',
      rating: 4,
      comment: 'Good team, efficient work but arrived 30min late.',
      job: 'Wheat Harvest',
      date: '2024-07-25',
      status: 'published',
      helpful: 8,
    },
    {
      id: '3',
      reviewer: 'Marie Martin',
      reviewee: 'Agri Services',
      rating: 2,
      comment: 'Poor communication and payment delays.',
      job: 'Irrigation Setup',
      date: '2024-05-10',
      status: 'flagged',
      helpful: 3,
    },
    {
      id: '4',
      reviewer: 'Pierre Dubois',
      reviewee: 'Sophie Bernard',
      rating: 5,
      comment: 'Very professional and hardworking.',
      job: 'Corn Planting',
      date: '2024-04-15',
      status: 'published',
      helpful: 15,
    },
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'flagged' ? (
      <Badge variant="warning">Flagged</Badge>
    ) : (
      <Badge variant="success">Published</Badge>
    );
  };

  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Manage platform reviews and ratings"
        actions={
          <Button variant="secondary" icon={Download}>
            Export
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Total Reviews</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {reviews.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Avg Rating</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">4.0</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Flagged</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">1</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">This Month</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {reviews.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="all">All Reviews</option>
            <option value="published">Published</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Reviews Table */}
      <TableCard title={`${reviews.length} Reviews`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                From / To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Comment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Job
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
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
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {review.reviewer}
                  </div>
                  <div className="text-xs text-gray-500">→ {review.reviewee}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {renderStars(review.rating)}
                    <span className="text-sm font-medium text-gray-900">
                      {review.rating}.0
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <p className="text-sm text-gray-900 line-clamp-2">
                    {review.comment}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {review.helpful} found helpful
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {review.job}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(review.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(review.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="p-2 hover:bg-red-50 rounded-lg text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
