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
        service: memberData.service || null, // Ajout du champ service
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

    if (errMembres) throw errMembres

    // 2. Récupérer tous les utilisateurs
    const { data: utilisateurs, error: errUsers } = await supabase
      .from('utilisateurs')
      .select('id, username, branche')

    if (errUsers) throw errUsers

    // 3. Créer un dictionnaire pour un accès rapide
    const usersMap = new Map()
    utilisateurs?.forEach(user => {
      usersMap.set(user.id, {
        username: user.username,
        branche: user.branche
      })
    })

    // 4. Enrichir les membres avec les infos du créateur
    const membresEnrichis = membres?.map(membre => ({
      ...membre,
      creator: usersMap.get(membre.created_by) || null
    })) || []

    console.log('getAllMembers - membres enrichis:', membresEnrichis.length)
    return membresEnrichis as MemberWithCreator[]
    
  } catch (error) {
    console.error('Exception dans getAllMembers:', error)
    return [] as MemberWithCreator[]
  }
}