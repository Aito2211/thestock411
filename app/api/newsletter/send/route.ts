import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Newsletter send endpoint ready', sent: 0 })
}