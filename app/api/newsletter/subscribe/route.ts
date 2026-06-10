import { NextResponse } from 'next/server'

const RESEND_KEY = process.env.RESEND_API_KEY || ''
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || ''

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // If no Resend key, just log it (dev mode)
    if (!RESEND_KEY) {
      console.log('New subscriber (no Resend key):', email)
      return NextResponse.json({ success: true, message: 'Subscribed! (dev mode)' })
    }

    // Add contact to Resend Audience
    if (AUDIENCE_ID) {
      await fetch(`https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, unsubscribed: false })
      })
    }

    // Send welcome email
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'The Stock411 <brief@thestock411.com>',
        to: [email],
        subject: 'Welcome to The Stock411 Daily Brief',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, sans-serif; background: #f7f8fa; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 32px; text-align: center; }
  .header h1 { color: white; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px; }
  .header p { color: #93c5fd; font-size: 14px; margin: 0; }
  .body { padding: 32px; }
  .body h2 { font-size: 20px; color: #111827; font-weight: 700; margin-bottom: 12px; }
  .body p { color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
  .feature { display: flex; gap: 12px; padding: 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 10px; }
  .feature-icon { font-size: 20px; }
  .feature-text { font-size: 14px; color: #374151; }
  .feature-title { font-weight: 700; color: #111827; display: block; margin-bottom: 2px; }
  .cta { text-align: center; padding: 24px; border-top: 1px solid #f3f4f6; }
  .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; }
  .footer { padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>The Stock411</h1>
      <p>Daily Market Intelligence Brief</p>
    </div>
    <div class="body">
      <h2>You're subscribed!</h2>
      <p>Welcome to The Stock411 Daily Brief \u00e2\u0080\u0094 your AI-powered pre-market intelligence delivered every morning before the opening bell.</p>
      <div class="feature"><div class="feature-icon">\u00f0\u009f\u0093\u0088</div><div class="feature-text"><span class="feature-title">Yesterday's Big Movers</span>What moved and why \u00e2\u0080\u0094 with context.</div></div>
      <div class="feature"><div class="feature-icon">\u00f0\u009f\u0093\u00b0</div><div class="feature-text"><span class="feature-title">Top Market Stories</span>The 3 stories that actually matter today.</div></div>
      <div class="feature"><div class="feature-icon">\u00f0\u009f\u0097\u0093\u00ef\u00b8\u008f</div><div class="feature-text"><span class="feature-title">Earnings in Focus</span>Who's reporting and what to expect.</div></div>
      <div class="feature"><div class="feature-icon">\u00f0\u009f\u008e\u00af</div><div class="feature-text"><span class="feature-title">What to Watch Tomorrow</span>Key levels, catalysts, and setups.</div></div>
    </div>
    <div class="cta">
      <a href="https://thestock411-v2.vercel.app/newsletter" class="btn">View Today's Brief</a>
    </div>
    <div class="footer">The Stock411 \u00c2\u00b7 <a href="https://thestock411-v2.vercel.app/newsletter/unsubscribe?email=${email}" style="color:#9ca3af">Unsubscribe</a> \u00c2\u00b7 Data delayed 15 min \u00c2\u00b7 Not financial advice</div>
  </div>
</body></html>`
      })
    })

    return NextResponse.json({ success: true, message: 'Subscribed! Check your inbox.' })
  } catch (e) {
    console.error('Subscribe error:', e)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}