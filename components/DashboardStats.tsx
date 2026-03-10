'use client'

import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
)

interface Stats {
  totalMembres: number
  totalUtilisateurs: number
  totalAdmins: number
  membresCeMois: number
  membresCetteAnnee: number
  repartitionBranche: Record<string, number>
  evolutionMensuelle: Record<string, number>
  topCreateurs: { username: string; branche: string; count: number }[]
  repartitionVille: Record<string, number>
  repartitionCommune: Record<string, number>
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState<'mois' | 'annee'>('mois')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/stats')
      if (!res.ok) throw new Error('Erreur chargement statistiques')
      const data = await res.json()
      setStats(data)
    } catch (error: any) {
      console.error('Erreur stats:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-500 text-center">
          <p>Erreur: {error || 'Impossible de charger les statistiques'}</p>
          <button
            onClick={fetchStats}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  // Données pour le graphique en camembert (répartition par branche)
  const pieData = {
    labels: Object.keys(stats.repartitionBranche),
    datasets: [
      {
        data: Object.values(stats.repartitionBranche),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF'
        ],
        borderWidth: 1
      }
    ]
  }

  // Données pour le graphique en barres (évolution)
  const barData = {
    labels: Object.keys(stats.evolutionMensuelle).slice(-6),
    datasets: [
      {
        label: 'Nouveaux membres',
        data: Object.values(stats.evolutionMensuelle).slice(-6),
        backgroundColor: '#36A2EB',
        borderRadius: 5
      }
    ]
  }

  // Données pour le graphique linéaire (tendance)
  const lineData = {
    labels: Object.keys(stats.evolutionMensuelle),
    datasets: [
      {
        label: 'Évolution des inscriptions',
        data: Object.values(stats.evolutionMensuelle),
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#36A2EB',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Cartes de statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="text-3xl font-bold mb-2">{stats.totalMembres}</div>
          <div className="text-sm opacity-90">Total membres</div>
          <div className="mt-2 text-xs opacity-75">+{stats.membresCeMois} ce mois</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="text-3xl font-bold mb-2">{stats.totalUtilisateurs}</div>
          <div className="text-sm opacity-90">Utilisateurs</div>
          <div className="mt-2 text-xs opacity-75">dont {stats.totalAdmins} admins</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="text-3xl font-bold mb-2">
            {Object.keys(stats.repartitionVille).length}
          </div>
          <div className="text-sm opacity-90">Villes couvertes</div>
          <div className="mt-2 text-xs opacity-75">
            {Object.keys(stats.repartitionCommune).length} communes
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="text-3xl font-bold mb-2">{stats.membresCetteAnnee}</div>
          <div className="text-sm opacity-90">Nouveaux cette année</div>
          <div className="mt-2 text-xs opacity-75">
            {Math.round((stats.membresCetteAnnee / stats.totalMembres) * 100)}% du total
          </div>
        </div>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique d'évolution */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Évolution des inscriptions</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeRange('mois')}
                className={`px-3 py-1 text-sm rounded ${
                  timeRange === 'mois'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                6 mois
              </button>
              <button
                onClick={() => setTimeRange('annee')}
                className={`px-3 py-1 text-sm rounded ${
                  timeRange === 'annee'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                12 mois
              </button>
            </div>
          </div>
          <div className="h-64">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        {/* Répartition par branche */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Répartition par branche</h3>
          <div className="h-64 flex items-center justify-center">
            {Object.keys(stats.repartitionBranche).length > 0 ? (
              <Pie data={pieData} options={chartOptions} />
            ) : (
              <p className="text-gray-500">Aucune donnée disponible</p>
            )}
          </div>
        </div>
      </div>

      {/* Deuxième ligne de graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top créateurs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top 5 des créateurs</h3>
          <div className="space-y-3">
            {stats.topCreateurs.map((creator, index) => (
              <div key={index} className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{creator.username}</span>
                      <span className="text-sm text-gray-500 ml-2">({creator.branche})</span>
                    </div>
                    <span className="font-bold text-blue-600">{creator.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-500 rounded-full h-2"
                      style={{
                        width: `${(creator.count / stats.topCreateurs[0].count) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition géographique */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top 5 des villes</h3>
          <div className="space-y-3">
            {Object.entries(stats.repartitionVille)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([ville, count], index) => (
                <div key={ville} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{ville}</span>
                      <span className="font-bold text-green-600">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-500 rounded-full h-2"
                        style={{
                          width: `${(count / Math.max(...Object.values(stats.repartitionVille))) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}