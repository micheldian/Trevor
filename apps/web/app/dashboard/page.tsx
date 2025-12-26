'use client';

import { useState, useEffect } from 'react';
import { Plus, Briefcase, Users, Search, Filter, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import JobCreateForm from '@/components/jobs/JobCreateForm';
import ProfileCard from '@/components/profiles/ProfileCard';
import { apiClient } from '@/lib/api-client';

export default function DashboardPage() {
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    skills: '',
    radius: 50,
  });

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      searchProfiles();
    }
  }, [selectedJob]);

  const loadJobs = async () => {
    try {
      const data = await apiClient.getMyJobs();
      setJobs(data);
      if (data.length > 0 && !selectedJob) {
        setSelectedJob(data[0]);
      }
    } catch (err) {
      console.error('Error loading jobs:', err);
    }
  };

  const searchProfiles = async () => {
    if (!selectedJob) return;

    setLoading(true);
    try {
      const params: any = {
        latitude: selectedJob.latitude,
        longitude: selectedJob.longitude,
        radius: searchParams.radius,
      };

      // Add skills filter if specified
      if (searchParams.skills) {
        params.skills = searchParams.skills.split(',').map((s: string) => s.trim());
      }

      // Add availability filter based on job
      if (selectedJob.dateType && selectedJob.timeSlot) {
        params.availability = {
          dateType: selectedJob.dateType,
          timeSlot: selectedJob.timeSlot,
        };
      }

      const data = await apiClient.searchProfiles(params);
      setProfiles(data);
    } catch (err) {
      console.error('Error searching profiles:', err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJobCreated = () => {
    setShowJobForm(false);
    loadJobs();
  };

  const handlePublishJob = async (jobId: string) => {
    try {
      await apiClient.publishJob(jobId);
      loadJobs();
    } catch (err) {
      console.error('Error publishing job:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Employeur</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos missions et trouvez les meilleurs profils
            </p>
          </div>
          <button
            onClick={() => setShowJobForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle mission</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Missions actives</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {jobs.filter((j) => j.status === 'published').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Missions en brouillon</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {jobs.filter((j) => j.status === 'draft').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profils disponibles</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {profiles.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Mes missions
            </h2>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedJob?.id === job.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            job.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : job.status === 'draft'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{job.culture}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{job.nbPeople} personne(s)</span>
                        <span>{job.city}</span>
                        <span>{job.dateType.replace('_', ' ')}</span>
                      </div>
                    </div>
                    {job.status === 'draft' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePublishJob(job.id);
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Publier
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Search Section */}
        {selectedJob && (
          <div className="space-y-4">
            {/* Search Filters */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Profils disponibles pour "{selectedJob.title}"
                </h2>
                <button
                  onClick={searchProfiles}
                  disabled={loading}
                  className="btn-secondary text-sm flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Actualiser</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compétences (séparées par virgule)
                  </label>
                  <input
                    type="text"
                    value={searchParams.skills}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, skills: e.target.value })
                    }
                    placeholder="viticulture, tracteur"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rayon (km)
                  </label>
                  <input
                    type="number"
                    value={searchParams.radius}
                    onChange={(e) =>
                      setSearchParams({
                        ...searchParams,
                        radius: Number(e.target.value),
                      })
                    }
                    min="1"
                    max="200"
                    className="input-field"
                  />
                </div>
              </div>

              <button
                onClick={searchProfiles}
                disabled={loading}
                className="btn-primary w-full mt-4 flex items-center justify-center"
              >
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </button>
            </div>

            {/* Profiles Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : profiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    jobId={selectedJob.id}
                    onContactSuccess={(link) => {
                      console.log('Match created, WhatsApp link:', link);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun profil trouvé
                </h3>
                <p className="text-gray-600">
                  Essayez d'ajuster vos critères de recherche
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {jobs.length === 0 && (
          <div className="card text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune mission
            </h3>
            <p className="text-gray-600 mb-4">
              Créez votre première mission pour commencer à recruter
            </p>
            <button
              onClick={() => setShowJobForm(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Créer une mission</span>
            </button>
          </div>
        )}
      </div>

      {/* Job Create Modal */}
      {showJobForm && (
        <JobCreateForm
          onSuccess={handleJobCreated}
          onCancel={() => setShowJobForm(false)}
        />
      )}
    </DashboardLayout>
  );
}
