import { NextResponse } from 'next/server'

const RESEND_KEY = process.env.RESEND_API_KEY || ''
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || ''
const CRON_SECRET = process.env.CRON_SECRET || ''

export async function GET(request: Request) {
  // Protect this endpoint
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!RESEND_KEY) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 400 })

  try {
    // Get the AI-generated newsletter content
    const briefRes = await fetch(`${process.env.NEXT_PUBLIC_URL || 'https://thestock411-v2.vercel.app'}/api/newsletter/generate`)
    const brief = await briefRes.json()
    const { content, movers, date } = brief

    // Get all subscribers from Resend
    let subscribers: string[] = []
    if (AUDIENCE_ID) {
      const contactsRes = await fetch(`https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`, {
        headers: { 'Authorization': `Bearer ${RESEND_KEY}` }
      })
      const contactsData = await contactsRes.json()
      subscribers = (contactsData.data || [])
        .filter((c: { unsubscribed: boolean }) => !c.unsubscribed)
        .map((c: { email: string }) => c.email)
    }

    if (subscribers.length === 0) {
      return NextResponse.json({ message: 'No subscribers yet', sent: 0 })
    }

    // Convert markdown to HTML
    const htmlContent = content
      .replace(/^## (.+)$/gm, '<h2 style="font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#111827;margin:24px 0 4px">\$1</h2>')
      .replace(/^### (.+)$/gm, '<p style="color:#6b7280;font-size:13px;margin:0 0 16px">\$1</p>')
      .replace(/^**(.+)**$/gm, '<h3 style="font-size:14px;font-weight:800;text-transform:uppercase;color:#1e3a5f;margin:20px 0 8px;padding-bottom:4px;border-bottom:2px solid #e5e7eb">\$1</h3>')
      .replace(/**(.+?)**/g, '<strong>\$1</strong>')
      .replace(/^• (.+)$/gm, '<li style="margin-bottom:6px;color:#374151;font-size:14px">\$1</li>')
      .replace(/^([^<
].+)$/gm, '<p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 10px">\$1</p>')

    const moversHtml = (movers || []).map((m: {symbol:string,direction:string,change:string,price:string}) => `
      <td style="padding:12px;text-align:center;border-right:1px solid #f3f4f6">
        <div style="font-weight:800;font-size:14px;color:#111827">${m.symbol}</div>
        <div style="font-size:13px;font-weight:700;color:${m.direction==='up'?'#059669':'#dc2626'}">${m.direction==='up'?'+':''}${m.change}%</div>
        <div style="font-size:12px;color:#6b7280;font-family:monospace">$${m.price}</div>
      </td>`).join('')

    const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,BlinkMacSystemFont,sans-serif">
<div style="max-width:600px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
  <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:28px 32px">
    <div style="font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#93c5fd;margin-bottom:6px">The Stock411 Daily Brief</div>
    <h1 style="color:white;font-size:26px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px">Market Intelligence</h1>
    <p style="color:#bfdbfe;font-size:13px;margin:0">${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
  </div>
  ${moversHtml ? `<div style="background:#f8fafc;border-bottom:1px solid #e5e7eb"><table style="width:100%;border-collapse:collapse"><tr>${moversHtml}</tr></table></div>` : ''}
  <div style="padding:32px">${htmlContent}</div>
  <div style="padding:24px 32px;background:#1e3a5f;text-align:center">
    <a href="https://thestock411-v2.vercel.app/newsletter" style="display:inline-block;background:#facc15;color:#111827;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:800;font-size:14px">View Full Brief Online</a>
  </div>
  <div style="padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #f3f4f6">
    The Stock411 · Data delayed 15 min · Not financial advice<br>
    <a href="https://thestock411-v2.vercel.app" style="color:#9ca3af">thestock411.com</a>
  </div>
</div>
</body></html>`

    // Send batch email to all subscribers
    const dateFormatted = new Date().toLocaleDateString('en-US', { month:'short', day:'numeric' })
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'The Stock411 <brief@thestock411.com>',
        to: subscribers,
        subject: `The Stock411 Daily Brief — ${dateFormatted}`,
        html: emailHtml
      })
    })

    return NextResponse.json({ success: true, sent: subscribers.length, date })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}