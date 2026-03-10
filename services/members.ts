import { supabase } from '@/lib/supabase'
import { Member, MemberWithCreator } from '@/types'

export async function createMember(memberData: Omit<Member, 'id' | 'created_at'>, userId: string) {
  console.log('createMember - userId:', userId)
  console.log('createMember - memberData:', memberData)
  
  const { data, error } = await supabase
    .from('membres')
    .insert([
      {
        nom: memberData.nom,
        prenom: memberData.prenom,
        quartier: memberData.quartier,
        commune: memberData.commune,
        ville: memberData.ville,
        telephone: memberData.telephone,
        created_by: userId
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Erreur createMember:', error)
    throw error
  }
  
  console.log('createMember - membre créé:', data)
  return data
}

export async function getMembersByUser(userId: string) {
  console.log('=== getMembersByUser ===')
  console.log('userId reçu:', userId)
  
  if (!userId) {
    console.error('getMembersByUser - userId est null')
    return [] as Member[]
  }
  
  try {
    const { data, error } = await supabase
      .from('membres')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur getMembersByUser:', error)
      throw error
    }
    
    console.log('getMembersByUser - membres trouvés:', data?.length || 0)
    return data as Member[]
  } catch (error) {
    console.error('Exception dans getMembersByUser:', error)
    return [] as Member[]
  }
}

export async function getAllMembers() {
  console.log('=== getAllMembers ===')
  
  try {
    // 1. Récupérer tous les membres
    const { data: membres, error: errMembres } = await supabase
      .from('membres')
      .select('*')
      .order('created_at', { ascending: false })

    if (errMembres) {
      console.error('Erreur récupération membres:', errMembres)
      throw errMembres
    }

    console.log('getAllMembers - membres bruts:', membres?.length || 0)

    // 2. Récupérer tous les utilisateurs
    const { data: utilisateurs, error: errUsers } = await supabase
      .from('utilisateurs')
      .select('id, username, branche, phone')

    if (errUsers) {
      console.error('Erreur récupération utilisateurs:', errUsers)
      throw errUsers
    }

    console.log('getAllMembers - utilisateurs trouvés:', utilisateurs?.length || 0)

    // 3. Créer un dictionnaire des utilisateurs pour un accès rapide
    const usersMap = new Map()
    utilisateurs?.forEach(user => {
      usersMap.set(user.id, {
        username: user.username,
        branche: user.branche,
        phone: user.phone
      })
    })

    // 4. Enrichir les membres avec les infos du créateur
    const membresEnrichis = membres?.map(membre => {
      const creator = usersMap.get(membre.created_by)
      return {
        ...membre,
        creator: creator || null
      }
    }) || []

    console.log('getAllMembers - membres enrichis:', membresEnrichis.length)
    
    // Log du premier élément pour vérifier la structure
    if (membresEnrichis.length > 0) {
      console.log('getAllMembers - premier membre:', membresEnrichis[0])
    }

    return membresEnrichis as MemberWithCreator[]
    
  } catch (error) {
    console.error('Exception dans getAllMembers:', error)
    return [] as MemberWithCreator[]
  }
}

// Optionnel : fonction pour obtenir les statistiques
export async function getMembersStats() {
  console.log('=== getMembersStats ===')
  
  try {
    const { data, error } = await supabase
      .from('membres')
      .select('created_by')

    if (error) throw error

    // Compter par créateur
    const stats = new Map()
    data?.forEach(m => {
      const count = stats.get(m.created_by) || 0
      stats.set(m.created_by, count + 1)
    })

    return Object.fromEntries(stats)
  } catch (error) {
    console.error('Erreur getMembersStats:', error)
    return {}
  }
}