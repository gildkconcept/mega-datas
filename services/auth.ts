import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import * as jose from 'jose'
import { User } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET!
const secret = new TextEncoder().encode(JWT_SECRET)

export async function hashPassword(password: string): Promise<string> {
  console.log('hashPassword - password length:', password.length)
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  console.log('hashPassword - hash generated:', hash.substring(0, 20) + '...')
  return hash
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  console.log('=== COMPARE PASSWORD ===')
  console.log('comparePassword - password reçu:', password)
  console.log('comparePassword - hash stocké:', hash)
  console.log('comparePassword - type du hash:', typeof hash)
  console.log('comparePassword - longueur du hash:', hash.length)
  
  if (!hash || hash.length < 10) {
    console.error('comparePassword - hash invalide (trop court)')
    return false
  }
  
  try {
    console.log('comparePassword - tentative de comparaison...')
    const result = await bcrypt.compare(password, hash)
    console.log('comparePassword - résultat de bcrypt.compare:', result)
    return result
  } catch (error) {
    console.error('comparePassword - ERREUR:', error)
    return false
  }
}

export async function generateToken(user: any): Promise<string> {
  console.log('generateToken - génération pour utilisateur:', user.username)
  console.log('generateToken - userId:', user.id)
  console.log('generateToken - role:', user.role)
  
  const jwt = await new jose.SignJWT({ 
    userId: user.id, 
    username: user.username,
    role: user.role 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  console.log('generateToken - token généré avec succès')
  return jwt
}

export async function createUser(username: string, phone: string, branche: string, password: string) {
  console.log('createUser - création pour:', username)
  
  const hashedPassword = await hashPassword(password)
  console.log('createUser - hash généré:', hashedPassword.substring(0, 20) + '...')
  
  const { data, error } = await supabase
    .from('utilisateurs')
    .insert([
      {
        username,
        phone,
        branche,
        password: hashedPassword,
        role: 'user'
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('createUser - ERREUR Supabase:', error)
    throw error
  }
  
  console.log('createUser - utilisateur créé avec ID:', data.id)
  return data
}

export async function findUserByUsername(username: string) {
  console.log('=== FIND USER BY USERNAME ===')
  console.log('findUserByUsername - recherche dans table utilisateurs:', username)
  
  const { data, error } = await supabase
    .from('utilisateurs')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('findUserByUsername - utilisateur non trouvé dans table utilisateurs')
    } else {
      console.error('findUserByUsername - ERREUR Supabase:', error)
    }
    return null
  }
  
  console.log('findUserByUsername - utilisateur trouvé dans table utilisateurs:')
  console.log('  - ID:', data.id)
  console.log('  - Username:', data.username)
  console.log('  - Rôle:', data.role)
  console.log('  - Hash stocké:', data.password ? data.password.substring(0, 20) + '...' : 'MANQUANT')
  
  return data as User
}

// Nouvelle fonction pour trouver un admin
export async function findAdminByUsername(username: string) {
  console.log('=== FIND ADMIN BY USERNAME ===')
  console.log('findAdminByUsername - recherche dans table admin:', username)
  
  const { data, error } = await supabase
    .from('admin')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('findAdminByUsername - admin non trouvé dans table admin')
    } else {
      console.error('findAdminByUsername - ERREUR Supabase:', error)
    }
    return null
  }
  
  console.log('findAdminByUsername - admin trouvé dans table admin:')
  console.log('  - ID:', data.id)
  console.log('  - Username:', data.username)
  console.log('  - Rôle:', data.role)
  console.log('  - Hash stocké:', data.password ? data.password.substring(0, 20) + '...' : 'MANQUANT')
  
  return data
}