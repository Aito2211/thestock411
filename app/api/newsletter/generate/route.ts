import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ content: 'Newsletter coming soon', movers: [], date: new Date().toISOString().split('T')[0], aiGenerated: false })
}