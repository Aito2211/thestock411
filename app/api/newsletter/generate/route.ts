import { NextResponse } from 'next/server'

const FINNHUB = process.env.FINNHUB_API_KEY || ''
const ANTHROPIC = process.env.ANTHROPIC_API_KEY || ''
const FH = 'https://finnhub.io/api/v1'

async function fh(path: string) {
  try {
    const r = await fetch(`${FH}${path}&token=${FINNHUB}`, { next: { revalidate: 300 } })
    return r.ok ? r.json() : {}
  } catch { return {} }
}

function todayStr() { return new Date().toISOString().split('T')[0] }

const TOP_STOCKS = ['AAPL','MSFT','NVDA','TSLA','AMZN','META','GOOGL','SPY','QQQ','AMD','JPM','LLY']

export async function GET() {
  try {
    const [newsData, earningsData, ...quotes] = await Promise.all([
      fh('/news?category=general'),
      fh(`/calendar/earnings?from=${todayStr()}&to=${todayStr()}`),
      ...TOP_STOCKS.map(s => fh(`/quote?symbol=${s}`).then(q => ({ symbol: s, ...q })))
    ])

    const news = (Array.isArray(newsData) ? newsData : []).slice(0, 8)
    const earnings = (earningsData?.earningsCalendar || []).slice(0, 10)

    const movers = quotes
      .filter((q: Record<string,unknown>) => q.c && q.dp)
      .sort((a: Record<string,unknown>, b: Record<string,unknown>) => Math.abs(b.dp as number) - Math.abs(a.dp as number))
      .slice(0, 6)
      .map((q: Record<string,unknown>) => ({
        symbol: q.symbol, price: (q.c as number)?.toFixed(2),
        change: (q.dp as number)?.toFixed(2), direction: (q.dp as number) >= 0 ? 'up' : 'down'
      }))

    const newsHeadlines = news.map((n: Record<string,unknown>) => n.headline).join('\n- ')
    const earningsToday = earnings.map((e: Record<string,unknown>) => `${e.symbol} (${e.hour === 'bmo' ? 'before open' : 'after close'})`).join(', ')
    const moversText = movers.map((m: Record<string,string>) => `${m.symbol} ${m.direction === 'up' ? '+' : ''}${m.change}%`).join(', ')

    if (ANTHROPIC) {
      const prompt = `You are a professional financial newsletter writer for The Stock411 Daily Brief. Write a sharp, professional daily market newsletter.

REAL DATA:
TOP MOVERS: ${moversText || 'Mixed market action'}
EARNINGS TODAY: ${earningsToday || 'None scheduled'}
TOP NEWS:
- ${newsHeadlines}

Use this EXACT format:

## The Stock411 Daily Brief
### ${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}

**MARKET SNAPSHOT**
[2-3 sentences on market tone based on the movers data. Be specific about % moves.]

**YESTERDAY'S BIG MOVERS**
[Cover the top 3-4 movers with brief context on why they likely moved. Include the % changes.]

**TODAY'S KEY STORIES**
[Pick the 3 most important headlines. Give 2 sentences of analysis on each.]

**EARNINGS IN FOCUS**
[Cover today's earnings calendar. Who reports, what to expect, what consensus is.]

**WHAT TO WATCH TOMORROW**
[2-3 specific forward-looking catalysts: upcoming earnings, economic data, Fed events, technical levels.]

**BOTTOM LINE**
[One punchy paragraph \u00e2\u0080\u0094 the single most important takeaway for traders today.]

Keep it under 600 words. Be specific, data-driven, direct. No generic statements. Write like a seasoned trader, not a press release.`

      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': ANTHROPIC, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-opus-4-6', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] })
      })
      const aiData = await r.json()
      const content = aiData?.content?.[0]?.text || ''
      if (content) return NextResponse.json({ date: todayStr(), content, movers, earningsCount: earnings.length, aiGenerated: true })
    }

    // Template fallback
    const spy = quotes.find((q: Record<string,unknown>) => q.symbol === 'SPY') as Record<string,unknown>
    const content = `## The Stock411 Daily Brief
### ${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}

**MARKET SNAPSHOT**
Markets are showing ${(spy?.dp as number) >= 0 ? 'bullish' : 'bearish'} tone with SPY ${(spy?.dp as number) >= 0 ? '+' : ''}${(spy?.dp as number)?.toFixed(2)}%. Key movers today: ${moversText || 'mixed action across sectors'}.

**TODAY'S BIG MOVERS**
${movers.map((m: Record<string,string>) => `\u00e2\u0080\u00a2 **${m.symbol}** ${m.direction === 'up' ? '+' : ''}${m.change}% at $${m.price}`).join('\n')}

**TODAY'S KEY STORIES**
${news.slice(0,4).map((n: Record<string,unknown>) => `\u00e2\u0080\u00a2 ${n.headline}`).join('\n')}

**EARNINGS IN FOCUS**
${earningsToday ? `Reporting today: ${earningsToday}` : 'No major earnings scheduled today.'}

**WHAT TO WATCH TOMORROW**
Watch for continuation of today's moves. Key levels: SPY $${(spy?.c as number)?.toFixed(0)} support/resistance. Monitor pre-market futures for direction.

**BOTTOM LINE**
${movers[0] ? `${movers[0].symbol} is the story today at ${movers[0].direction === 'up' ? '+' : ''}${movers[0].change}%.` : 'Mixed market action.'} Stay disciplined, manage risk, and let the market come to you.

*Add ANTHROPIC_API_KEY to Vercel env vars for AI-generated briefs.*`

    return NextResponse.json({ date: todayStr(), content, movers, earningsCount: earnings.length, aiGenerated: false })
  } catch (e) {
    return NextResponse.json({ error: String(e), content: 'Failed to generate newsletter.', movers: [], aiGenerated: false }, { status: 500 })
  }
}