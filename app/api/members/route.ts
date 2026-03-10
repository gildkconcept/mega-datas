import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/middleware/auth'
import { createMember, getMembersByUser, getAllMembers } from '@/services/members'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const memberData = await request.json()
    const member = await createMember(memberData, user.userId)

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Erreur création membre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du membre' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    console.log('API Members - User:', user)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Si admin, retourner tous les membres avec les infos du créateur
    if (user.role === 'admin') {
      console.log('API Members - Admin access: fetching all members')
      const members = await getAllMembers()
      return NextResponse.json(members)
    }

    // Sinon, retourner uniquement les membres de l'utilisateur
    console.log('API Members - User access: fetching own members')
    const members = await getMembersByUser(user.userId)
    return NextResponse.json(members)
  } catch (error) {
    console.error('Erreur récupération membres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des membres' },
      { status: 500 }
    )
  }
}