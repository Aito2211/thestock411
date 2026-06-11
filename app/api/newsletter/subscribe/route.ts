import { NextResponse } from 'next/server'

const RESEND_KEY = process.env.RESEND_API_KEY || ''
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || ''
const SITE_URL = 'https://thestock411-v2.vercel.app'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email: string = body.email || ''
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    if (!RESEND_KEY) {
      console.log('New subscriber (no Resend key yet):', email)
      return NextResponse.json({ success: true, message: 'Subscribed!' })
    }
    if (AUDIENCE_ID) {
      await fetch('https://api.resend.com/audiences/' + AUDIENCE_ID + '/contacts', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, unsubscribed: false })
      })
    }
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'The Stock411 <brief@thestock411.com>',
        to: [email],
        subject: 'Welcome to The Stock411 Daily Brief',
        html: '<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:40px 20px"><h1 style="color:#1e3a5f">You\'re subscribed!</h1><p>Welcome to The Stock411 Daily Brief -- your AI-powered pre-market intelligence delivered every morning.</p><p>You\'ll receive:</p><ul><li>Yesterday\'s top movers with context</li><li>Today\'s key market stories</li><li>Earnings calendar and expectations</li><li>Key levels and catalysts to watch</li></ul><a href="' + SITE_URL + '/newsletter" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px">View Today\'s Brief</a><p style="color:#9ca3af;font-size:12px;margin-top:24px">Not financial advice. Data delayed 15 min.</p></div>'
      })
    })
    return NextResponse.json({ success: true, message: 'Subscribed! Check your inbox.' })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}