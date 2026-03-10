import { NextRequest, NextResponse } from 'next/server'
import { findUserByUsername, findAdminByUsername, comparePassword, generateToken } from '@/services/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  console.log('=== LOGIN API CALLED ===')
  
  try {
    const body = await request.json()
    const { username, password } = body
    
    console.log('Login attempt - username:', username)
    console.log('Login attempt - password provided:', password ? 'Oui' : 'Non')
    
    if (!username || !password) {
      console.log('Login - nom d\'utilisateur ou mot de passe manquant')
      return NextResponse.json(
        { error: "Nom d'utilisateur et mot de passe requis" },
        { status: 400 }
      )
    }

    // 1. Chercher d'abord dans la table admin
    console.log('Login - recherche dans table admin...')
    let user = await findAdminByUsername(username)
    let userSource = 'admin'

    // 2. Si pas trouvé dans admin, chercher dans utilisateurs
    if (!user) {
      console.log('Login - recherche dans table utilisateurs...')
      user = await findUserByUsername(username)
      userSource = 'utilisateurs'
    }

    // 3. Si toujours pas trouvé
    if (!user) {
      console.log('Login - utilisateur non trouvé dans aucune table')
      return NextResponse.json(
        { error: "Nom d'utilisateur ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    console.log('Login - utilisateur trouvé dans table:', userSource)
    console.log('Login - ID utilisateur:', user.id)
    console.log('Login - Rôle utilisateur:', user.role)
    console.log('Login - Nom complet:', user.username)
    console.log('Login - Hash stocké (premiers caractères):', user.password ? user.password.substring(0, 30) + '...' : 'MANQUANT')
    console.log('Login - Longueur du hash:', user.password?.length || 0)

    // Vérifier que le hash commence par $2a$ (format bcrypt)
    if (!user.password.startsWith('$2a$')) {
      console.error('Login - ERREUR: Le hash ne commence pas par $2a$ (pas un hash bcrypt valide)')
    }

    // Vérifier le mot de passe
    console.log('Login - vérification du mot de passe...')
    const isValid = await comparePassword(password, user.password)
    console.log('Login - résultat vérification mot de passe:', isValid)

    if (!isValid) {
      console.log('Login - mot de passe incorrect')
      return NextResponse.json(
        { error: "Nom d'utilisateur ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    // Générer le token
    console.log('Login - génération du token...')
    const token = await generateToken(user)
    console.log('Login - token généré avec succès')

    // Stocker le token dans un cookie
    console.log('Login - stockage du cookie...')
    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })
    console.log('Login - cookie stocké avec succès')

    // Ne pas retourner le mot de passe
    const { password: _, ...userWithoutPassword } = user

    console.log('Login - connexion réussie pour:', username)
    console.log('Login - réponse envoyée avec rôle:', user.role)

    return NextResponse.json({
      message: 'Connexion réussie',
      user: userWithoutPassword
    })
    
  } catch (error) {
    console.error('=== LOGIN ERROR ===')
    console.error('Login - erreur détaillée:', error)
    
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}