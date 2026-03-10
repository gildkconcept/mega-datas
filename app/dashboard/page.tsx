'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MemberForm from '@/components/MemberForm'
import MembersList from '@/components/MembersList'
import { Member } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)

  // Vérifier l'authentification et les infos utilisateur
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        console.log('=== INFO UTILISATEUR ===')
        console.log('Données reçues de /api/auth/me:', data)
        
        if (!data.user) {
          console.log('Utilisateur non authentifié, redirection vers login')
          router.push('/login')
          return
        }
        
        setUserInfo(data.user)
        console.log('Utilisateur connecté - ID:', data.user.userId)
        console.log('Utilisateur connecté - Rôle:', data.user.role)
        console.log('Utilisateur connecté - Nom:', data.user.username)
      } catch (error) {
        console.error('Erreur vérification auth:', error)
      }
    }
    
    checkAuth()
  }, [router])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('=== CHARGEMENT DES MEMBRES ===')
      const res = await fetch('/api/members')
      console.log('Status de la réponse:', res.status)
      
      if (!res.ok) {
        if (res.status === 401) {
          console.log('Non authentifié, redirection vers login')
          router.push('/login')
          return
        }
        throw new Error(`Erreur ${res.status}`)
      }
      
      const data = await res.json()
      console.log('Membres reçus de l\'API:', data)
      console.log('Nombre de membres:', data.length)
      
      setMembers(data)
    } catch (error: any) {
      console.error('Erreur lors du chargement des membres:', error)
      setError(error.message || 'Erreur lors du chargement des membres')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userInfo) {
      console.log('UserInfo disponible, chargement des membres...')
      fetchMembers()
    }
  }, [userInfo])

  const handleMemberAdded = () => {
    console.log('Nouveau membre ajouté, rechargement de la liste...')
    fetchMembers()
  }

  if (loading && !userInfo) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Chargement de vos informations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          {userInfo && (
            <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
              Connecté en tant que : <span className="font-semibold">{userInfo.username}</span>
              <br />
              <span className="text-xs">ID: {userInfo.userId}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-8">
          <MemberForm onMemberAdded={handleMemberAdded} />
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Mes membres enregistrés
              </h2>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                Total : {members.length}
              </span>
            </div>
            
            {loading ? (
              <div className="bg-white shadow-md rounded-lg p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Chargement des membres...</p>
              </div>
            ) : (
              <>
                {members.length === 0 ? (
                  <div className="bg-white shadow-md rounded-lg p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun membre</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Commencez par enregistrer votre premier membre en utilisant le formulaire ci-dessus.
                    </p>
                  </div>
                ) : (
                  <MembersList members={members} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}