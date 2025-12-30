'use client';

import { useRouter } from 'next/navigation';
import { Briefcase, Users, ArrowRight } from 'lucide-react';

export default function ChooseRolePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Bienvenue sur Trevor
          </h1>
          <p className="text-lg text-gray-600">
            Choisissez votre profil pour commencer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employer Card */}
          <div
            onClick={() => router.push('/register-employer')}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all hover:scale-105 border-2 border-transparent hover:border-primary-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <Briefcase className="w-10 h-10 text-primary-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Je suis Employeur
              </h2>

              <p className="text-gray-600 mb-6">
                Je recherche des travailleurs agricoles pour mes missions
              </p>

              <ul className="text-left text-sm text-gray-600 space-y-2 mb-8 w-full">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Publier des offres de missions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Rechercher des profils qualifiés</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Gérer vos équipes</span>
                </li>
              </ul>

              <button className="w-full btn-primary flex items-center justify-center space-x-2 py-3">
                <span>Continuer en tant qu'employeur</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Worker Card */}
          <div
            onClick={() => router.push('/register-worker')}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all hover:scale-105 border-2 border-transparent hover:border-green-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Je suis Travailleur
              </h2>

              <p className="text-gray-600 mb-6">
                Je recherche des missions agricoles dans ma région
              </p>

              <ul className="text-left text-sm text-gray-600 space-y-2 mb-8 w-full">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Trouver des missions près de chez moi</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Postuler en un clic</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Être contacté directement</span>
                </li>
              </ul>

              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-6 py-3 transition-colors flex items-center justify-center space-x-2">
                <span>Continuer en tant que travailleur</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
