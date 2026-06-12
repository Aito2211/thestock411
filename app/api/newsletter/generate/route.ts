import { NextResponse } from 'next/server'

const FINNHUB = process.env.FINNHUB_API_KEY || ''
const ANTHROPIC = process.env.ANTHROPIC_API_KEY || ''
const FH = 'https://finnhub.io/api/v1'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fh(path: string): Promise<any> {
  try {
    const r = await fetch(FH + path + '&token=' + FINNHUB)
    return r.ok ? r.json() : {}
  } catch { return {} }
}

function todayStr() { return new Date().toISOString().split('T')[0] }

const TOP = ['AAPL','MSFT','NVDA','TSLA','AMZN','META','GOOGL','SPY','QQQ','AMD','JPM','LLY']

export async function GET() {
  try {
    const newsData = await fh('/news?category=general')
    const earningsData = await fh('/calendar/earnings?from=' + todayStr() + '&to=' + todayStr())
    const quotePromises = TOP.map(s => fh('/quote?symbol=' + s).then(q => ({ symbol: s, c: q.c, dp: q.dp })))
    const quotes = await Promise.all(quotePromises)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const news: any[] = Array.isArray(newsData) ? newsData.slice(0, 8) : []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const earnings: any[] = (earningsData && earningsData.earningsCalendar) ? earningsData.earningsCalendar.slice(0, 10) : []

    const movers = quotes
      .filter(q => q.c && q.dp)
      .sort((a, b) => Math.abs(b.dp) - Math.abs(a.dp))
      .slice(0, 6)
      .map(q => ({ symbol: q.symbol, price: q.c.toFixed(2), change: q.dp.toFixed(2), direction: q.dp >= 0 ? 'up' : 'down' }))

    const newsLines = news.map((n: { headline: string }) => n.headline).join(', ')
    const earningsLine = earnings.map((e: { symbol: string, hour: string }) => e.symbol + ' (' + (e.hour === 'bmo' ? 'before open' : 'after close') + ')').join(', ')
    const moversLine = movers.map(m => m.symbol + ' ' + (m.direction === 'up' ? '+' : '') + m.change + '%').join(', ')
    const dateStr = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

    if (ANTHROPIC) {
      const prompt = 'Write a professional daily market newsletter for The Stock411. Use this data: Movers: ' + moversLine + '. Earnings: ' + (earningsLine || 'None') + '. Headlines: ' + newsLines + '. Format with sections: MARKET SNAPSHOT, BIGGEST MOVERS, KEY STORIES, EARNINGS WATCH, BOTTOM LINE. Under 500 words. Date: ' + dateStr
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': ANTHROPIC, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-opus-4-6', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] })
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ai: any = await r.json()
      const content: string = ai && ai.content && ai.content[0] ? ai.content[0].text : ''
      if (content) return NextResponse.json({ date: todayStr(), content, movers, earningsCount: earnings.length, aiGenerated: true })
    }

    const spy = quotes.find(q => q.symbol === 'SPY')
    const spyTxt = spy ? (spy.dp >= 0 ? '+' : '') + spy.dp.toFixed(2) + '%' : 'flat'
    const content = '## The Stock411 Daily Brief\n### ' + dateStr + '\n\n**MARKET SNAPSHOT**\nSPY ' + spyTxt + '. Key movers: ' + (moversLine || 'mixed') + '.\n\n**BIGGEST MOVERS**\n' + movers.map(m => '- ' + m.symbol + ' ' + (m.direction === 'up' ? '+' : '') + m.change + '% at $' + m.price).join('\n') + '\n\n**KEY STORIES**\n' + news.slice(0,3).map((n: { headline: string }) => '- ' + n.headline).join('\n') + '\n\n**EARNINGS WATCH**\n' + (earningsLine || 'No major earnings today.') + '\n\n**BOTTOM LINE**\nStay disciplined. Add ANTHROPIC_API_KEY to Vercel for AI-generated briefs.'
    return NextResponse.json({ date: todayStr(), content, movers, earningsCount: earnings.length, aiGenerated: false })
  } catch (e) {
    return NextResponse.json({ error: String(e), content: 'Error generating.', movers: [], aiGenerated: false }, { status: 500 })
  }
}