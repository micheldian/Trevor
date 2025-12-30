'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import JobCard from '@/components/jobs/JobCard';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    culture: '',
    dateType: '',
    isUrgent: false,
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const params: any = { status: 'published' };

      if (filters.culture) params.culture = filters.culture;
      if (filters.isUrgent) params.isUrgent = true;

      const data = await apiClient.getJobs(params);

      // Client-side filtering for search and city
      let filtered = data;

      if (filters.search) {
        filtered = filtered.filter((job: any) =>
          job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.description?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters.city) {
        filtered = filtered.filter((job: any) =>
          job.city?.toLowerCase().includes(filters.city.toLowerCase()) ||
          job.employer?.city?.toLowerCase().includes(filters.city.toLowerCase())
        );
      }

      if (filters.dateType) {
        filtered = filtered.filter((job: any) => job.dateType === filters.dateType);
      }

      setJobs(filtered);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      culture: '',
      dateType: '',
      isUrgent: false,
    });
  };

  useEffect(() => {
    loadJobs();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Missions disponibles</h1>
              <p className="text-gray-600 mt-1">
                Trouvez votre prochaine opportunité agricole
              </p>
            </div>
            <div className="text-sm text-gray-600">
              {jobs.length} mission{jobs.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre ou description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtres</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-3 h-3 inline mr-1" />
                Ville
              </label>
              <input
                type="text"
                placeholder="Ex: Strasbourg"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Culture Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🌱 Culture
              </label>
              <input
                type="text"
                placeholder="Ex: Riesling"
                value={filters.culture}
                onChange={(e) => handleFilterChange('culture', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Date Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-3 h-3 inline mr-1" />
                Période
              </label>
              <select
                value={filters.dateType}
                onChange={(e) => handleFilterChange('dateType', e.target.value)}
                className="input-field"
              >
                <option value="">Toutes</option>
                <option value="today">Aujourd'hui</option>
                <option value="tomorrow">Demain</option>
                <option value="this_week">Cette semaine</option>
                <option value="next_week">Semaine prochaine</option>
              </select>
            </div>

            {/* Urgent Filter */}
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isUrgent}
                  onChange={(e) => handleFilterChange('isUrgent', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Missions urgentes uniquement
                </span>
              </label>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(filters.search || filters.city || filters.culture || filters.dateType || filters.isUrgent) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Effacer tous les filtres
              </button>
            </div>
          )}
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Aucune mission trouvée
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos filtres ou revenez plus tard
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
