import { supabase } from '@/lib/supabase'

export interface Admin {
  id: string
  username: string
  phone: string
  branche: string
  password: string
  role: string
  created_at: string
}

export async function findAdminByUsername(username: string) {
  console.log('=== FIND ADMIN BY USERNAME ===')
  console.log('Recherche admin:', username)
  
  const { data, error } = await supabase
    .from('admin')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('Admin non trouvé')
    } else {
      console.error('Erreur Supabase:', error)
    }
    return null
  }
  
  console.log('Admin trouvé:', data.username)
  return data as Admin
}

export async function getAllAdmins() {
  const { data, error } = await supabase
    .from('admin')
    .select('id, username, phone, branche, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}