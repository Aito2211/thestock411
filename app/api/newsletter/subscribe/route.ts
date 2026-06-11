import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  console.log('Subscriber:', body.email)
  return NextResponse.json({ success: true })
}