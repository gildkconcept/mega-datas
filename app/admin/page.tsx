'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MembersList from '@/components/MembersList'
import ExportPDF from '@/components/ExportPDF'
import DashboardStats from '@/components/DashboardStats'
import { MemberWithCreator, User } from '@/types'

export default function AdminPage() {
  const router = useRouter()
  const [members, setMembers] = useState<MemberWithCreator[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'stats' | 'members' | 'users'>('stats')
  
  // États pour la recherche avancée
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVille, setFilterVille] = useState('')
  const [filterCommune, setFilterCommune] = useState('')
  const [filterBranche, setFilterBranche] = useState('')
  const [filterDateDebut, setFilterDateDebut] = useState('')
  const [filterDateFin, setFilterDateFin] = useState('')
  const [filterCreateur, setFilterCreateur] = useState('')
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'nom_asc' | 'nom_desc'>('date_desc')
  const [showFilters, setShowFilters] = useState(false)
  
  const [filteredMembers, setFilteredMembers] = useState<MemberWithCreator[]>([])

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const authRes = await fetch('/api/auth/me')
        const authData = await authRes.json()
        
        if (!authData.user) {
          router.push('/login')
          return
        }
        
        if (authData.user.role !== 'admin') {
          router.push('/dashboard')
          return
        }

        await fetchData()
      } catch (error) {
        console.error('Erreur vérification auth:', error)
        setError('Erreur de vérification d\'authentification')
        setLoading(false)
      }
    }

    checkAuthAndFetchData()
  }, [router])

  useEffect(() => {
    if (!members.length) return

    let filtered = [...members]

    // Filtre texte (recherche dans nom, prénom, téléphone)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(m => 
        m.nom.toLowerCase().includes(term) ||
        m.prenom.toLowerCase().includes(term) ||
        m.telephone.includes(term) ||
        m.ville.toLowerCase().includes(term) ||
        m.commune.toLowerCase().includes(term)
      )
    }

    // Filtre par ville
    if (filterVille) {
      filtered = filtered.filter(m => m.ville === filterVille)
    }

    // Filtre par commune
    if (filterCommune) {
      filtered = filtered.filter(m => m.commune === filterCommune)
    }

    // Filtre par branche
    if (filterBranche) {
      filtered = filtered.filter(m => m.creator?.branche === filterBranche)
    }

    // Filtre par créateur
    if (filterCreateur) {
      filtered = filtered.filter(m => m.created_by === filterCreateur)
    }

    // Filtre par date
    if (filterDateDebut) {
      const debut = new Date(filterDateDebut)
      filtered = filtered.filter(m => new Date(m.created_at) >= debut)
    }
    if (filterDateFin) {
      const fin = new Date(filterDateFin)
      fin.setHours(23, 59, 59)
      filtered = filtered.filter(m => new Date(m.created_at) <= fin)
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'nom_asc':
          return a.nom.localeCompare(b.nom)
        case 'nom_desc':
          return b.nom.localeCompare(a.nom)
        default:
          return 0
      }
    })

    setFilteredMembers(filtered)
  }, [members, searchTerm, filterVille, filterCommune, filterBranche, filterCreateur, filterDateDebut, filterDateFin, sortBy])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [membersRes, usersRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/users')
      ])

      if (!membersRes.ok) throw new Error(`Erreur membres: ${membersRes.status}`)
      if (!usersRes.ok) throw new Error(`Erreur utilisateurs: ${usersRes.status}`)

      const membersData = await membersRes.json()
      const usersData = await usersRes.json()
      
      setMembers(membersData)
      setFilteredMembers(membersData)
      setUsers(usersData)
    } catch (error: any) {
      console.error('Erreur chargement données:', error)
      setError(error.message || 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  // Obtenir les valeurs uniques pour les filtres
  const villes = [...new Set(members.map(m => m.ville).filter(Boolean))]
  const communes = [...new Set(members.map(m => m.commune).filter(Boolean))]
  const branches = [...new Set(users.map(u => u.branche).filter(Boolean))]

  const resetFilters = () => {
    setSearchTerm('')
    setFilterVille('')
    setFilterCommune('')
    setFilterBranche('')
    setFilterCreateur('')
    setFilterDateDebut('')
    setFilterDateFin('')
    setSortBy('date_desc')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Chargement des données...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Administration MEGA-DATA
        </h1>

        {/* Onglets */}
        <div className="mb-6 border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-4 md:space-x-8">
            <button
              onClick={() => setActiveTab('stats')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Statistiques
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Membres ({filteredMembers.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👤 Utilisateurs ({users.length})
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'stats' && <DashboardStats />}

        {activeTab === 'members' && (
          <div>
            {/* Barre de recherche et bouton filtres */}
            <div className="mb-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="🔍 Rechercher par nom, prénom, téléphone, ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    showFilters
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Filtres
                  {filterVille || filterCommune || filterBranche || filterCreateur || filterDateDebut || filterDateFin ? (
                    <span className="ml-2 bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {Object.values({ filterVille, filterCommune, filterBranche, filterCreateur, filterDateDebut, filterDateFin }).filter(Boolean).length}
                    </span>
                  ) : null}
                </button>
                <ExportPDF members={filteredMembers} fileName="mega-data-membres" />
              </div>
            </div>

            {/* Panneau de filtres avancés */}
            {showFilters && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Filtres avancés</h3>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Réinitialiser
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Filtre ville */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <select
                      value={filterVille}
                      onChange={(e) => setFilterVille(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Toutes les villes</option>
                      {villes.map(ville => (
                        <option key={ville} value={ville}>{ville}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtre commune */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commune
                    </label>
                    <select
                      value={filterCommune}
                      onChange={(e) => setFilterCommune(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Toutes les communes</option>
                      {communes.map(commune => (
                        <option key={commune} value={commune}>{commune}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtre branche */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branche
                    </label>
                    <select
                      value={filterBranche}
                      onChange={(e) => setFilterBranche(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Toutes les branches</option>
                      {branches.map(branche => (
                        <option key={branche} value={branche}>{branche}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtre créateur */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enregistré par
                    </label>
                    <select
                      value={filterCreateur}
                      onChange={(e) => setFilterCreateur(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tous les créateurs</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date début */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Du
                    </label>
                    <input
                      type="date"
                      value={filterDateDebut}
                      onChange={(e) => setFilterDateDebut(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Date fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Au
                    </label>
                    <input
                      type="date"
                      value={filterDateFin}
                      onChange={(e) => setFilterDateFin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Tri */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trier par
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="date_desc">Plus récents d'abord</option>
                      <option value="date_asc">Plus anciens d'abord</option>
                      <option value="nom_asc">Nom A-Z</option>
                      <option value="nom_desc">Nom Z-A</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Résultats */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Liste des membres
              </h2>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {filteredMembers.length} résultat{filteredMembers.length > 1 ? 's' : ''}
                </span>
                {filteredMembers.length !== members.length && (
                  <span className="text-sm text-gray-500">
                    (sur {members.length} total)
                  </span>
                )}
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="bg-white shadow-md rounded-lg p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun résultat</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aucun membre ne correspond à vos critères de recherche.
                </p>
                <div className="mt-6">
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            ) : (
              <MembersList members={filteredMembers} showCreator={true} />
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Liste des utilisateurs
            </h2>
            {users.length === 0 ? (
              <div className="bg-white shadow-md rounded-lg p-8 text-center">
                <p className="text-gray-500">Aucun utilisateur</p>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom d'utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Téléphone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branche
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date d'inscription
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user: any) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.branche}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}