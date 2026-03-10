import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/middleware/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  console.log('=== API USERS GET ===')
  
  try {
    // Vérifier l'authentification
    const user = await getUserFromRequest(request)
    console.log('API Users - User from token:', user)

    if (!user) {
      console.log('API Users - Non authentifié')
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier le rôle admin
    if (user.role !== 'admin') {
      console.log('API Users - Accès refusé - rôle:', user.role)
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    console.log('API Users - Admin access granted')

    // Récupérer tous les utilisateurs
    const { data: users, error } = await supabase
      .from('utilisateurs')
      .select('id, username, phone, branche, role, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('API Users - Erreur Supabase:', error)
      throw error
    }

    console.log('API Users - Utilisateurs trouvés:', users?.length || 0)

    return NextResponse.json(users || [])
    
  } catch (error) {
    console.error('API Users - Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}