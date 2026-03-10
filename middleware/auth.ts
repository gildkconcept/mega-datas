import { NextRequest } from 'next/server'
import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET!

export async function verifyToken(request: NextRequest): Promise<{ userId: string; username: string; role: string } | null> {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return null
  }

  try {
    // jose utilise TextEncoder pour la clé secrète
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    
    // Le payload contient les données que vous avez signées
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string
    }
  } catch (error) {
    console.error('Erreur verifyToken avec jose:', error)
    return null
  }
}

export async function getUserFromRequest(request: NextRequest) {
  return await verifyToken(request)
}