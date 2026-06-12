import { NextResponse } from 'next/server'

const RESEND_KEY = process.env.RESEND_API_KEY || ''
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || ''
const CRON_SECRET = process.env.CRON_SECRET || ''
const SITE_URL = 'https://thestock411-v2.vercel.app'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (CRON_SECRET && searchParams.get('secret') !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!RESEND_KEY) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 400 })
  try {
    const briefRes = await fetch(SITE_URL + '/api/newsletter/generate')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brief: any = await briefRes.json()
    const content: string = brief.content || ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const movers: any[] = brief.movers || []
    let subscribers: string[] = []
    if (AUDIENCE_ID) {
      const cr = await fetch('https://api.resend.com/audiences/' + AUDIENCE_ID + '/contacts', { headers: { 'Authorization': 'Bearer ' + RESEND_KEY } })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cd: any = await cr.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subscribers = (cd.data || []).filter((c: any) => !c.unsubscribed).map((c: any) => c.email)
    }
    if (subscribers.length === 0) return NextResponse.json({ message: 'No subscribers yet', sent: 0 })
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const moversHtml = movers.map((m: { symbol:string, direction:string, change:string, price:string }) => '<td style="padding:12px;text-align:center"><div style="font-weight:800">' + m.symbol + '</div><div style="color:' + (m.direction === 'up' ? '#059669' : '#dc2626') + '">' + (m.direction === 'up' ? '+' : '') + m.change + '%</div><div style="font-size:12px">$' + m.price + '</div></td>').join('')
    const bodyHtml = content.replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^### (.+)$/gm, '<p style="color:#6b7280">$1</p>').replace(/^\*\*(.+)\*\*$/gm, '<h3>$1</h3>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/^- (.+)$/gm, '<li>$1</li>').replace(/^([^<\n].+)$/gm, '<p>$1</p>')
    const html = '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f8fa;font-family:sans-serif"><div style="max-width:600px;margin:32px auto;background:white;border-radius:16px;overflow:hidden"><div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:28px 32px"><h1 style="color:white;margin:0">The Stock411 Daily Brief</h1><p style="color:#bfdbfe;margin:4px 0 0">' + new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }) + '</p></div>' + (moversHtml ? '<table style="width:100%;border-collapse:collapse"><tr>' + moversHtml + '</tr></table>' : '') + '<div style="padding:32px">' + bodyHtml + '</div><div style="padding:24px;background:#1e3a5f;text-align:center"><a href="' + SITE_URL + '/newsletter" style="background:#facc15;color:#111827;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:800">View Online</a></div></div></body></html>'
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'The Stock411 <brief@thestock411.com>', to: subscribers, subject: 'The Stock411 Daily Brief - ' + dateStr, html })
    })
    return NextResponse.json({ success: true, sent: subscribers.length })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}