import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/middleware/auth'

export async function GET(request: NextRequest) {
  const user = await verifyToken(request)
  
  if (!user) {
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({ 
    user: { 
      userId: user.userId,
      username: user.username,
      role: user.role 
    } 
  })
}