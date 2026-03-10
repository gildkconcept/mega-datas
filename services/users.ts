import { supabase } from '@/lib/supabase'

export async function getAllUsers() {
  console.log('=== getAllUsers ===')
  
  const { data, error } = await supabase
    .from('utilisateurs')
    .select('id, username, phone, branche, role, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur getAllUsers:', error)
    throw error
  }
  
  console.log('getAllUsers - utilisateurs trouvés:', data?.length || 0)
  return data
}