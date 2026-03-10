import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/middleware/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  console.log('=== API STATS GET ===')
  
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer tous les membres
    const { data: membres, error: errMembres } = await supabase
      .from('membres')
      .select(`
        *,
        utilisateurs!created_by (
          username,
          branche
        )
      `)

    if (errMembres) throw errMembres

    // Récupérer les utilisateurs
    const { data: utilisateurs, error: errUsers } = await supabase
      .from('utilisateurs')
      .select('id, username, branche, role, created_at')

    if (errUsers) throw errUsers

    // Calculer les statistiques
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1)

    // Statistiques générales
    const stats = {
      totalMembres: membres?.length || 0,
      totalUtilisateurs: utilisateurs?.length || 0,
      totalAdmins: utilisateurs?.filter(u => u.role === 'admin').length || 0,
      
      // Membres récents
      membresCeMois: membres?.filter(m => new Date(m.created_at) >= firstDayOfMonth).length || 0,
      membresCetteAnnee: membres?.filter(m => new Date(m.created_at) >= firstDayOfYear).length || 0,
      
      // Répartition par branche
      repartitionBranche: {} as Record<string, number>,
      
      // Évolution mensuelle
      evolutionMensuelle: {} as Record<string, number>,
      
      // Top créateurs
      topCreateurs: [] as { username: string; branche: string; count: number }[],
      
      // Répartition géographique
      repartitionVille: {} as Record<string, number>,
      repartitionCommune: {} as Record<string, number>
    }

    // Calculer répartition par branche
    const countByBranche: Record<string, number> = {}
    utilisateurs?.forEach(u => {
      countByBranche[u.branche] = (countByBranche[u.branche] || 0) + 1
    })
    stats.repartitionBranche = countByBranche

    // Calculer top créateurs
    const countByCreator: Record<string, { count: number; username: string; branche: string }> = {}
    membres?.forEach(m => {
      if (m.created_by) {
        if (!countByCreator[m.created_by]) {
          const creator = utilisateurs?.find(u => u.id === m.created_by)
          countByCreator[m.created_by] = {
            count: 0,
            username: creator?.username || 'Inconnu',
            branche: creator?.branche || 'Inconnue'
          }
        }
        countByCreator[m.created_by].count++
      }
    })

    stats.topCreateurs = Object.values(countByCreator)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculer évolution mensuelle (12 derniers mois)
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const moisKey = `${mois[date.getMonth()]} ${date.getFullYear()}`
      const count = membres?.filter(m => {
        const created = new Date(m.created_at)
        return created.getMonth() === date.getMonth() && 
               created.getFullYear() === date.getFullYear()
      }).length || 0
      stats.evolutionMensuelle[moisKey] = count
    }

    // Inverser pour avoir du plus ancien au plus récent
    stats.evolutionMensuelle = Object.fromEntries(
      Object.entries(stats.evolutionMensuelle).reverse()
    )

    // Répartition par ville
    membres?.forEach(m => {
      if (m.ville) {
        stats.repartitionVille[m.ville] = (stats.repartitionVille[m.ville] || 0) + 1
      }
      if (m.commune) {
        stats.repartitionCommune[m.commune] = (stats.repartitionCommune[m.commune] || 0) + 1
      }
    })

    return NextResponse.json(stats)

  } catch (error) {
    console.error('API Stats - Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul des statistiques' },
      { status: 500 }
    )
  }
}