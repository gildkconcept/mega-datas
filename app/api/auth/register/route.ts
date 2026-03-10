import { NextRequest, NextResponse } from 'next/server'
import { createUser, findUserByUsername } from '@/services/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, phone, branche, password } = await request.json()

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await findUserByUsername(username)
    if (existingUser) {
      return NextResponse.json(
        { error: "Nom d'utilisateur déjà pris" },
        { status: 400 }
      )
    }

    // Créer l'utilisateur
    const user = await createUser(username, phone, branche, password)

    // Ne pas retourner le mot de passe
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: 'Utilisateur créé avec succès', user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur inscription:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    )
  }
}